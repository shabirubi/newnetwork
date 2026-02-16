import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { script, avatar_id, voice_id, photo_url } = await req.json();
    
    if (!script || !script.trim()) {
      return Response.json({ error: 'Script is required' }, { status: 400 });
    }

    // Default voice - Hebrew Julia voice
    const voiceId = voice_id || '1bd001e7e50f421d891986aad5158bc8';

    const apiKey = Deno.env.get('HEYGEN_API_KEY');
    
    if (!apiKey) {
      return Response.json({ error: 'HEYGEN_API_KEY not configured' }, { status: 500 });
    }

    console.log('Creating HeyGen video with:', { 
      hasAvatarId: !!avatar_id, 
      hasPhotoUrl: !!photo_url,
      scriptLength: script.length 
    });

    // Build character configuration
    let characterConfig;
    if (photo_url) {
      // Photo avatar mode - use uploaded image
      characterConfig = {
        type: 'photo_avatar',
        photo_url: photo_url,
        avatar_style: 'normal'
      };
    } else if (avatar_id) {
      // Regular avatar mode
      characterConfig = {
        type: 'avatar',
        avatar_id: avatar_id,
        avatar_style: 'normal'
      };
    } else {
      return Response.json({ error: 'Either avatar_id or photo_url is required' }, { status: 400 });
    }

    // Create video
    const createRes = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_inputs: [{
          character: characterConfig,
          voice: {
            type: 'text',
            input_text: script,
            voice_id: voiceId
          },
          background: {
            type: 'color',
            value: '#000000'
          }
        }],
        test: false,
        caption: false,
        dimension: {
          width: 1280,
          height: 720
        }
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

    // Wait up to 90 seconds for completion
    for (let i = 0; i < 90; i++) {
      await new Promise(r => setTimeout(r, 1000));

      const statusRes = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        const status = statusData?.data?.status;

        console.log(`Status check ${i + 1}/90: ${status}`);

        if (status === 'completed' && statusData?.data?.video_url) {
          console.log('Video ready:', statusData.data.video_url);
          return Response.json({
            video_url: statusData.data.video_url,
            duration: statusData.data.duration || 5,
            video_id: videoId
          });
        }

        if (status === 'failed') {
          console.error('Video failed:', statusData);
          return Response.json({ error: 'Video generation failed', details: statusData }, { status: 500 });
        }
      }
    }

    // After 90 seconds, still not ready
    console.log('Timeout after 90s, returning ID for manual check');
    return Response.json({ 
      still_processing: true,
      video_id: videoId,
      message: 'הווידאו לוקח יותר זמן - בדוק שוב בעוד דקה או קיבלת מייל'
    });

  } catch (error) {
    console.error('ERROR:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});