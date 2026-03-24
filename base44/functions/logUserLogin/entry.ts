import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !user.email) {
      return Response.json({ error: 'משתמש לא מחובר' }, { status: 401 });
    }

    // שלח אימייל הודעת התחברות
    await base44.integrations.Core.SendEmail({
      to: 'seyorlayla@gmail.com',
      subject: `🔐 התחברות חדשה - ${user.full_name || user.email}`,
      body: `
משתמש התחבר בהצלחה!

📧 אימייל: ${user.email}
👤 שם: ${user.full_name || 'לא צויין'}
🕐 זמן: ${new Date().toLocaleString('he-IL')}
🔑 תפקיד: ${user.role === 'admin' ? 'מנהל' : 'משתמש רגיל'}

---
הודעה זו נשלחה מ-הרשת החדשה
      `
    });

    // שמור נתוני התחברות בפרופיל המשתמש
    await base44.auth.updateMe({
      last_login: new Date().toISOString(),
      login_count: (user.login_count || 0) + 1
    });

    return Response.json({ 
      success: true,
      message: 'התחברות נרשמה בהצלחה',
      user: user.email
    });
  } catch (error) {
    console.error('Login tracking error:', error);
    return Response.json({ 
      error: 'שגיאה בתיעוד התחברות',
      details: error.message 
    }, { status: 500 });
  }
});