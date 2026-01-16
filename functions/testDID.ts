import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    
    if (!DID_API_KEY) {
      return Response.json({ error: 'DID_API_KEY not configured' }, { status: 500 });
    }

    const testText = "שלום, אני קריין הטלוויזיה של הרשת החדשה. זהו שידור בדיקה.";

    console.log('Creating D-ID clip...');
    
    const didResponse = await fetch('https://api.d-id.com/clips', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        presenter_id: 'amy-Aq6OmGZnMt',
        driver_id: 'Vcq0R4a8F0',
        script: {
          type: 'text',
          input: testText,
          provider: {
            type: 'microsoft',
            voice_id: 'he-IL-AvriNeural'
          }
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
    const clipId = didData.id;
    
    console.log('Clip ID:', clipId);

    // Poll for completion
    let attempts = 0;
    while (attempts < 60) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const statusResponse = await fetch(`https://api.d-id.com/clips/${clipId}`, {
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
          clip_id: clipId
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
      clip_id: clipId
    }, { status: 408 });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});