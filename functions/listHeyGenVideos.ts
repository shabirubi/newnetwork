import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');
    
    if (!HEYGEN_API_KEY) {
      return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    console.log('📋 Fetching ALL videos from HeyGen using v1 API...');

    let allVideos = [];
    let page = 0;
    const maxPages = 100;

    // Use v1/video.list with pagination
    while (page < maxPages) {
      console.log(`\n📥 Page ${page}: GET /v1/video.list`);

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
      
      console.log(`📦 Page ${page}: Found ${videos.length} videos`);
      
      if (videos.length === 0) {
        console.log('🛑 No more videos, stopping pagination');
        break;
      }

      allVideos.push(...videos);
      console.log(`✅ Total so far: ${allVideos.length} videos`);
      
      // If we got less than 100, we're at the last page
      if (videos.length < 100) {
        console.log('✅ Last page reached');
        break;
      }

      page++;
    }

    console.log(`\n🎬 FINAL: ${allVideos.length} total videos\n`);

    // Map videos to our format
    const mappedVideos = allVideos.map(v => {
      console.log(`📹 Video: ${v.video_id} | Status: ${v.status} | URL: ${v.video_url ? '✓' : '✗'}`);
      
      return {
        id: v.video_id,
        title: v.video_title || v.title || `Video ${v.video_id?.substring(0, 8)}`,
        status: v.status,
        video_url: v.video_url || v.url,
        thumbnail_url: v.thumbnail_url || v.thumbnail,
        created_at: v.created_at,
        duration: v.duration
      };
    });

    return Response.json({
      total: mappedVideos.length,
      videos: mappedVideos
    });

  } catch (error) {
    console.error('🔴 Fatal Error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});