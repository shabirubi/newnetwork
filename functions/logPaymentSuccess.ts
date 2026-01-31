import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userEmail, sessionId, priceId } = await req.json();

    if (!userEmail) {
      return Response.json({ error: 'משתמש לא זוהה' }, { status: 401 });
    }

    // יצירת/עדכון רשומת מנוי
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const subscription = await base44.asServiceRole.entities.Subscription.create({
      user_email: userEmail,
      plan_type: 'monthly',
      status: 'active',
      stripe_subscription_id: sessionId,
      start_date: new Date().toISOString(),
      end_date: endDate.toISOString(),
      auto_renew: true
    });

    // שלח הודעת התשלום בהצלחה למנהל
    await base44.integrations.Core.SendEmail({
      to: 'seyorlayla@gmail.com',
      subject: `💰 תשלום חודשי בוצע בהצלחה - ${userEmail}`,
      body: `
משתמש שילם בהצלחה עבור מנוי חודשי!

📧 אימייל: ${userEmail}
💳 סכום: ₪49.90
📅 סוג: מנוי חודשי
🔄 הצידוד הבא: ${new Date(endDate).toLocaleDateString('he-IL')}
🆔 Session ID: ${sessionId}
🕐 זמן: ${new Date().toLocaleString('he-IL')}

---
מנוי פעיל - גישה מלאה לכל הכלים
      `
    });

    // שמור בפרופיל המשתמש
    await base44.auth.updateMe({
      has_active_subscription: true,
      subscription_last_payment: new Date().toISOString()
    }).catch(e => console.log('Could not update user profile:', e));

    console.log('✅ Payment logged successfully:', userEmail);

    return Response.json({ 
      success: true,
      subscription: subscription,
      message: 'מנוי הופעל בהצלחה'
    });
  } catch (error) {
    console.error('❌ Payment logging error:', error);
    return Response.json({ 
      error: 'שגיאה בתיעוד התשלום',
      details: error.message 
    }, { status: 500 });
  }
});