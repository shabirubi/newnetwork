import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { script, avatar_id } = await req.json();
    
    if (!script) {
      return Response.json({ error: 'script is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('HEYGEN_API_KEY');
    
    if (!apiKey) {
      return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    // Get default avatar if not specified
    let selectedAvatarId = avatar_id || 'Abigail_expressive_2024112501';
    
    // Default voice
    const defaultVoiceId = 'f38a635bee7a4d1f9b0a654a31d050d2'; // Chill Brian
    
    console.log('Creating HeyGen avatar video with avatar:', selectedAvatarId);

    // Create video using v2 API
    const createResponse = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey
      },
      body: JSON.stringify({
        video_inputs: [
          {
            character: {
              type: 'avatar',
              avatar_id: selectedAvatarId
            },
            voice: {
              type: 'text',
              input_text: script,
              voice_id: defaultVoiceId
            }
          }
        ],
        dimension: {
          width: 1280,
          height: 720
        },
        duration: 5,
        test: false
      })
    });

    let responseData;
    const responseText = await createResponse.text();
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', responseText);
      return Response.json({ error: 'Failed to parse HeyGen API response', details: responseText }, { status: 500 });
    }

    if (!createResponse.ok) {
      console.error('HeyGen API error:', responseData);
      return Response.json({ error: 'HeyGen API error: ' + JSON.stringify(responseData) }, { status: createResponse.status });
    }

    console.log('HeyGen create response:', responseData);
    
    const videoId = responseData.data?.video_id || responseData.video_id;

    if (!videoId) {
      console.error('No video ID in response:', responseData);
      return Response.json({ error: 'No video ID returned from HeyGen', details: responseData }, { status: 500 });
    }

    // Poll for completion (max 5 minutes with longer intervals)
    const maxAttempts = 30;
    const pollInterval = 10000; // 10 seconds between checks
    
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      console.log(`Poll attempt ${i + 1}/${maxAttempts}`);
      
      try {
        const statusResponse = await fetch(`https://api.heygen.com/v2/video/${videoId}`, {
          method: 'GET',
          headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json'
          }
        });

        const statusText = await statusResponse.text();
        console.log(`Status response (${statusResponse.status}):`, statusText.substring(0, 200));
        
        let statusData;
        try {
          statusData = JSON.parse(statusText);
        } catch (e) {
          console.error('Failed to parse:', statusText);
          continue;
        }

        const status = statusData.data?.status;
        console.log('Video status:', status);

        if (status === 'completed' && statusData.data?.video_url) {
          const videoUrl = statusData.data?.video_url;
          console.log('Video ready:', videoUrl);
          return Response.json({
            video_url: videoUrl,
            duration: statusData.data?.duration || 30
          });
        }
        
        if (status === 'failed') {
          console.error('Generation failed:', statusData);
          return Response.json({ error: 'Video generation failed', details: statusData }, { status: 500 });
        }
      } catch (err) {
        console.error('Poll error:', err.message);
      }
    }

    return Response.json({ 
      still_processing: true,
      video_id: videoId,
      message: 'התהליך עדיין בעיבוד - היא תקבל מייל כשהסרטון מוכן'
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});