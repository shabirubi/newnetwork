import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, imageUrl, aspectRatio = "16:9", loop = false } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const lumaApiKey = Deno.env.get('LUMA_API_KEY');
    if (!lumaApiKey) {
      return Response.json({ error: 'LUMA_API_KEY not configured' }, { status: 500 });
    }

    // Create generation request
    const generatePayload = {
      prompt: prompt,
      aspect_ratio: aspectRatio,
      loop: loop
    };

    // Add image if provided (image-to-video)
    if (imageUrl) {
      generatePayload.keyframes = {
        frame0: {
          type: "image",
          url: imageUrl
        }
      };
    }

    // Call Luma API to create generation
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
      console.error('Luma generation error:', errorText);
      return Response.json({ 
        error: 'Failed to create video generation',
        details: errorText 
      }, { status: generateResponse.status });
    }

    const generateData = await generateResponse.json();
    const generationId = generateData.id;

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes max
    const pollInterval = 5000; // 5 seconds

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const statusResponse = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`, {
        headers: {
          'Authorization': `Bearer ${lumaApiKey}`
        }
      });

      if (!statusResponse.ok) {
        console.error('Luma status check failed:', await statusResponse.text());
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();

      if (statusData.state === 'completed') {
        return Response.json({
          success: true,
          video_url: statusData.assets?.video || statusData.video?.url,
          thumbnail_url: statusData.assets?.thumbnail,
          generation_id: generationId,
          prompt: prompt,
          aspect_ratio: aspectRatio,
          created_at: statusData.created_at
        });
      }

      if (statusData.state === 'failed') {
        return Response.json({
          error: 'Video generation failed',
          details: statusData.failure_reason
        }, { status: 500 });
      }

      attempts++;
    }

    return Response.json({
      error: 'Video generation timed out',
      generation_id: generationId
    }, { status: 408 });

  } catch (error) {
    console.error('Luma video creation error:', error);
    return Response.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
});