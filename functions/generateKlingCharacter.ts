import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_url, prompt, duration = 5 } = await req.json();
    
    if (!image_url || !prompt) {
      return Response.json({ error: 'image_url and prompt are required' }, { status: 400 });
    }

    const accessKey = Deno.env.get('KLING_ACCESS_KEY');
    const secretKey = Deno.env.get('KLING_SECRET_KEY');
    
    if (!accessKey || !secretKey) {
      return Response.json({ error: 'Kling API keys not configured' }, { status: 500 });
    }

    // Generate JWT Token using npm:jsonwebtoken
    const jwt = await import('npm:jsonwebtoken@9.0.2');
    
    const jwtToken = jwt.default.sign(
      {
        iss: accessKey,
        exp: Math.floor(Date.now() / 1000) + 1800, // 30 minutes
        nbf: Math.floor(Date.now() / 1000) - 5 // 5 seconds ago
      },
      secretKey,
      { algorithm: 'HS256', header: { alg: 'HS256', typ: 'JWT' } }
    );
    
    console.log('Generated JWT Token for Kling API');
    console.log('Access Key (first 10 chars):', accessKey.substring(0, 10));
    console.log('JWT Token (first 50 chars):', jwtToken.substring(0, 50));

    // Create video generation task using Kling API
    const createResponse = await fetch('https://api-singapore.klingai.com/v1/videos/image2video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({
        model_name: 'kling-v1',
        image: image_url,
        prompt: prompt,
        negative_prompt: 'blurry, low quality, distorted, static',
        cfg_scale: 0.5,
        mode: 'std',
        duration: '5'
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Kling API error:', errorText);
      return Response.json({ error: 'Kling API error: ' + errorText }, { status: createResponse.status });
    }

    const createData = await createResponse.json();
    console.log('Kling create response:', createData);
    
    const taskId = createData.data?.task_id;

    if (!taskId) {
      console.error('No task_id in response:', createData);
      return Response.json({ error: 'No task_id returned from Kling', details: createData }, { status: 500 });
    }

    // Poll for completion (max 3 minutes)
    const maxAttempts = 36;
    const pollInterval = 5000;
    
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const statusResponse = await fetch(`https://api-singapore.klingai.com/v1/videos/image2video/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log(`Poll attempt ${i + 1}:`, statusData);
        
        if (statusData.data?.task_status === 'succeed') {
          const videoUrl = statusData.data?.task_result?.videos?.[0]?.url;
          if (videoUrl) {
            return Response.json({
              video_url: videoUrl,
              thumbnail_url: image_url,
              duration: duration
            });
          }
        }
        
        if (statusData.data?.task_status === 'failed') {
          console.error('Generation failed:', statusData);
          return Response.json({ error: 'Video generation failed', details: statusData }, { status: 500 });
        }
      } else {
        console.error('Status check failed:', await statusResponse.text());
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