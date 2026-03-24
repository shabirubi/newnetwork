import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const stripe = await import('npm:stripe@14.0.0').then(m => new m.default(Deno.env.get('STRIPE_SECRET_KEY')));

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const { priceId } = await req.json();
    
    if (!priceId) {
      return Response.json({ error: 'priceId required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${new URL(req.url).origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${new URL(req.url).origin}/Subscription`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID')
      }
    });

    console.log('Checkout session created:', session.id);

    return Response.json({ 
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('ERROR:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});