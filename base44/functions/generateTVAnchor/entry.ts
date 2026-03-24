import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    
    if (!DID_API_KEY) {
      return Response.json({ 
        error: 'DID_API_KEY not configured'
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
צור תסריט שידור חדשות קצר (30-45 שניות) בעברית עם הכתבות הבאות:

${articles.map((a, i) => `${i + 1}. ${a.title}${a.subtitle ? ' - ' + a.subtitle : ''}`).join('\n')}

הנחיות לתסריט:
- פתיחה: "ערב טוב, אתכם מהסטודיו של הרשת החדשה"
- דיבור ברור, מקצועי ואמין
- שפה עברית רשמית וחדשותית
- קצר וממוקד - עד 3 משפטים
- סיום: "זה היה עדכון חדשות"

תן רק את התסריט לקריין, בלי הערות.
`;

    const scriptResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: scriptPrompt,
      add_context_from_internet: false
    });

    const script = scriptResponse;

    // Create talking avatar with D-ID
    console.log('Creating D-ID talk with script:', script);
    
    const didResponse = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json'
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
          pad_audio: 0.0,
          stitch: true
        }
      })
    });

    if (!didResponse.ok) {
      const errorText = await didResponse.text();
      console.error('D-ID error response:', errorText);
      return Response.json({ 
        error: 'Failed to create video', 
        details: errorText,
        status: didResponse.status 
      }, { status: 500 });
    }

    const didData = await didResponse.json();
    console.log('D-ID talk created:', didData);

    const talkId = didData.id;
    
    // Poll for video completion
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 90; // 3 minutes max

    while (!videoUrl && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        headers: {
          'Authorization': `Basic ${DID_API_KEY}`
        }
      });

      if (!statusResponse.ok) {
        console.error('Status check failed:', await statusResponse.text());
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();
      console.log(`Attempt ${attempts + 1}: Status = ${statusData.status}`);
      
      if (statusData.status === 'done') {
        videoUrl = statusData.result_url;
        break;
      } else if (statusData.status === 'error') {
        return Response.json({ 
          error: 'Video generation failed', 
          details: statusData 
        }, { status: 500 });
      }
      
      attempts++;
    }

    if (!videoUrl) {
      return Response.json({ 
        error: 'Video generation timeout',
        attempts: attempts 
      }, { status: 408 });
    }

    return Response.json({
      video_url: videoUrl,
      script: script,
      talk_id: talkId
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});