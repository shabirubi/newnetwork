import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { script } = await req.json();
    
    if (!script) {
      return Response.json({ error: 'script is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('HEYGEN_API_KEY');
    
    if (!apiKey) {
      return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    console.log('Creating HeyGen video with script:', script);

    // יצירת וידאו עם HeyGen API v2
    const response = await fetch('https://api.heygen.com/v2/video/generate', {
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
              avatar_id: 'Kristin-insuit-20220818',
              avatar_style: 'normal'
            },
            voice: {
              type: 'text',
              input_text: script,
              voice_id: '1bd001e7e50f421d891986aad5158bc8'
            }
          }
        ],
        dimension: {
          width: 1280,
          height: 720
        },
        aspect_ratio: '16:9',
        test: false
      })
    });

    const responseText = await response.text();
    console.log('HeyGen response status:', response.status);
    console.log('HeyGen response:', responseText);

    if (!response.ok) {
      return Response.json({ 
        error: 'HeyGen API error',
        status: response.status,
        details: responseText
      }, { status: response.status });
    }

    const data = JSON.parse(responseText);
    const videoId = data.data?.video_id;

    if (!videoId) {
      return Response.json({ 
        error: 'No video ID returned',
        details: data
      }, { status: 500 });
    }

    console.log('Video ID created:', videoId);

    // המתן לווידאו עד 90 שניות
    const maxAttempts = 90;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`https://api.heygen.com/v2/video_status.get?video_id=${videoId}`, {
        method: 'GET',
        headers: {
          'X-API-KEY': apiKey
        }
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        const status = statusData.data?.status;
        
        console.log(`Check ${i + 1}/${maxAttempts} - Status:`, status);

        if (status === 'completed' && statusData.data?.video_url) {
          return Response.json({
            video_url: statusData.data.video_url,
            duration: statusData.data.duration || 5,
            video_id: videoId
          });
        }
        
        if (status === 'failed') {
          return Response.json({ 
            error: 'Video generation failed',
            video_id: videoId
          }, { status: 500 });
        }
      }
    }

    // אם לא הצלחנו אחרי 90 שניות
    return Response.json({ 
      still_processing: true,
      video_id: videoId,
      message: 'הווידאו בעיבוד - בדוק במייל או נסה שוב'
    });

  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});