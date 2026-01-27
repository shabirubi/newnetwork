import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
        text, 
        audioUrl,
        mode = 'talks', 
        avatarUrl, 
        presenterId, 
        avatarId, 
        voiceId = 'he-IL-AvriNeural',
        backgroundUrl,
        language = 'he',
        gender = 'male',
        voiceProvider = 'elevenlabs'
      } = await req.json();

      if (!text && !audioUrl) {
        return Response.json({ error: 'Missing text or audioUrl' }, { status: 400 });
      }

    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!DID_API_KEY) {
      return Response.json({ error: 'D-ID API Key not configured' }, { status: 500 });
    }
    
    // ElevenLabs is optional - only needed if voiceProvider is 'elevenlabs'
    if (voiceProvider === 'elevenlabs' && !ELEVENLABS_API_KEY) {
      return Response.json({ error: 'ElevenLabs API Key not configured' }, { status: 500 });
    }

    console.log('🎬 Mode:', mode);
    console.log('📝 Text:', text?.substring(0, 50) + '...');
    console.log('🔊 Voice Provider:', voiceProvider);
    console.log('👤 Gender:', gender);

    // Map gender to ElevenLabs voice IDs - Hebrew voices
    const elevenLabsVoices = {
      male: 'GEyb0CAhZyT34ES5zdqh',     // Hebrew Voice
      female: 'GEyb0CAhZyT34ES5zdqh'    // Hebrew Voice
    };

    // Use provided voiceId if it's ElevenLabs, otherwise use gender mapping
    const finalVoiceId = voiceProvider === 'elevenlabs' 
      ? (voiceId && voiceId.length > 10 ? voiceId : elevenLabsVoices[gender])
      : voiceId;

    let apiUrl, payload, jobId;

    // Mode 1: V2 Talks API - Head Only
    if (mode === 'talks') {
      if (!avatarUrl) {
        return Response.json({ error: 'Missing avatarUrl for talks mode' }, { status: 400 });
      }

      console.log('🖼️ Avatar URL:', avatarUrl);

      apiUrl = 'https://api.d-id.com/talks';

      // Build script based on input type
      let script = {
        type: audioUrl ? 'audio' : 'text',
        input: audioUrl || text,
      };

      // Only add provider for text input
      if (!audioUrl) {
        if (voiceProvider === 'elevenlabs') {
          script.provider = {
            type: 'elevenlabs',
            voice_id: finalVoiceId
          };
        } else {
          script.provider = {
            type: 'microsoft',
            voice_id: voiceId
          };
        }
      }

      payload = {
        source_url: avatarUrl,
        script: script,
        config: {
          fluent: true,
          pad_audio: 0,
          stitch: true,
          result_format: 'mp4'
        }
      };

      if (backgroundUrl) {
        payload.background = {
          type: 'image',
          image_url: backgroundUrl
        };
      }
    }
    // Mode 2: V3 Clips API - Pre-made Full Body Presenters
    else if (mode === 'clips') {
      if (!presenterId) {
        return Response.json({ error: 'Missing presenterId for clips mode' }, { status: 400 });
      }

      console.log('👤 Presenter ID:', presenterId);

      apiUrl = 'https://api.d-id.com/clips';
      payload = {
        presenter_id: presenterId,
        driver_id: 'mXra4jY38i',
        script: {
          type: 'text',
          input: text,
          provider: voiceProvider === 'elevenlabs' ? {
            type: 'elevenlabs',
            voice_id: finalVoiceId
          } : {
            type: 'microsoft',
            voice_id: voiceId
          }
        },
        config: {
          result_format: 'mp4'
        }
      };
    }
    // Mode 3: V3 Express/Instant API - Custom Avatar
    else if (mode === 'express') {
      if (!avatarId) {
        return Response.json({ error: 'Missing avatarId for express mode' }, { status: 400 });
      }

      console.log('✨ Avatar ID:', avatarId);

      apiUrl = 'https://api.d-id.com/clips';
      payload = {
        presenter_id: avatarId,
        driver_id: 'mXra4jY38i',
        script: {
          type: 'text',
          input: text,
          provider: voiceProvider === 'elevenlabs' ? {
            type: 'elevenlabs',
            voice_id: finalVoiceId
          } : {
            type: 'microsoft',
            voice_id: voiceId
          }
        },
        config: {
          result_format: 'mp4'
        }
      };
    } else {
      return Response.json({ error: 'Invalid mode' }, { status: 400 });
    }

    // Create video
    console.log('📤 Sending to D-ID:', apiUrl);
    const headers = {
      'Authorization': `Basic ${btoa(DID_API_KEY + ':')}`,
      'Content-Type': 'application/json',
      'accept': 'application/json'
    };
    
    // Only add ElevenLabs key if using ElevenLabs
    if (voiceProvider === 'elevenlabs' && ELEVENLABS_API_KEY) {
      headers['X-Elevenlabs-Api-Key'] = ELEVENLABS_API_KEY;
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ D-ID Error:', response.status, errorText);
      return Response.json({ 
        error: `D-ID API error: ${errorText}`,
        status: response.status
      }, { status: 500 });
    }

    const result = await response.json();
    jobId = result.id;
    console.log('✅ Job created:', jobId);

    // Poll for completion
    const pollUrl = mode === 'talks' 
      ? `https://api.d-id.com/talks/${jobId}`
      : `https://api.d-id.com/clips/${jobId}`;

    let pollAttempts = 0;
    const maxPollAttempts = 120;
    let pollInterval = 2000;

    while (pollAttempts < maxPollAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      try {
        const statusResponse = await fetch(pollUrl, {
          headers: {
            'Authorization': `Basic ${btoa(DID_API_KEY + ':')}`,
            'accept': 'application/json'
          }
        });

        if (!statusResponse.ok) {
          console.error('Poll failed:', statusResponse.status);
          pollAttempts++;
          continue;
        }

        const statusData = await statusResponse.json();
        console.log(`📊 Poll ${pollAttempts + 1}: ${statusData.status}`);

        if (statusData.status === 'done' && statusData.result_url) {
          console.log('🎉 Video ready:', statusData.result_url);
          return Response.json({
            success: true,
            video_url: statusData.result_url,
            duration: statusData.duration || 0,
            job_id: jobId
          });
        }

        if (statusData.status === 'error' || statusData.status === 'rejected') {
          console.error('❌ Generation failed:', statusData);
          return Response.json({ 
            error: `Generation failed: ${statusData.error?.message || 'Unknown error'}` 
          }, { status: 500 });
        }

        // Adaptive polling
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
    console.error('🔴 Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});