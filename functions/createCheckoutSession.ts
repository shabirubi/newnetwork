import Stripe from 'npm:stripe@17.5.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { priceId, userEmail, couponCode } = await req.json();

    if (!userEmail) {
      return Response.json({ error: 'נדרש אימייל משתמש' }, { status: 400 });
    }

    // בדוק אם קוד קופון תקין
    if (couponCode) {
      if (couponCode === '0248') {
        // יצירת מנוי ידני עם קוד קופון
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        await base44.asServiceRole.entities.Subscription.create({
          user_email: userEmail,
          plan_type: 'monthly',
          status: 'active',
          coupon_code: '0248',
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          auto_renew: false
        });

        return Response.json({ 
          success: true, 
          coupon_used: true,
          message: 'מנוי הופעל בהצלחה עם קוד קופון!' 
        });
      } else {
        return Response.json({ error: 'קוד קופון לא תקין' }, { status: 400 });
      }
    }

    // יצירת לקוח Stripe או שימוש בקיים
    let customer;
    const existingCustomers = await stripe.customers.list({ email: userEmail, limit: 1 });
    
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({ email: userEmail });
    }

    // בדוק ש-priceId קיים
    if (!priceId) {
      return Response.json({ error: 'נדרש ID של מחיר' }, { status: 400 });
    }

    // יצירת Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/VideoEditor?success=true`,
      cancel_url: `${req.headers.get('origin')}/Subscription?cancelled=true`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_email: userEmail,
        app_name: 'WarRoom'
      }
    });

    console.log('✅ Checkout session created:', { sessionId: session.id, email: userEmail, priceId });

    return Response.json({ 
      success: true,
      sessionId: session.id, 
      url: session.url 
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});