import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { video_id } = await req.json();

    if (!video_id) {
      return Response.json({ error: 'Missing video_id' }, { status: 400 });
    }

    const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');
    
    if (!HEYGEN_API_KEY) {
      return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    const statusResponse = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${video_id}`, {
      headers: {
        'X-Api-Key': HEYGEN_API_KEY
      }
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      return Response.json({ 
        error: `HeyGen status check failed: ${errorText}`,
        status: statusResponse.status
      }, { status: 500 });
    }

    const statusData = await statusResponse.json();
    const status = statusData.data?.status;
    const videoUrl = statusData.data?.video_url;
    const error = statusData.data?.error;

    return Response.json({
      video_id,
      status,
      video_url: videoUrl,
      error,
      data: statusData.data
    });

  } catch (error) {
    console.error('🔴 Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});