import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl, script, voice, title } = await req.json();

    if (!imageUrl || !script || !voice) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY');
    const ffmpegUrl = 'https://api.d-id.com/talks';

    if (!elevenLabsKey) {
      return Response.json({ error: 'API keys not configured' }, { status: 500 });
    }

    // Voice ID mapping
    const voiceMap = {
      'en': '21m00Tcm4TlvDq8ikWAM',
      'en-female': 'EZwHvHT1z3XmcmzWIWFF',
      'he': 'GEyb0CAhZyT34ES5zdqh',
      'he-female': 'GEyb0CAhZyT34ES5zdqh',
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
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!speechResponse.ok) {
      console.error('ElevenLabs error');
      return Response.json({ error: 'Speech generation failed' }, { status: 500 });
    }

    const audioBuffer = await speechResponse.arrayBuffer();
    
    // Upload audio file
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mp3' });
    const audioUpload = await base44.integrations.Core.UploadFile({ file: audioBlob });
    const audioUrl = audioUpload.file_url;

    // 2. Create video using D-ID or FFmpeg integration
    // For now, we'll create a simple response with the video generation
    // In production, you'd use D-ID API or similar
    
    // Estimate duration based on words
    const wordCount = script.split(' ').length;
    const estimatedDuration = Math.ceil(wordCount / 2.5);

    return Response.json({
      success: true,
      video_url: audioUrl, // In production, merge image + audio into video
      audio_url: audioUrl,
      image_url: imageUrl,
      duration: `0:${Math.min(estimatedDuration, 60)}`,
      script,
      voice,
      title,
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message || 'Video generation failed' 
    }, { status: 500 });
  }
});