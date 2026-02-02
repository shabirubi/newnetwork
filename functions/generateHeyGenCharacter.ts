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

    console.log('=== Starting HeyGen Video Generation ===');
    console.log('Script:', script);

    // יצירת וידאו
    const createResponse = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_inputs: [{
          character: {
            type: 'avatar',
            avatar_id: 'Kristin-insuit-20220818'
          },
          voice: {
            type: 'text',
            input_text: script,
            voice_id: '1bd001e7e50f421d891986aad5158bc8'
          }
        }],
        dimension: {
          width: 1280,
          height: 720
        },
        test: false
      })
    });

    const createText = await createResponse.text();
    console.log('Create Response Status:', createResponse.status);
    console.log('Create Response Body:', createText);

    if (!createResponse.ok) {
      console.error('Failed to create video');
      return Response.json({ 
        error: 'Failed to create video',
        status: createResponse.status,
        details: createText
      }, { status: 500 });
    }

    const createData = JSON.parse(createText);
    const videoId = createData.data?.video_id;

    if (!videoId) {
      console.error('No video_id in response:', createData);
      return Response.json({ 
        error: 'No video_id returned',
        response: createData
      }, { status: 500 });
    }

    console.log('Video ID:', videoId);
    console.log('=== Polling for completion ===');

    // המתן עד 2 דקות
    for (let attempt = 1; attempt <= 120; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': apiKey
        }
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        const status = statusData.data?.status;
        const videoUrl = statusData.data?.video_url;
        
        console.log(`Attempt ${attempt}: status = ${status}`);

        if (status === 'completed' && videoUrl) {
          console.log('=== Video Ready! ===');
          console.log('URL:', videoUrl);
          return Response.json({
            video_url: videoUrl,
            duration: statusData.data?.duration || 5,
            video_id: videoId
          });
        }

        if (status === 'failed') {
          console.error('Video generation failed');
          return Response.json({ 
            error: 'Video generation failed',
            video_id: videoId
          }, { status: 500 });
        }
      }
    }

    console.log('Timeout after 2 minutes');
    return Response.json({ 
      still_processing: true,
      video_id: videoId,
      message: 'הווידאו עדיין בעיבוד'
    });

  } catch (error) {
    console.error('=== ERROR ===');
    console.error(error.message);
    console.error(error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});