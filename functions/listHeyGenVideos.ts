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
    const maxPages = 3; // Only fetch first 3 pages (300 videos max)

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

    // Filter to only completed videos with URLs
    const completedVideos = allVideos.filter(v => v.status === 'completed' && v.video_url);
    console.log(`✅ ${completedVideos.length} are completed with URLs`);

    // Return completed videos directly without fetching details
    const result = completedVideos.map(v => ({
      id: v.video_id,
      title: v.video_title || `Video ${v.video_id.substring(0, 8)}`,
      status: v.status,
      video_url: v.video_url,
      thumbnail_url: v.thumbnail_url,
      created_at: v.created_at,
      duration: v.duration
    }));

    console.log(`\n✅ Returning ${result.length} videos`);

    return Response.json({
      total: result.length,
      videos: result
    });

  } catch (error) {
    console.error('🔴 Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});