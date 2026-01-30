import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, style } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const enhancedPrompt = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional AI image prompt engineer. Enhance this image generation prompt to get the best results.

Original prompt: "${prompt}"
${style ? `Desired style: ${style}` : ''}

Rules:
1. Keep the core concept from the original
2. Add specific details about: lighting, composition, quality, style
3. Add technical terms like "8k", "highly detailed", "professional photography" when relevant
4. Keep it concise (under 150 words)
5. Write in English
6. NO explanations, ONLY return the enhanced prompt

Enhanced prompt:`,
      response_json_schema: null
    });

    return Response.json({
      enhanced_prompt: enhancedPrompt.trim()
    });

  } catch (error) {
    console.error('Error enhancing prompt:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});