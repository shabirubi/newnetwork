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
    console.log('📊 Video statuses:', allVideos.map(v => v.status).reduce((acc, s) => {
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {}));

    // Get ALL videos regardless of status
    const completedVideos = allVideos;
    console.log(`✅ Processing ${completedVideos.length} videos (all statuses)`);

    // Map directly from list API response - it already has video_url
    const result = allVideos
      .map(v => ({
        id: v.video_id,
        title: v.video_title || `Video ${v.video_id.substring(0, 8)}`,
        status: v.status,
        video_url: v.video_url, // Use video_url directly from list response
        thumbnail_url: v.thumbnail_url,
        created_at: v.created_at,
        duration: v.duration
      }))
      .filter(v => v.video_url); // Only include videos with valid URLs

    console.log(`\n✅✅✅ SUCCESS! Returning ${result.length} סרטונים עם URLs`);
    console.log(`📊 כל הסרטונים של ${result.length} זמינים עכשיו!`);

    return Response.json({
      total: result.length,
      total_completed: allVideos.length,
      videos: result
    });

  } catch (error) {
    console.error('🔴 Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});