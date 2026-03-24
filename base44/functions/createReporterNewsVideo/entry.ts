import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { articleId, reporterId, reporterName, reporterImage, reporterGender = 'male' } = await req.json();

    if (!articleId || !reporterId || !reporterImage) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch the article
    const article = await base44.asServiceRole.entities.NewsArticle.get(articleId);
    if (!article) {
      return Response.json({ error: 'Article not found' }, { status: 404 });
    }

    // Create engaging news presentation script
    const script = `שלום, אני ${reporterName}. 
    
${article.title}

${article.subtitle ? article.subtitle + '\n\n' : ''}${article.content ? article.content.substring(0, 300) + '...' : ''}

זה היה הדיווח שלי. תוכלו לקרוא את הכתבה המלאה באתר שלנו.`;

    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    if (!DID_API_KEY) {
      return Response.json({ error: 'D-ID API Key not configured' }, { status: 500 });
    }

    // Create talking video with D-ID
    const didPayload = {
      source_url: reporterImage,
      driver_url: 'bank://lively/',
      config: {
        fluent: true,
        pad_audio: 0,
        stitch: true,
        result_format: 'mp4'
      },
      script: {
        type: 'text',
        input: script,
        provider: {
          type: 'microsoft',
          voice_id: reporterGender === 'male' ? 'he-IL-AvriNeural' : 'he-IL-HilaNeural'
        }
      }
    };

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
      console.error('D-ID Error:', error);
      return Response.json({ error: `D-ID API error: ${error}` }, { status: 500 });
    }

    const result = await response.json();
    const talkId = result.id;

    console.log('📹 Reporter video generation started:', { talkId, articleId });

    // Poll for completion
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
          pollAttempts++;
          continue;
        }

        const statusData = await statusResponse.json();

        if (statusData.status === 'done' && statusData.result_url) {
          console.log('✅ Reporter video ready:', statusData.result_url);

          // Save presentation video URL to article
          await base44.asServiceRole.entities.NewsArticle.update(articleId, {
            video_url: statusData.result_url,
            is_featured: true
          });

          return Response.json({
            success: true,
            video_url: statusData.result_url,
            articleId: articleId
          });
        }

        if (statusData.status === 'error') {
          return Response.json({ error: 'Video generation failed' }, { status: 500 });
        }

        if (pollAttempts > 20) pollInterval = 3000;
        if (pollAttempts > 40) pollInterval = 5000;

        pollAttempts++;
      } catch (err) {
        console.error('Poll error:', err.message);
        pollAttempts++;
      }
    }

    return Response.json({ error: 'Video generation timeout' }, { status: 504 });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});