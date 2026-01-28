import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, imageUrl, aspectRatio = "16:9" } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const lumaApiKey = Deno.env.get('LUMA_API_KEY');
    if (!lumaApiKey) {
      return Response.json({ error: 'LUMA_API_KEY not configured' }, { status: 500 });
    }

    // Build payload for Luma API - using ray-2 model
    const generatePayload = {
      prompt: prompt,
      model: "ray-2",
      aspect_ratio: aspectRatio
    };

    // Add image if provided
    if (imageUrl) {
      generatePayload.keyframes = {
        frame0: {
          type: "image",
          url: imageUrl
        }
      };
    }

    // Create generation
    const generateResponse = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lumaApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(generatePayload)
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      return Response.json({ 
        error: 'Failed to create video',
        details: errorText
      }, { status: generateResponse.status });
    }

    const generateData = await generateResponse.json();
    const generationId = generateData.id;

    if (!generationId) {
      return Response.json({
        error: 'No generation ID received',
        details: generateData
      }, { status: 500 });
    }

    // Poll for completion (max 2.5 minutes to avoid timeout)
    let attempts = 0;
    const maxAttempts = 30; // 30 * 5s = 150s = 2.5 min
    const pollInterval = 5000;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;

      const statusResponse = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`, {
        headers: {
          'Authorization': `Bearer ${lumaApiKey}`
        }
      });

      if (!statusResponse.ok) {
        continue;
      }

      const statusData = await statusResponse.json();
      const status = statusData.state;

      if (status === 'completed') {
        return Response.json({
          success: true,
          video_url: statusData.assets?.video,
          thumbnail_url: statusData.assets?.image,
          generation_id: generationId,
          prompt: prompt
        });
      }

      if (status === 'failed') {
        return Response.json({
          error: 'Generation failed',
          details: statusData.failure_reason || 'Unknown error'
        }, { status: 500 });
      }
    }

    // Still processing - return ID for manual checking
    return Response.json({
      still_processing: true,
      generation_id: generationId,
      message: 'Video is still being generated. Please check back in a few minutes.',
      check_url: `https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message
    }, { status: 500 });
  }
});