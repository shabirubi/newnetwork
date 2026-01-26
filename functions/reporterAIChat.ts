import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { message, reporterName, reporterRole, reporterSpecialty, reporterBio, userProfile } = body;

    if (!message || !reporterName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // בניית הפרומפט עם התאמה אישית
    let personalContext = '';
    if (userProfile && userProfile.interactionCount >= 3) {
      const topTopics = Object.entries(userProfile.preferredTopics || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([topic]) => topic);
      
      if (topTopics.length > 0) {
        personalContext = `\n\nהערה חשובה: המשתמש הראה עניין בנושאים: ${topTopics.join(', ')}. התייחס לזה בתשובה שלך באופן טבעי.`;
      }

      if (userProfile.depthLevel === 'deep') {
        personalContext += '\nהמשתמש מעדיף תשובות מעמיקות ומפורטות.';
      } else if (userProfile.depthLevel === 'casual') {
        personalContext += '\nהמשתמש מעדיף תשובות קצרות וישירות.';
      }

      if (userProfile.tonePreference === 'casual') {
        personalContext += '\nהשתמש בטון יותר חברי וכמו שמדברים ברחוב.';
      } else if (userProfile.tonePreference === 'formal') {
        personalContext += '\nהשתמש בטון פורמלי ומקצועי.';
      }
    }

    const systemPrompt = `אתה ${reporterName}, ${reporterRole} עיתונאי/ת מקצועי/ת.
התמחות שלך: ${reporterSpecialty}
${reporterBio ? `רקע: ${reporterBio}` : ''}

תפקידך:
1. לנהל שיחה כמו עיתונאי אמיתי - לשאול שאלות נגדיות, לאתגר הנחות, לבקש הבהרות
2. לדבר בגוף ראשון כ-${reporterName}
3. להשתמש בידע מהשטח והניסיון שלך
4. לא רק לענות - גם לשאול שאלות חוזרות שיעמיקו את הדיון
5. לעיתים לבקש מקורות, לאתגר טענות, או להציע זווית אחרת

בכ-65% מהמקרים, במקום רק לענות - שאל שאלה נגדית או מאתגרת שתגרום למשתמש לחשוב יותר עמוק.
דוגמאות: "רגע, מאיפה הביטחון הזה?", "האם שקלת את הצד השני?", "מה המקור למידע הזה?"

${personalContext}

חשוב ביותר: ענה תמיד בעברית בלבד! אל תשתמש באנגלית או בשפה זרה אחרת. השתמש בעברית שוטפת והיה אותנטי כעיתונאי בשטח.

כללי כתיבה לקריינות (חובה):
- אל תכתוב אימוג'ים או סמלים כלל
- אל תשתמש בנקודות רבות (...) או בפיסוק מוגזם
- כתוב משפטים רציפים וברורים שקל לקרוא בקול
- השתמש רק באותיות עבריות, מספרים, ופיסוק רגיל (נקודה, פסיק, סימן שאלה, סימן קריאה)
- התשובה צריכה להיות נקייה ומתאימה לקריינות וידאו`;

    // קריאה ל-LLM
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${systemPrompt}\n\nהמשתמש שואל: "${message}"\n\nענה כ-${reporterName}:`
    });

    return Response.json({ 
      response: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});