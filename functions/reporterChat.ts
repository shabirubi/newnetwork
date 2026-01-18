import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reporterName, reporterSpecialty, reporterCategories, reporterBio, userMessage } = await req.json();

    if (!reporterName || !userMessage) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `אתה ${reporterName}, כתב/כתבת חדשות עם התמחות ב-${reporterSpecialty}. 
קטגוריות שבהן אתה עובד: ${reporterCategories || 'כללי'}.
ביוגרפיה: ${reporterBio || 'כתב/כתבת חדשות'}

המשתמש שלח לך הודעה: "${userMessage}"

תשובתך צריכה להיות טבעית, מעניינת ולא ארוכה יותר מ-3 משפטים. השיבה בעברית בלבד.`,
      add_context_from_internet: true
    });

    return Response.json({ 
      success: true,
      message: response 
    });
  } catch (error) {
    console.error('Reporter chat error:', error);
    return Response.json({ 
      error: 'Failed to generate response',
      details: error.message 
    }, { status: 500 });
  }
});