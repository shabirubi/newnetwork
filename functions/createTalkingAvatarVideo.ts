import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { imageUrl, script, voice, title } = await req.json();

    if (!imageUrl || !script || !voice) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY');
    const didApiKey = Deno.env.get('DID_API_KEY');

    if (!elevenLabsKey || !didApiKey) {
      return Response.json({ error: 'API keys not configured' }, { status: 500 });
    }

    // Voice ID mapping for ElevenLabs
    const voiceMap = {
      'en': '21m00Tcm4TlvDq8ikWAM',
      'en-female': 'EZwHvHT1z3XmcmzWIWFF',
      'he': '9BWtsMINqrJLrRacOk9x',
      'he-female': 'zrHiPzrd1d3O8z5RsZXS',
      'es': 'VR6AewLHbNgxVBBOljy2',
      'fr': 'onwK4e9ZLuTAKqWW03F9',
      'de': 'z9fbiKVAOL0VLExqIdkB',
      'it': 'EXAVITQu4vr4xnSDxMaL',
    };

    const voiceId = voiceMap[voice] || voiceMap['en'];

    // 1. Generate speech audio with ElevenLabs
    const speechResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: script,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!speechResponse.ok) {
      return Response.json({ error: 'Speech generation failed' }, { status: 500 });
    }

    const audioBuffer = await speechResponse.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    
    // Upload audio to get URL
    const audioUpload = await base44.integrations.Core.UploadFile({ file: audioBlob });
    const audioUrl = audioUpload.file_url;

    // 2. Use D-ID API to create talking avatar video
    const didResponse = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${didApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_url: imageUrl,
        script: {
          type: 'audio',
          audio_url: audioUrl,
        },
        config: {
          fluent: true,
          pad_audio: 0.0,
        },
        driver_url: 'bank://lively/',
      }),
    });

    if (!didResponse.ok) {
      const errorText = await didResponse.text();
      console.error('D-ID API error:', errorText);
      return Response.json({ error: 'Video creation failed' }, { status: 500 });
    }

    const didData = await didResponse.json();
    
    // Poll for video completion
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts && !videoUrl) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`https://api.d-id.com/talks/${didData.id}`, {
        headers: {
          'Authorization': `Bearer ${didApiKey}`,
        },
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.status === 'done' && statusData.result_url) {
          videoUrl = statusData.result_url;
          break;
        } else if (statusData.status === 'error') {
          return Response.json({ error: 'Video generation failed' }, { status: 500 });
        }
      }
      
      attempts++;
    }

    if (!videoUrl) {
      return Response.json({ error: 'Video generation timeout' }, { status: 500 });
    }

    return Response.json({
      success: true,
      video_url: videoUrl,
      audio_url: audioUrl,
      image_url: imageUrl,
      script,
      voice,
      title,
      did_id: didData.id,
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message || 'Video generation failed' 
    }, { status: 500 });
  }
});