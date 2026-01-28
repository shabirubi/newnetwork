import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { generation_id } = await req.json();

    if (!generation_id) {
      return Response.json({ error: 'generation_id is required' }, { status: 400 });
    }

    const lumaApiKey = Deno.env.get('LUMA_API_KEY');
    if (!lumaApiKey) {
      return Response.json({ error: 'LUMA_API_KEY not configured' }, { status: 500 });
    }

    const statusResponse = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${generation_id}`, {
      headers: {
        'Authorization': `Bearer ${lumaApiKey}`
      }
    });

    if (!statusResponse.ok) {
      return Response.json({ 
        error: 'Failed to check status',
        status: statusResponse.status
      }, { status: statusResponse.status });
    }

    const statusData = await statusResponse.json();
    const status = statusData.state;

    if (status === 'completed') {
      return Response.json({
        success: true,
        status: 'completed',
        video_url: statusData.assets?.video,
        thumbnail_url: statusData.assets?.image
      });
    }

    if (status === 'failed') {
      return Response.json({
        status: 'failed',
        error: statusData.failure_reason || 'Generation failed'
      });
    }

    return Response.json({
      status: status,
      message: 'Still processing...'
    });

  } catch (error) {
    return Response.json({ 
      error: error.message
    }, { status: 500 });
  }
});