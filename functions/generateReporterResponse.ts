import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { chatId, reporterId, reporterName, reporterSpecialty, message } = body;

    if (!chatId || !reporterId || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get reporter info
    const reporter = await base44.asServiceRole.entities.Reporter.get(reporterId);

    // Generate response using AI
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `אתה ${reporterName}, כתב חדשות מומחה ב${reporterSpecialty || 'חדשות כללית'}. 
      
השאלה של המשתמש: "${message}"

תן תשובה מקצועית, קצרה וברורה (2-3 משפטים) כמו שכתב חדשות אמיתי היה עונה. השב בעברית בלבד.`,
      add_context_from_internet: false
    });

    // Save the reporter's response
    await base44.asServiceRole.entities.ReporterChat.create({
      reporter_id: reporterId,
      reporter_name: reporterName,
      user_email: user.email,
      user_name: user.full_name,
      message: message,
      sender_type: 'user',
      response_text: response
    });

    return Response.json({ 
      success: true,
      response: response
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});