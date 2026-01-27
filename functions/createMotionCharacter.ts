import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl, script, voice, motionIntensity } = await req.json();

    if (!imageUrl || !script || !voice) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY');
    const didApiKey = Deno.env.get('DID_API_KEY');

    if (!elevenLabsKey || !didApiKey) {
      return Response.json({ error: 'API keys not configured' }, { status: 500 });
    }

    // Voice ID mapping - Professional news anchor voices
    const voiceMap = {
      'he': 'pNInz6obpgDQGcFmaJgB', // Hebrew Male News Anchor
      'he-female': 'XrExE9yKIg1WjnnlVkGX', // Hebrew Female News Anchor
      'en': 'pqHfZKP75CvOlQylNhV4', // English Male News Anchor (Bill)
      'en-female': 'EXAVITQu4vr4xnSDxMaL', // English Female News Anchor (Bella)
      'ar': 'VR6AewLHbXDG24trsUsT', // Arabic News Anchor
    };

    const voiceId = voiceMap[voice] || voiceMap['he'];

    // Motion settings for D-ID driver
    const motionConfigs = {
      light: {
        stitch: false,
        pad_audio: 0.5,
        transition: { type: 'fade', duration: 0.3 },
        driver_expressions: {
          max_rotation: 5,
          max_shift: 0.5,
        },
      },
      medium: {
        stitch: false,
        pad_audio: 0.3,
        transition: { type: 'fade', duration: 0.5 },
        driver_expressions: {
          max_rotation: 15,
          max_shift: 1.5,
        },
      },
      heavy: {
        stitch: false,
        pad_audio: 0.1,
        transition: { type: 'fade', duration: 0.8 },
        driver_expressions: {
          max_rotation: 25,
          max_shift: 2.5,
        },
      },
    };

    const motionConfig = motionConfigs[motionIntensity] || motionConfigs.medium;

    // Limit script to reasonable length
    const truncatedScript = script.substring(0, 5000);

    // 1. Generate speech with ElevenLabs
    const speechResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: truncatedScript,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!speechResponse.ok) {
      console.error('ElevenLabs error:', speechResponse.status);
      return Response.json({ error: 'Speech generation failed' }, { status: 500 });
    }

    const audioBuffer = await speechResponse.arrayBuffer();
    
    // Convert ArrayBuffer to base64 string
    const uint8View = new Uint8Array(audioBuffer);
    let audioBase64 = '';
    for (let i = 0; i < uint8View.length; i++) {
      audioBase64 += String.fromCharCode(uint8View[i]);
    }
    audioBase64 = btoa(audioBase64);
    const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;
    
    // Use data URL directly for audio
    const audioUrl = audioDataUrl;

    // 2. Create animated video with D-ID using expressive driver
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
          pad_audio: motionConfig.pad_audio,
          transition: motionConfig.transition,
        },
        // Use expressive driver for more realistic body movements
        driver_url: 'bank://expressive/',
      }),
    });

    if (!didResponse.ok) {
      const errorText = await didResponse.text();
      console.error('D-ID error:', didResponse.status, errorText);
      return Response.json({ error: `D-ID API error: ${errorText}` }, { status: 500 });
    }

    const didData = await didResponse.json();
    
    // 3. Poll for video completion
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 60;

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
          console.error('D-ID generation error');
          return Response.json({ error: 'Video generation failed' }, { status: 500 });
        }
      }
      
      attempts++;
    }

    if (!videoUrl) {
      return Response.json({ error: 'Video generation timeout' }, { status: 500 });
    }

    // Estimate duration
    const wordCount = truncatedScript.split(' ').length;
    const estimatedSeconds = Math.ceil(wordCount / 2.5);
    const minutes = Math.floor(estimatedSeconds / 60);
    const seconds = estimatedSeconds % 60;
    const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return Response.json({
      success: true,
      video_url: videoUrl,
      audio_url: audioUrl,
      duration,
      script: truncatedScript,
      voice,
      motion_intensity: motionIntensity,
      did_id: didData.id,
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message || 'Video generation failed' 
    }, { status: 500 });
  }
});