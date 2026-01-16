import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { script } = await req.json();

    if (!script) {
      return Response.json({ error: 'Script is required' }, { status: 400 });
    }

    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    if (!DID_API_KEY) {
      return Response.json({ error: 'DID_API_KEY not configured' }, { status: 500 });
    }

    console.log('Creating weather forecast with D-ID...');
    console.log('Script:', script);

    // Create D-ID video with professional weather presenter
    const didResponse = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_url: 'https://create-images-results.d-id.com/DefaultPresenters/Emma_f/image.jpeg',
        script: {
          type: 'text',
          input: script,
          provider: {
            type: 'microsoft',
            voice_id: 'he-IL-HilaNeural'
          }
        },
        config: {
          fluent: true,
          pad_audio: 0,
          stitch: true
        }
      })
    });

    const didText = await didResponse.text();
    console.log('D-ID Response:', didText);

    if (!didResponse.ok) {
      return Response.json({
        error: 'Failed to create video',
        details: didText
      }, { status: didResponse.status });
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
      console.log(`Attempt ${attempts + 1}: Status = ${statusData.status}`);

      if (statusData.status === 'done') {
        return Response.json({
          success: true,
          video_url: statusData.result_url,
          talk_id: talkId,
          script: script
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
      error: 'Timeout waiting for video',
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