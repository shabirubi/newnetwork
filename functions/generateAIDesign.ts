import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { prompt } = body;

    if (!prompt || !prompt.trim()) {
      return Response.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // Generate image using AI
    const imageResponse = await base44.asServiceRole.integrations.Core.GenerateImage({
      prompt: prompt
    });

    if (!imageResponse || !imageResponse.url) {
      return Response.json({ error: 'Failed to generate image' }, { status: 500 });
    }

    return Response.json({
      success: true,
      image_url: imageResponse.url
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message || 'Generation failed'
    }, { status: 500 });
  }
});