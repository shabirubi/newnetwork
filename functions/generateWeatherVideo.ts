import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { script } = await req.json();

    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

    if (!DID_API_KEY) {
      return Response.json({ error: 'DID_API_KEY not configured' }, { status: 500 });
    }

    if (!ELEVENLABS_API_KEY) {
      return Response.json({ error: 'ELEVENLABS_API_KEY not configured' }, { status: 500 });
    }

    console.log('Generating weather video...');

    // Step 1: Generate audio with ElevenLabs
    console.log('Generating audio with ElevenLabs...');
    const ttsResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: script,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('ElevenLabs error:', errorText);
      return Response.json({ 
        error: 'Failed to generate audio',
        details: errorText 
      }, { status: 500 });
    }

    // Get audio as base64
    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;

    console.log('Audio generated successfully');

    // Step 2: Create video with D-ID using the audio
    console.log('Creating D-ID video with audio...');
    const didResponse = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_url: 'https://create-images-results.d-id.com/DefaultPresenters/Emma_f/image.jpeg',
        script: {
          type: 'audio',
          audio_url: audioDataUrl
        },
        config: {
          fluent: true,
          pad_audio: 0,
          stitch: true
        }
      })
    });

    const didText = await didResponse.text();
    console.log('D-ID Response:', didResponse.status, didText);

    if (!didResponse.ok) {
      return Response.json({
        error: 'D-ID failed',
        details: didText
      }, { status: didResponse.status });
    }

    const didData = JSON.parse(didText);
    const talkId = didData.id;

    console.log('Talk ID:', talkId, 'Polling for completion...');

    // Step 3: Poll for completion
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
        console.log('Video ready!');
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