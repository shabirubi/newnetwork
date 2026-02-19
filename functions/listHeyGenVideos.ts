import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');
    
    if (!HEYGEN_API_KEY) {
      return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    console.log('📋 Fetching all videos from HeyGen...');

    const response = await fetch('https://api.heygen.com/v1/video.list', {
      headers: {
        'X-Api-Key': HEYGEN_API_KEY
      }
    });

    const responseText = await response.text();
    console.log('📥 HeyGen Response:', response.status);

    if (!response.ok) {
      console.error('❌ Failed to fetch videos:', responseText);
      return Response.json({ 
        error: `HeyGen API error: ${responseText}`,
        status: response.status
      }, { status: 500 });
    }

    const data = JSON.parse(responseText);
    const videos = data.data?.videos || [];
    
    console.log(`✅ Found ${videos.length} videos`);

    return Response.json({
      total: videos.length,
      videos: videos.map(v => ({
        id: v.video_id,
        title: v.video_title,
        status: v.status,
        video_url: v.video_url,
        thumbnail_url: v.thumbnail_url,
        created_at: v.created_at,
        duration: v.duration
      }))
    });

  } catch (error) {
    console.error('🔴 Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});