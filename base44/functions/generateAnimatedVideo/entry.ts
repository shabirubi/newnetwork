import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { script, voice, avatarStyle, duration } = await req.json();

    if (!script || !voice) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Generate speech with ElevenLabs
    const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY');
    const didKey = Deno.env.get('DID_API_KEY');

    if (!elevenLabsKey || !didKey) {
      return Response.json({ error: 'API keys not configured' }, { status: 500 });
    }

    // Get voice ID based on selected voice
    const voiceMap = {
      'en': '21m00Tcm4TlvDq8ikWAM', // male
      'en-female': 'EZwHvHT1z3XmcmzWIWFF', // female
      'he': '9BWtsMINqrJLrRacOk9x', // hebrew
      'he-female': 'zrHiPzrd1d3O8z5RsZXS', // hebrew female
      'es': 'VR6AewLHbNgxVBBOljy2', // spanish
      'fr': 'onwK4e9ZLuTAKqWW03F9', // french
    };

    const voiceId = voiceMap[voice] || voiceMap['en'];

    // Generate speech audio
    const speechResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: script,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!speechResponse.ok) {
      const error = await speechResponse.text();
      console.error('ElevenLabs error:', error);
      return Response.json({ error: 'Speech generation failed' }, { status: 500 });
    }

    const audioBuffer = await speechResponse.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mp3' });

    // Upload audio to get URL
    const audioFormData = new FormData();
    audioFormData.append('file', audioBlob, 'speech.mp3');

    const audioUpload = await base44.integrations.Core.UploadFile({ file: audioBlob });
    const audioUrl = audioUpload.file_url;

    // 2. Create video with DID API
    const avatarMap = {
      'professional': 'wayne-1d0bf82c-2c8f-4b29-b78f-5336a5b02df3', // professional avatar
      'friendly': 'henry-88c60aa0-b6c5-4d27-a0b1-64f27af00c88', // friendly avatar
      'animated': 'sarah-4b6dfc08-8e78-46a1-aca0-5f7ef5d8d9a2', // animated avatar
      'news': 'maya-8d47b1ab-5f5f-4c4b-8e62-8c8c8c8c8c8c', // news anchor
    };

    const avatarId = avatarMap[avatarStyle] || avatarMap['professional'];

    const videoRequest = {
      source_url: 'https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-media-user-600nw-1677509740.jpg', // fallback
      driver_url: avatarId,
      audio_url: audioUrl,
      config: {
        type: 'text',
        provider: {
          type: 'microsoft',
          params: {
            voice_config: {
              language_code: voice.split('-')[0],
            },
          },
        },
      },
    };

    const videoResponse = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'authorization': `Basic ${btoa(':' + didKey)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(videoRequest),
    });

    if (!videoResponse.ok) {
      const error = await videoResponse.text();
      console.error('DID error:', error);
      return Response.json({ error: 'Video generation failed' }, { status: 500 });
    }

    const videoData = await videoResponse.json();
    
    // Poll for video completion (simplified)
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max wait

    while (attempts < maxAttempts && !videoUrl) {
      const statusResponse = await fetch(`https://api.d-id.com/talks/${videoData.id}`, {
        headers: {
          'authorization': `Basic ${btoa(':' + didKey)}`,
        },
      });

      const statusData = await statusResponse.json();
      
      if (statusData.status === 'done' && statusData.result_url) {
        videoUrl = statusData.result_url;
        break;
      }

      if (statusData.status === 'error') {
        return Response.json({ error: 'Video generation failed' }, { status: 500 });
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return Response.json({
      success: true,
      video_url: videoUrl || videoData.result_url,
      duration: `0:${Math.min(duration, 60)}`,
      videoId: videoData.id,
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message || 'Video generation failed' 
    }, { status: 500 });
  }
});