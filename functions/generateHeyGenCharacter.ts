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
              input_text: script
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

    // Poll for completion (max 5 minutes)
    const maxAttempts = 60;
    const pollInterval = 5000;
    
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const statusResponse = await fetch(`https://api.heygen.com/v2/video_status/${videoId}`, {
        headers: {
          'X-API-KEY': apiKey
        }
      });

      let statusData;
      const statusText = await statusResponse.text();
      
      try {
        statusData = JSON.parse(statusText);
      } catch (e) {
        console.error('Failed to parse status response:', statusText);
        continue;
      }

      console.log(`Poll attempt ${i + 1}:`, statusData);
      
      if (statusResponse.ok) {
        const status = statusData.data?.status || statusData.status || statusData.video_status;
        
        if (status === 'completed') {
          const videoUrl = statusData.data?.video_url || statusData.video_url || statusData.output_url;
          if (videoUrl) {
            return Response.json({
              video_url: videoUrl,
              thumbnail_url: image_url,
              duration: statusData.duration || 30
            });
          }
        }
        
        if (status === 'failed') {
          console.error('Generation failed:', statusData);
          return Response.json({ error: 'Video generation failed', details: statusData }, { status: 500 });
        }
      }
    }

    return Response.json({ 
      still_processing: true,
      video_id: videoId,
      message: 'התהליך לוקח זמן, נסה שוב בעוד דקה'
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});