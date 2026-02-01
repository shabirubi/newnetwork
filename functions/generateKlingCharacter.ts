import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createHmac } from 'node:crypto';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_url, prompt, duration = 5, mode = 'std' } = await req.json();
    
    if (!image_url || !prompt) {
      return Response.json({ error: 'image_url and prompt are required' }, { status: 400 });
    }

    const accessKey = Deno.env.get('KLING_ACCESS_KEY');
    const secretKey = Deno.env.get('KLING_SECRET_KEY');
    
    if (!accessKey || !secretKey) {
      return Response.json({ error: 'Kling API keys not configured' }, { status: 500 });
    }

    // Kling API signature
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signString = `${accessKey}${timestamp}`;
    const signature = createHmac('sha256', secretKey).update(signString).digest('hex');

    // Create video generation task
    const createResponse = await fetch('https://api.klingai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': accessKey,
        'X-Timestamp': timestamp,
        'X-Signature': signature
      },
      body: JSON.stringify({
        model_name: 'kling-v1',
        image: image_url,
        prompt: prompt,
        negative_prompt: 'blurry, low quality, distorted',
        duration: duration,
        mode: mode,
        aspect_ratio: '16:9'
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      return Response.json({ error: 'Kling API error: ' + errorText }, { status: createResponse.status });
    }

    const createData = await createResponse.json();
    const taskId = createData.data?.task_id;

    if (!taskId) {
      return Response.json({ error: 'No task_id returned from Kling' }, { status: 500 });
    }

    // Poll for completion (max 2 minutes)
    const maxAttempts = 24;
    const pollInterval = 5000;
    
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const newTimestamp = Math.floor(Date.now() / 1000).toString();
      const newSignString = `${accessKey}${newTimestamp}`;
      const newSignature = createHmac('sha256', secretKey).update(newSignString).digest('hex');
      
      const statusResponse = await fetch(`https://api.klingai.com/v1/images/generations/${taskId}`, {
        headers: {
          'X-Api-Key': accessKey,
          'X-Timestamp': newTimestamp,
          'X-Signature': newSignature
        }
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        
        if (statusData.data?.status === 'succeed' && statusData.data?.works?.[0]?.resource) {
          return Response.json({
            video_url: statusData.data.works[0].resource,
            thumbnail_url: image_url,
            duration: duration
          });
        }
        
        if (statusData.data?.status === 'failed') {
          return Response.json({ error: 'Video generation failed' }, { status: 500 });
        }
      }
    }

    return Response.json({ 
      still_processing: true,
      task_id: taskId,
      message: 'התהליך לוקח זמן, נסה שוב בעוד דקה'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});