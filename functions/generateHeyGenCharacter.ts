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

    // עדיין בעיבוד - נחזור מיד עם וידאו ID וניסיון לפי עדיפות לקבל את הוידאו בתוך 30 שניות
    console.log('Video creation initiated with ID:', videoId);
    
    // ניסיון מהיר לקבל את הווידאו תוך 30 שניות
    for (let i = 0; i < 6; i++) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 שניות בין נסיונות
      
      try {
        const statusResponse = await fetch(`https://api.heygen.com/v2/video/${videoId}`, {
          method: 'GET',
          headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json'
          }
        });

        if (!statusResponse.ok) continue;
        
        const statusData = await statusResponse.json();
        const status = statusData.data?.status;

        if (status === 'completed' && statusData.data?.video_url) {
          console.log('Video completed:', statusData.data);
          return Response.json({
            video_url: statusData.data.video_url,
            duration: statusData.data?.duration || 30
          });
        }
      } catch (err) {
        console.log('Poll check', i + 1);
      }
    }
    
    return Response.json({ 
      still_processing: true,
      video_id: videoId,
      message: 'הווידאו בעיבוד, אם לא הופיע בדוק את הדוא"ל'
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});