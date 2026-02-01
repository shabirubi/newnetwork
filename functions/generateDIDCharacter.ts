import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_url, text_script, voice_id = 'en-US-JennyNeural' } = await req.json();
    
    if (!image_url || !text_script) {
      return Response.json({ error: 'image_url and text_script are required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('DID_API_KEY');
    
    if (!apiKey) {
      return Response.json({ error: 'DID API key not configured' }, { status: 500 });
    }

    console.log('Creating DID talking character...');

    // Create talking video with DID API
    const createResponse = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${apiKey}`
      },
      body: JSON.stringify({
        source_url: image_url,
        script: {
          type: 'text',
          input: text_script,
          provider: {
            type: 'microsoft',
            voice_id: voice_id
          }
        },
        config: {
          stitch: true,
          driver_expressions: {
            expressions: [
              { expression: 'happy', start_frame: 0, intensity: 0.5 },
              { expression: 'serious', start_frame: 30, intensity: 0.8 }
            ]
          },
          result_format: 'mp4'
        }
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('DID API error:', errorText);
      return Response.json({ error: 'DID API error: ' + errorText }, { status: createResponse.status });
    }

    const createData = await createResponse.json();
    console.log('DID create response:', createData);
    
    const talkId = createData.id;

    if (!talkId) {
      console.error('No id in response:', createData);
      return Response.json({ error: 'No talk ID returned from DID', details: createData }, { status: 500 });
    }

    // Poll for completion (max 2 minutes)
    const maxAttempts = 24;
    const pollInterval = 5000;
    
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const statusResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        headers: {
          'Authorization': `Basic ${apiKey}`
        }
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log(`Poll attempt ${i + 1}:`, statusData);
        
        if (statusData.status === 'done') {
          const videoUrl = statusData.result_url;
          if (videoUrl) {
            return Response.json({
              video_url: videoUrl,
              thumbnail_url: image_url,
              duration: statusData.duration || 5
            });
          }
        }
        
        if (statusData.status === 'error') {
          console.error('Generation failed:', statusData);
          return Response.json({ error: 'Video generation failed', details: statusData }, { status: 500 });
        }
      } else {
        console.error('Status check failed:', await statusResponse.text());
      }
    }

    return Response.json({ 
      still_processing: true,
      talk_id: talkId,
      message: 'התהליך לוקח זמן, נסה שוב בעוד דקה'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});