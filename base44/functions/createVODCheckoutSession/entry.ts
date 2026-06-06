import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

        const origin = req.headers.get("origin") || "https://app.base44.com";

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            line_items: [
                {
                    price_data: {
                        currency: "ils",
                        product_data: {
                            name: "מנוי פרמיום VOD - הרשת החדשה",
                            description: "גישה בלתי מוגבלת לכל תוכן ה-VOD, ללא פרסומות, ארכיון מלא ושידורים בלעדיים",
                            images: [],
                        },
                        unit_amount: 2990, // 29.90 ILS in agorot
                        recurring: {
                            interval: "month",
                        },
                    },
                    quantity: 1,
                },
            ],
            success_url: `${origin}/?vod_subscribed=true`,
            cancel_url: `${origin}/`,
            metadata: {
                base44_app_id: Deno.env.get("BASE44_APP_ID"),
                product_type: "vod_premium",
            },
        });

        return Response.json({ url: session.url });
    } catch (error) {
        console.error("VOD Checkout error:", error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});