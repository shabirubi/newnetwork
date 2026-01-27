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

    console.log('Creating Luma video with prompt:', prompt);
    console.log('Image URL:', imageUrl);
    console.log('Aspect ratio:', aspectRatio);

    // Create generation request - CORRECT piapi.ai format
    const generatePayload = {
      prompt: prompt,
      aspect_ratio: aspectRatio,
      loop: loop
    };

    // Add keyframes for image-to-video
    if (imageUrl) {
      generatePayload.keyframes = {
        frame0: {
          type: "image",
          url: imageUrl
        }
      };
    }

    console.log('Request payload:', JSON.stringify(generatePayload, null, 2));

    // Call piapi.ai Luma Dream Machine API
    const generateResponse = await fetch('https://api.piapi.ai/api/luma/v1/generations', {
      method: 'POST',
      headers: {
        'x-api-key': lumaApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(generatePayload)
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error('Luma generation error:', errorText);
      return Response.json({ 
        error: 'Failed to create video generation',
        details: errorText,
        status: generateResponse.status
      }, { status: generateResponse.status });
    }

    const generateData = await generateResponse.json();
    console.log('Generation response:', JSON.stringify(generateData, null, 2));

    const generationId = generateData.data?.id;

    if (!generationId) {
      return Response.json({
        error: 'Failed to get generation ID',
        details: generateData
      }, { status: 500 });
    }

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 180; // 15 minutes max
    const pollInterval = 5000; // 5 seconds

    console.log('Starting polling for generation:', generationId);

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const statusResponse = await fetch(`https://api.piapi.ai/api/luma/v1/generations/${generationId}`, {
        headers: {
          'x-api-key': lumaApiKey
        }
      });

      if (!statusResponse.ok) {
        console.error('Luma status check failed:', await statusResponse.text());
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();
      console.log(`Poll attempt ${attempts + 1}: Status =`, statusData.data?.state);

      if (statusData.data?.state === 'completed') {
        console.log('Video generation completed!');
        return Response.json({
          success: true,
          video_url: statusData.data?.assets?.video,
          thumbnail_url: statusData.data?.assets?.thumbnail,
          generation_id: generationId,
          prompt: prompt,
          aspect_ratio: aspectRatio,
          created_at: statusData.data?.created_at
        });
      }

      if (statusData.data?.state === 'failed') {
        console.error('Video generation failed:', statusData.data?.failure_reason);
        return Response.json({
          error: 'Video generation failed',
          details: statusData.data?.failure_reason
        }, { status: 500 });
      }

      attempts++;
    }

    return Response.json({
      error: 'Video generation timed out',
      generation_id: generationId,
      message: 'The video is still being generated. Please try fetching it later.'
    }, { status: 408 });

  } catch (error) {
    console.error('Luma video creation error:', error);
    return Response.json({ 
      error: error.message || 'Internal server error',
      stack: error.stack
    }, { status: 500 });
  }
});