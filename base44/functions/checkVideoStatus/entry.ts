import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { videoId } = await req.json();
    
    if (!videoId) {
      return Response.json({ error: 'videoId required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('HEYGEN_API_KEY');
    
    if (!apiKey) {
      return Response.json({ error: 'HEYGEN_API_KEY not configured' }, { status: 500 });
    }

    const statusRes = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!statusRes.ok) {
      return Response.json({ error: 'Failed to check status' }, { status: 500 });
    }

    const statusData = await statusRes.json();
    const status = statusData?.data?.status;

    console.log(`Status: ${status}`);

    if (status === 'completed' && statusData?.data?.video_url) {
      return Response.json({
        completed: true,
        video_url: statusData.data.video_url,
        duration: statusData.data.duration || 5,
        video_id: videoId
      });
    }

    if (status === 'failed') {
      return Response.json({ 
        error: 'Video generation failed',
        details: statusData
      }, { status: 500 });
    }

    return Response.json({
      completed: false,
      status: status,
      video_id: videoId,
      message: 'עדיין בעיבוד, בדוק שוב בעוד 10 שניות'
    });
  } catch (error) {
    console.error('ERROR:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});