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
    
    if (!DID_API_KEY) {
      return Response.json({ error: 'D-ID API Key not configured' }, { status: 500 });
    }

    // Create talk using D-ID API
    const response = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        script: {
          type: 'text',
          input: text,
          provider: {
            type: 'microsoft',
            voice_id: 'he-IL-AvriNeural'
          }
        },
        source_url: avatarUrl,
        config: {
          fluent: true,
          pad_audio: 0,
          stitch: true,
          driver_expressions: {
            expressions: [
              { start_frame: 0, expression: 'neutral', intensity: 0.8 },
              { start_frame: 30, expression: 'happy', intensity: 0.5 },
              { start_frame: 60, expression: 'serious', intensity: 0.7 }
            ]
          },
          result_format: 'mp4'
        },
        driver_url: 'bank://lively',
        user_data: JSON.stringify({ created_by: user.email })
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error: `D-ID API error: ${error}` }, { status: 500 });
    }

    const result = await response.json();
    const talkId = result.id;

    // Poll for video completion
    let attempts = 0;
    const maxAttempts = 90;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        headers: {
          'Authorization': `Basic ${DID_API_KEY}`,
          'accept': 'application/json'
        }
      });
      
      const statusData = await statusResponse.json();
      
      if (statusData.status === 'done') {
        // שמירת הוידאו ב-NewsArticle
        try {
          await base44.asServiceRole.entities.NewsArticle.create({
            title: `דמות מדברת - ${text.substring(0, 50)}`,
            subtitle: 'וידאו שנוצר על ידי AI',
            content: text,
            category: 'technology',
            video_url: statusData.result_url,
            image_url: avatarUrl,
            is_featured: true,
            source: 'D-ID AI Avatar'
          });
        } catch (dbError) {
          console.error('Failed to save to database:', dbError);
        }

        return Response.json({
          success: true,
          video_url: statusData.result_url,
          duration: statusData.duration,
          talk_id: talkId
        });
      }
      
      if (statusData.status === 'error') {
        return Response.json({ error: `Video generation failed: ${statusData.error}` }, { status: 500 });
      }
      
      attempts++;
    }
    
    return Response.json({ error: 'Video generation timeout' }, { status: 504 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});