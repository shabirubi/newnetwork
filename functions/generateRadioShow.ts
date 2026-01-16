import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!ELEVENLABS_API_KEY) {
      return Response.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }

    // Get latest breaking news articles
    const articles = await base44.asServiceRole.entities.NewsArticle.filter(
      { is_breaking: true }, 
      '-created_date', 
      3
    );

    if (articles.length === 0) {
      return Response.json({ error: 'No breaking news found' }, { status: 404 });
    }

    // Generate radio script
    const scriptPrompt = `
אתה רוז פיזם, שדרנית רדיו מקצועית של הרשת החדשה. 
צור תסריט שידור רדיו קצר (60-90 שניות) בעברית עם הכתבות הבאות:

${articles.map((a, i) => `${i + 1}. ${a.title} - ${a.subtitle || ''}`).join('\n')}

התסריט צריך להיות:
- דינמי ומרגש
- בשפה עברית טבעית
- עם מעברים חלקים בין הכתבות
- פתיחה: "שלום, אני רוז פיזם, והנה העדכונים החמים ביותר מהרשת החדשה"
- סיום: "זה היה עדכון חדשות מהרשת החדשה, הישארו איתנו"

תן רק את התסריט, בלי הערות או הסברים.
`;

    const scriptResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: scriptPrompt,
      add_context_from_internet: false
    });

    const script = scriptResponse;

    // Generate audio with ElevenLabs - Rachel voice (female Hebrew)
    const voiceId = 'pNInz6obpgDQGcFmaJgB'; // Rachel - natural female voice
    
    const elevenLabsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
          stability: 0.6,
          similarity_boost: 0.8,
          style: 0.5,
          use_speaker_boost: true
        }
      })
    });

    if (!elevenLabsResponse.ok) {
      const error = await elevenLabsResponse.text();
      console.error('ElevenLabs error:', error);
      return Response.json({ error: 'Failed to generate audio' }, { status: elevenLabsResponse.status });
    }

    const audioBuffer = await elevenLabsResponse.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="radio-show.mp3"'
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});