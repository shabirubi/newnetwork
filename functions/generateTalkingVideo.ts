import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, avatarUrl } = await req.json();

    if (!text || !avatarUrl) {
      return Response.json({ error: 'Missing text or avatarUrl' }, { status: 400 });
    }

    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!DID_API_KEY) {
      return Response.json({ error: 'D-ID API Key not configured' }, { status: 500 });
    }

    // Generate voice with ElevenLabs
    let audioUrl = null;
    if (ELEVENLABS_API_KEY) {
      try {
        const voiceResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB', {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.0,
              use_speaker_boost: true
            }
          })
        });

        if (voiceResponse.ok) {
          const audioBlob = await voiceResponse.blob();
          const uploadResult = await base44.integrations.Core.UploadFile({ 
            file: audioBlob 
          });
          audioUrl = uploadResult.file_url;
        }
      } catch (e) {
        console.error('ElevenLabs error:', e);
      }
    }

    // Create V3 Pro Avatar using D-ID Clips API (Full-HD + תנועות גוף)
    const didPayload = {
      presenter_input: avatarUrl,
      driver: {
        expressions: {
          expressions: [
            { start_frame: 0, expression: 'neutral', intensity: 0.8 },
            { start_frame: 30, expression: 'happy', intensity: 0.7 },
            { start_frame: 60, expression: 'serious', intensity: 0.9 },
            { start_frame: 90, expression: 'happy', intensity: 0.6 }
          ]
        }
      },
      background: {
        color: '#00000000'
      }
    };

    if (audioUrl) {
      didPayload.script = {
        type: 'audio',
        audio_url: audioUrl
      };
    } else {
      didPayload.script = {
        type: 'text',
        input: text,
        provider: {
          type: 'microsoft',
          voice_id: 'he-IL-AvriNeural'
        }
      };
    }

    const response = await fetch('https://api.d-id.com/clips', {
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
      return Response.json({ error: `D-ID API error: ${error}` }, { status: 500 });
    }

    const result = await response.json();
    const clipId = result.id;

    // Poll for video completion
    let attempts = 0;
    const maxAttempts = 90;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`https://api.d-id.com/clips/${clipId}`, {
        headers: {
          'Authorization': `Basic ${DID_API_KEY}`,
          'accept': 'application/json'
        }
      });
      
      const statusData = await statusResponse.json();
      
      if (statusData.status === 'done') {
        // שמירת הוידאו ב-NewsArticle
        try {
          const article = await base44.asServiceRole.entities.NewsArticle.create({
            title: `דמות מדברת - ${text.substring(0, 50)}`,
            subtitle: 'וידאו שנוצר על ידי טכנולוגיית D-ID',
            content: text,
            category: 'technology',
            video_url: statusData.result_url,
            image_url: avatarUrl,
            is_featured: true,
            is_breaking: false,
            source: 'AI Avatar Generator'
          });
          console.log('✅ Video saved to NewsArticle:', article.id);
        } catch (dbError) {
          console.error('❌ Failed to save to database:', dbError.message);
        }

        return Response.json({
          success: true,
          video_url: statusData.result_url,
          duration: statusData.duration,
          clip_id: clipId,
          saved_to_feed: true
        });
      }
      
      if (statusData.status === 'error') {
        console.error('D-ID Error:', JSON.stringify(statusData, null, 2));
        return Response.json({ error: `Video generation failed: ${JSON.stringify(statusData.error || statusData)}` }, { status: 500 });
      }
      
      attempts++;
    }
    
    return Response.json({ error: 'Video generation timeout' }, { status: 504 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});