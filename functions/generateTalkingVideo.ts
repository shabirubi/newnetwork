import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, avatarUrl, gender = 'male', voiceProvider = 'elevenlabs', backgroundType = 'static', language = 'he' } = await req.json();

      if (!text || !avatarUrl) {
        return Response.json({ error: 'Missing text or avatarUrl' }, { status: 400 });
      }

      // Voice configuration
      let voiceConfig;
      if (voiceProvider === 'elevenlabs') {
        voiceConfig = {
          type: 'elevenlabs',
          voice_id: gender === 'male' ? 'pNInz6obpgDQGcFmaJgB' : 'EXAVITQu4EsNXjluf7xi',
          language: language || 'he'
        };
      } else {
        voiceConfig = {
          type: 'microsoft',
          voice_id: gender === 'male' ? 'he-IL-AvriNeural' : 'he-IL-HilaNeural',
          language: language || 'he'
        };
      }

    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    
    if (!DID_API_KEY) {
      return Response.json({ error: 'D-ID API Key not configured' }, { status: 500 });
    }

    console.log('🎤 Starting video generation...');
    console.log('Avatar URL:', avatarUrl);
    console.log('Text:', text);
    console.log('Gender:', gender);

    // Create talk using D-ID API with enhanced body language
    // Validate image URL format for D-ID
    if (!avatarUrl.match(/\.(jpg|jpeg|png)$/i)) {
      console.error('❌ Invalid image format:', avatarUrl);
      return Response.json({ error: 'Image must be JPG or PNG format' }, { status: 400 });
    }

    const didPayload = {
      source_url: avatarUrl,
      driver_url: 'bank://lively/',
      config: {
        fluent: true,
        pad_audio: 0,
        stitch: true,
        result_format: 'mp4'
      }
    };

    didPayload.script = {
      type: 'text',
      input: text,
      language: language || 'he',
      provider: voiceConfig
    };

    // Add dynamic background if requested
    if (backgroundType === 'dynamic') {
      didPayload.config.background = {
        type: 'video',
        url: 'https://d-id-talks-prod.s3.us-west-2.amazonaws.com/default-bg.mp4'
      };
    }

    const response = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(didPayload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('🔴 D-ID API Failed:', response.status, error);
      return Response.json({ 
        error: `D-ID API error: ${error}`,
        status: response.status
      }, { status: 500 });
    }

    const result = await response.json();
    const talkId = result.id;

    console.log('📤 D-ID Response:', { id: talkId, status: result.status });

    // Poll for video completion on backend
    let pollAttempts = 0;
    const maxPollAttempts = 120;
    let pollInterval = 2000;

    while (pollAttempts < maxPollAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      try {
        const statusResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
          headers: {
            'Authorization': `Basic ${DID_API_KEY}`,
            'accept': 'application/json'
          }
        });

        if (!statusResponse.ok) {
          console.error('Status check failed:', statusResponse.status);
          pollAttempts++;
          continue;
        }

        const statusData = await statusResponse.json();
        console.log(`📊 Poll attempt ${pollAttempts + 1}: status = ${statusData.status}`);

        if (statusData.status === 'done' && statusData.result_url) {
          console.log('✅ Video ready:', statusData.result_url);
          return Response.json({
            success: true,
            video_url: statusData.result_url,
            duration: statusData.duration || 0,
            talk_id: talkId
          });
        }

        if (statusData.status === 'error') {
          console.error('D-ID Error:', statusData);
          return Response.json({ error: `Video generation failed: ${statusData.error?.message || 'Unknown error'}` }, { status: 500 });
        }

        if (pollAttempts > 20) pollInterval = 3000;
        if (pollAttempts > 40) pollInterval = 5000;

        pollAttempts++;
      } catch (pollError) {
        console.error('Poll error:', pollError.message);
        pollAttempts++;
      }
    }

    return Response.json({ error: 'Video generation timeout' }, { status: 504 });

  } catch (error) {
    console.error('🔴 Main error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});