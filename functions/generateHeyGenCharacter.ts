import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { script } = await req.json();
    
    if (!script || !script.trim()) {
      return Response.json({ error: 'Script is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('HEYGEN_API_KEY');
    
    if (!apiKey) {
      return Response.json({ error: 'HEYGEN_API_KEY not configured' }, { status: 500 });
    }

    console.log('Starting video generation...');
    console.log('Script length:', script.length);

    // Create video
    const createPayload = {
      video_inputs: [{
        character: {
          type: 'avatar',
          avatar_id: 'josh_lite3_20230714',
          avatar_style: 'normal'
        },
        voice: {
          type: 'text',
          input_text: script,
          voice_id: '2d5b0e6cf36f460aa7fc47e3eee4ba54'
        }
      }],
      dimension: {
        width: 1280,
        height: 720
      },
      aspect_ratio: '16:9'
    };

    console.log('Sending create request...');
    const createRes = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createPayload)
    });

    const createBody = await createRes.text();
    console.log('Create status:', createRes.status);
    console.log('Create response:', createBody);

    if (!createRes.ok) {
      return Response.json({ 
        error: 'Failed to create video',
        status: createRes.status,
        details: createBody
      }, { status: 500 });
    }

    let createData;
    try {
      createData = JSON.parse(createBody);
    } catch (e) {
      return Response.json({ error: 'Invalid JSON response', body: createBody }, { status: 500 });
    }

    const videoId = createData?.data?.video_id;
    if (!videoId) {
      return Response.json({ error: 'No video_id', response: createData }, { status: 500 });
    }

    console.log('Video ID:', videoId);

    // Poll for completion (2 minutes max)
    for (let i = 0; i < 120; i++) {
      await new Promise(r => setTimeout(r, 1000));
      
      const statusRes = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
        headers: { 'X-Api-Key': apiKey }
      });

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        const status = statusData?.data?.status;
        
        if (i % 10 === 0) console.log(`${i}s: ${status}`);

        if (status === 'completed' && statusData?.data?.video_url) {
          console.log('Completed! URL:', statusData.data.video_url);
          return Response.json({
            video_url: statusData.data.video_url,
            duration: statusData.data.duration || 5,
            video_id: videoId
          });
        }

        if (status === 'failed') {
          return Response.json({ error: 'Generation failed', video_id: videoId }, { status: 500 });
        }
      }
    }

    return Response.json({ 
      still_processing: true,
      video_id: videoId
    });

  } catch (error) {
    console.error('ERROR:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});