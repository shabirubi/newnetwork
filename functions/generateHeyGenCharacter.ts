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

    console.log('Creating HeyGen video...');

    // Create video
    const createRes = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
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
      })
    });

    const createBody = await createRes.text();
    console.log('Response:', createRes.status, createBody);

    if (!createRes.ok) {
      return Response.json({ 
        error: 'Failed to create video',
        details: createBody
      }, { status: 500 });
    }

    const createData = JSON.parse(createBody);
    const videoId = createData?.data?.video_id;
    
    if (!videoId) {
      return Response.json({ error: 'No video_id', response: createData }, { status: 500 });
    }

    console.log('Video ID:', videoId);

    // Try quick check (15 seconds only)
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 1000));
      
      const statusRes = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
        headers: { 'X-Api-Key': apiKey }
      });

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        
        if (statusData?.data?.status === 'completed' && statusData?.data?.video_url) {
          console.log('Quick success!');
          return Response.json({
            video_url: statusData.data.video_url,
            duration: statusData.data.duration || 5,
            video_id: videoId
          });
        }
      }
    }

    // Return video_id for later check
    console.log('Still processing, returning ID');
    return Response.json({ 
      still_processing: true,
      video_id: videoId,
      message: 'הווידאו בעיבוד - לחץ על "בדוק סטטוס" בעוד 30 שניות'
    });

  } catch (error) {
    console.error('ERROR:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});