import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    
    if (!DID_API_KEY) {
      return Response.json({ error: 'DID_API_KEY not configured' }, { status: 500 });
    }

    const testText = "שלום, אני קריין הטלוויזיה של הרשת החדשה. זהו שידור בדיקה.";

    console.log('Creating D-ID talk...');
    
    const didResponse = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_url: 'https://create-images-results.d-id.com/google-oauth2%7C111488153715019116355/upl_ZKQCGLwxK8jGQlJ6bDsj1/image.jpeg',
        script: {
          type: 'text',
          input: testText,
          provider: {
            type: 'microsoft',
            voice_id: 'he-IL-AvriNeural'
          }
        },
        config: {
          fluent: true,
          pad_audio: 0
        }
      })
    });

    const didText = await didResponse.text();
    console.log('D-ID response:', didText);

    if (!didResponse.ok) {
      return Response.json({ 
        error: 'D-ID request failed', 
        status: didResponse.status,
        details: didText
      }, { status: 500 });
    }

    const didData = JSON.parse(didText);
    const talkId = didData.id;
    
    console.log('Talk ID:', talkId);

    // Poll for completion
    let attempts = 0;
    while (attempts < 60) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const statusResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        headers: {
          'Authorization': `Basic ${DID_API_KEY}`
        }
      });

      const statusData = await statusResponse.json();
      console.log(`Attempt ${attempts + 1}: ${statusData.status}`);
      
      if (statusData.status === 'done') {
        return Response.json({
          success: true,
          video_url: statusData.result_url,
          talk_id: talkId
        });
      }
      
      if (statusData.status === 'error') {
        return Response.json({ 
          error: 'Video generation failed',
          details: statusData
        }, { status: 500 });
      }
      
      attempts++;
    }

    return Response.json({ 
      error: 'Timeout',
      talk_id: talkId
    }, { status: 408 });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});