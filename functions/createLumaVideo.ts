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

    console.log('Creating Luma video with prompt:', prompt);

    // Build payload for Luma API - using dream-machine model
    const generatePayload = {
      prompt: prompt,
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

    console.log('Payload:', JSON.stringify(generatePayload, null, 2));

    // Use Luma API
    const generateResponse = await fetch('https://api.lumalabs.ai/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lumaApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(generatePayload)
    });

    const responseText = await generateResponse.text();
    console.log('Response status:', generateResponse.status);
    console.log('Response body:', responseText);

    if (!generateResponse.ok) {
      return Response.json({ 
        error: 'Failed to create video',
        details: responseText,
        status: generateResponse.status
      }, { status: generateResponse.status });
    }

    const generateData = JSON.parse(responseText);
    const generationId = generateData.id;

    if (!generationId) {
      return Response.json({
        error: 'No generation ID received',
        details: generateData
      }, { status: 500 });
    }

    console.log('Generation ID:', generationId);

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 180;
    const pollInterval = 5000;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;

      const statusResponse = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`, {
        headers: {
          'Authorization': `Bearer ${lumaApiKey}`,
          'Accept': 'application/json'
        }
      });

      const statusText = await statusResponse.text();
      console.log(`Poll ${attempts}: Status ${statusResponse.status}`);

      if (!statusResponse.ok) {
        continue;
      }

      const statusData = JSON.parse(statusText);
      const status = statusData.status;

      console.log(`Status: ${status}`);

      if (status === 'completed') {
        return Response.json({
          success: true,
          video_url: statusData.assets?.video_url,
          thumbnail_url: statusData.assets?.thumbnail_url,
          generation_id: generationId,
          prompt: prompt
        });
      }

      if (status === 'failed') {
        return Response.json({
          error: 'Generation failed',
          details: statusData
        }, { status: 500 });
      }
    }

    return Response.json({
      error: 'Timeout',
      generation_id: generationId
    }, { status: 408 });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});