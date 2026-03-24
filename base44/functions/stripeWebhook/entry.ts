import Stripe from 'npm:stripe@17.5.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  
  if (!signature || !webhookSecret) {
    console.error('Missing signature or webhook secret');
    return Response.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return Response.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userEmail = session.metadata?.user_email || session.customer_details?.email;
        
        if (!userEmail) {
          console.error('No user email in session');
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        
        const endDate = new Date(subscription.current_period_end * 1000);
        
        await base44.asServiceRole.entities.Subscription.create({
          user_email: userEmail,
          plan_type: subscription.items.data[0].plan.interval === 'year' ? 'yearly' : 'monthly',
          status: 'active',
          stripe_subscription_id: subscription.id,
          stripe_customer_id: session.customer,
          start_date: new Date(subscription.current_period_start * 1000).toISOString(),
          end_date: endDate.toISOString(),
          auto_renew: true
        });
        
        console.log('Subscription created for:', userEmail);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        
        const endDate = new Date(subscription.current_period_end * 1000);
        
        await base44.asServiceRole.entities.Subscription.updateMany(
          { stripe_subscription_id: subscription.id },
          {
            status: subscription.status === 'active' ? 'active' : 'cancelled',
            end_date: endDate.toISOString()
          }
        );
        
        console.log('Subscription updated:', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        await base44.asServiceRole.entities.Subscription.updateMany(
          { stripe_subscription_id: subscription.id },
          { status: 'cancelled' }
        );
        
        console.log('Subscription cancelled:', subscription.id);
        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});