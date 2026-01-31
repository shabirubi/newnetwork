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

    const falApiKey = Deno.env.get('FAL_API_KEY');
    if (!falApiKey) {
      return Response.json({ error: 'FAL_API_KEY not configured' }, { status: 500 });
    }

    // Use FAL's AnimateDiff for text-to-video or SVD for image-to-video
    const endpoint = imageUrl 
      ? 'https://queue.fal.run/fal-ai/fast-svd/image-to-video'
      : 'https://queue.fal.run/fal-ai/fast-animatediff/text-to-video';

    const payload = imageUrl ? {
      image_url: imageUrl,
      motion_bucket_id: 127,
      fps: 8,
      cond_aug: 0.02
    } : {
      prompt: prompt,
      negative_prompt: "blurry, distorted, low quality",
      num_inference_steps: 25,
      guidance_scale: 7.5,
      num_frames: 16,
      fps: 8
    };

    // Submit generation request
    const generateResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      return Response.json({ 
        error: 'Failed to create video',
        details: errorText
      }, { status: generateResponse.status });
    }

    const generateData = await generateResponse.json();
    const requestId = generateData.request_id;

    if (!requestId) {
      // If video is ready immediately
      if (generateData.video?.url) {
        return Response.json({
          success: true,
          video_url: generateData.video.url,
          thumbnail_url: generateData.image?.url,
          prompt: prompt
        });
      }
      return Response.json({
        error: 'No request ID received',
        details: generateData
      }, { status: 500 });
    }

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // 60 * 2s = 120s
    const pollInterval = 2000;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;

      const statusResponse = await fetch(`https://queue.fal.run/fal-ai/fast-animatediff/text-to-video/requests/${requestId}/status`, {
        headers: {
          'Authorization': `Key ${falApiKey}`
        }
      });

      if (!statusResponse.ok) {
        continue;
      }

      const statusData = await statusResponse.json();
      const status = statusData.status;

      if (status === 'COMPLETED') {
        // Get result
        const resultResponse = await fetch(`https://queue.fal.run/fal-ai/fast-animatediff/text-to-video/requests/${requestId}`, {
          headers: {
            'Authorization': `Key ${falApiKey}`
          }
        });

        if (resultResponse.ok) {
          const resultData = await resultResponse.json();
          return Response.json({
            success: true,
            video_url: resultData.video?.url,
            thumbnail_url: resultData.image?.url,
            prompt: prompt
          });
        }
      }

      if (status === 'FAILED') {
        return Response.json({
          error: 'Generation failed',
          details: statusData.error || 'Unknown error'
        }, { status: 500 });
      }
    }

    return Response.json({
      still_processing: true,
      request_id: requestId,
      message: 'Video is still being generated. Please check back in a minute.'
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message
    }, { status: 500 });
  }
});