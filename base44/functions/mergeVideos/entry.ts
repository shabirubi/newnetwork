import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { video_urls } = await req.json();
    
    if (!video_urls || !Array.isArray(video_urls) || video_urls.length < 2) {
      return Response.json({ error: 'Minimum 2 videos required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('FAL_API_KEY');
    
    if (!apiKey) {
      return Response.json({ error: 'FAL_API_KEY not configured' }, { status: 500 });
    }

    console.log(`Merging ${video_urls.length} videos...`);

    // Use fal.ai to concatenate videos
    const response = await fetch('https://queue.fal.run/fal-ai/video-concat', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_urls: video_urls
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Merge failed:', error);
      return Response.json({ error: 'Failed to merge videos', details: error }, { status: 500 });
    }

    const data = await response.json();
    const requestId = data.request_id;

    if (!requestId) {
      return Response.json({ error: 'No request_id returned' }, { status: 500 });
    }

    // Poll for result (max 2 minutes)
    for (let i = 0; i < 120; i++) {
      await new Promise(r => setTimeout(r, 1000));

      const statusRes = await fetch(`https://queue.fal.run/fal-ai/video-concat/requests/${requestId}`, {
        headers: {
          'Authorization': `Key ${apiKey}`
        }
      });

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        
        console.log(`Check ${i+1}/120: ${statusData.status}`);

        if (statusData.status === 'COMPLETED' && statusData.video?.url) {
          console.log('Merged video ready:', statusData.video.url);
          return Response.json({
            video_url: statusData.video.url,
            duration: statusData.video.duration || null
          });
        }

        if (statusData.status === 'FAILED') {
          return Response.json({ 
            error: 'Merge failed', 
            details: statusData.error 
          }, { status: 500 });
        }
      }
    }

    return Response.json({ 
      error: 'Timeout - still processing',
      request_id: requestId 
    }, { status: 408 });

  } catch (error) {
    console.error('ERROR:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});