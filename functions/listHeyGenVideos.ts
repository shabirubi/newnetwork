Deno.serve(async (req) => {
  try {
    
    const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');
    
    if (!HEYGEN_API_KEY) {
      return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    console.log('📥 Fetching videos from HeyGen...');

    const response = await fetch('https://api.heygen.com/v1/video.list', {
      method: 'GET',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HeyGen API error:', response.status, errorText);
      return Response.json({ 
        error: `HeyGen API failed: ${errorText}`,
        videos: []
      }, { status: 500 });
    }

    const data = await response.json();
    const videos = data?.data?.videos || [];

    console.log('✅ Fetched', videos.length, 'videos from HeyGen');

    // Transform videos to our format
    const transformedVideos = videos.map(v => ({
      id: v.video_id,
      title: v.title || v.video_id,
      video_url: v.video_url || v.gif_url,
      thumbnail_url: v.thumbnail_url || v.gif_url,
      created_date: v.created_at,
      views: 0
    }));

    return Response.json({ 
      videos: transformedVideos,
      count: transformedVideos.length 
    });

  } catch (error) {
    console.error('🔴 Error fetching HeyGen videos:', error);
    return Response.json({ 
      error: error.message,
      videos: []
    }, { status: 500 });
  }
});