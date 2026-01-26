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

    // Voice ID mapping
    const voiceMap = {
      'he': '9BWtsMINqrJLrRacOk9x',
      'he-female': 'zrHiPzrd1d3O8z5RsZXS',
      'en': '21m00Tcm4TlvDq8ikWAM',
      'en-female': 'EZwHvHT1z3XmcmzWIWFF',
      'ar': 'VR6AewLHbXDG24trsUsT',
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
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    
    // Upload audio
    const audioUpload = await base44.integrations.Core.UploadFile({ file: audioBlob });
    const audioUrl = audioUpload.file_url;

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
          stitch: motionConfig.stitch,
          pad_audio: motionConfig.pad_audio,
          transition: motionConfig.transition,
          driver_expressions: motionConfig.driver_expressions,
        },
        // Use expressive driver for more realistic body movements
        driver_url: 'bank://expressive/',
      }),
    });

    if (!didResponse.ok) {
      const errorText = await didResponse.text();
      console.error('D-ID error:', errorText);
      return Response.json({ error: 'Video creation failed' }, { status: 500 });
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