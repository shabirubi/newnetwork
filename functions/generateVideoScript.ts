import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { description } = await req.json();

    if (!description) {
      return Response.json({ error: 'Missing description' }, { status: 400 });
    }

    // Use LLM to generate a professional script based on description
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional video script writer. Create a clear, engaging script based on this description:

${description}

Requirements:
- Write in Hebrew (עברית)
- Script should be 200-400 words (3-5 minutes when spoken)
- Use clear, simple language
- Include natural pauses and emphasis points
- Make it engaging and informative
- Structure: Opening hook → Main content → Call to action/conclusion

Return ONLY the script text, nothing else.`,
      add_context_from_internet: false,
    });

    const script = response?.trim() || '';

    if (!script) {
      return Response.json({ error: 'Failed to generate script' }, { status: 500 });
    }

    return Response.json({
      success: true,
      script,
      wordCount: script.split(' ').length,
      estimatedDuration: Math.ceil(script.split(' ').length / 2.5),
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message || 'Script generation failed' 
    }, { status: 500 });
  }
});