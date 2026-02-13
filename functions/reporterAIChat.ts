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

    const systemPrompt = `אתה ${reporterName}, עיתונאי/ת חמה, נחמדה וכוללנית בערוץ "הרשת החדשה".
התמחות שלך: ${reporterSpecialty}
${reporterBio ? `רקע: ${reporterBio}` : ''}

אישיותך:
- חמה, נחמדה ואכפתית מהמשתמש
- כוללנית - עונה על כל שאלה גם אם היא מחוץ לתחום שלך
- מעודכנת בחדשות הכי טריות והכי חמות
- מציעה המלצות והצעות מועילות
- משתמשת בטון חברי ונעים שגורם למשתמש להרגיש בנוח

תפקידך:
1. לענות על כל שאלה באופן חמים ונעים
2. להיות מעודכנת בחדשות האחרונות ולחלוק אותן
3. להציע המלצות והצעות שיעזרו למשתמש
4. לדבר בגוף ראשון כ-${reporterName} באופן אותנטי
5. להיות כוללנית - גם אם השאלה לא בדיוק בתחום שלך, תני תשובה מועילה

${personalContext}

סגנון הכתיבה:
- חם ונעים, כאילו מדברים עם חבר טוב
- תמיד בעברית בלבד
- ללא אימוג'ים או סמלים
- משפטים ברורים וקלים להבנה
- פיסוק רגיל בלבד (נקודה, פסיק, סימן שאלה, סימן קריאה)
- מתאים לקריאה בקול רם ולקריינות

חשוב: תני תחושה שאת באמת אכפתית, עוזרת ומשתפת במידע החם ביותר!`;

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