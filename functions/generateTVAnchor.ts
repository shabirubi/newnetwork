import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    
    if (!ELEVENLABS_API_KEY || !DID_API_KEY) {
      return Response.json({ 
        error: 'API keys not configured',
        missing: {
          elevenlabs: !ELEVENLABS_API_KEY,
          did: !DID_API_KEY
        }
      }, { status: 500 });
    }

    // Get latest breaking news
    const articles = await base44.asServiceRole.entities.NewsArticle.filter(
      { is_breaking: true }, 
      '-created_date', 
      3
    );

    if (articles.length === 0) {
      return Response.json({ error: 'No breaking news found' }, { status: 404 });
    }

    // Generate script for TV anchor
    const scriptPrompt = `
אתה קריין חדשות טלוויזיה מקצועי של "הרשת החדשה".
צור תסריט שידור חדשות קצר (45-60 שניות) בעברית עם הכתבות הבאות:

${articles.map((a, i) => `${i + 1}. ${a.title}${a.subtitle ? ' - ' + a.subtitle : ''}`).join('\n')}

הנחיות לתסריט:
- פתיחה: "ערב טוב, אתכם מהסטודיו של הרשת החדשה"
- דיבור ברור, מקצועי ואמין
- שפה עברית רשמית וחדשותית
- סיום: "זה היה עדכון חדשות מהרשת החדשה"

תן רק את התסריט לקריין, בלי הערות.
`;

    const scriptResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: scriptPrompt,
      add_context_from_internet: false
    });

    const script = scriptResponse;

    // Generate audio with ElevenLabs - Male professional voice
    const voiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam - professional male voice
    
    const audioResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
          stability: 0.7,
          similarity_boost: 0.85,
          style: 0.3,
          use_speaker_boost: true
        }
      })
    });

    if (!audioResponse.ok) {
      const error = await audioResponse.text();
      console.error('ElevenLabs error:', error);
      return Response.json({ error: 'Failed to generate audio' }, { status: audioResponse.status });
    }

    // Create talking avatar with D-ID using text (simpler approach)
    const didResponse = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        source_url: 'https://create-images-results.d-id.com/google-oauth2%7C111488153715019116355/upl_ZKQCGLwxK8jGQlJ6bDsj1/image.jpeg',
        script: {
          type: 'text',
          input: script,
          provider: {
            type: 'microsoft',
            voice_id: 'he-IL-AvriNeural'
          }
        },
        config: {
          fluent: true,
          pad_audio: 0,
          stitch: true
        }
      })
    });

    if (!didResponse.ok) {
      const error = await didResponse.json();
      console.error('D-ID error:', error);
      return Response.json({ error: 'Failed to create video', details: error }, { status: didResponse.status });
    }

    const didData = await didResponse.json();

    // Poll for video completion
    const talkId = didData.id;
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max

    while (!videoUrl && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const statusResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        headers: {
          'Authorization': `Basic ${DID_API_KEY}`
        }
      });

      const statusData = await statusResponse.json();
      
      if (statusData.status === 'done') {
        videoUrl = statusData.result_url;
      } else if (statusData.status === 'error') {
        throw new Error('Video generation failed');
      }
      
      attempts++;
    }

    if (!videoUrl) {
      return Response.json({ error: 'Video generation timeout' }, { status: 408 });
    }

    return Response.json({
      video_url: videoUrl,
      script: script
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});