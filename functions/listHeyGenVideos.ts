import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');
    
    if (!HEYGEN_API_KEY) {
      return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    console.log('📋 Fetching recent completed videos from HeyGen...');

    let allVideos = [];
    let page = 0;
    const maxPages = 100; // Fetch up to 100 pages (10,000 videos max)

    // Use v1/video.list with pagination
    while (page < maxPages) {
      console.log(`📥 Page ${page}: Fetching 100 videos...`);

      const response = await fetch(
        `https://api.heygen.com/v1/video.list?page=${page}&limit=100`,
        {
          method: 'GET',
          headers: {
            'X-Api-Key': HEYGEN_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        console.error(`❌ Page ${page} failed: ${response.status}`);
        break;
      }

      const data = await response.json();
      const videos = data.data?.videos || [];
      
      if (videos.length === 0) {
        break;
      }

      allVideos.push(...videos);
      
      if (videos.length < 100) {
        break;
      }

      page++;
    }

    console.log(`📦 Found ${allVideos.length} total videos from list API`);

    // Log sample video to see structure
    if (allVideos.length > 0) {
      console.log('📋 Sample video structure:', JSON.stringify(allVideos[0], null, 2));
    }

    // Return ALL videos without filtering - let frontend handle it
    const result = allVideos.map(v => ({
      id: v.video_id,
      title: v.video_title || v.title || `Video ${v.video_id?.substring(0, 8) || 'Unknown'}`,
      status: v.status,
      video_url: v.video_url || v.video,
      thumbnail_url: v.thumbnail_url || v.thumbnail,
      created_at: v.created_at,
      duration: v.duration
    }));

    console.log(`\n✅ Returning ${result.length} videos (all statuses)`);

    return Response.json({
      total: result.length,
      videos: result
    });

  } catch (error) {
    console.error('🔴 Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});