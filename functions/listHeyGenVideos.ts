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

    // Fetch full details for each video to get video_url
    console.log('\n🔄 Fetching video details for URLs...');
    const detailedVideos = [];

    for (let i = 0; i < allVideos.length; i++) {
      const video = allVideos[i];
      
      try {
        const detailResponse = await fetch(
          `https://api.heygen.com/v1/video_status.get?video_id=${video.video_id}`,
          {
            method: 'GET',
            headers: {
              'X-Api-Key': HEYGEN_API_KEY
            }
          }
        );

        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          const detail = detailData.data;
          
          detailedVideos.push({
            id: video.video_id,
            title: video.video_title || `Video ${video.video_id.substring(0, 8)}`,
            status: detail?.status || video.status,
            video_url: detail?.video_url,
            thumbnail_url: detail?.thumbnail_url,
            created_at: video.created_at,
            duration: detail?.duration
          });

          if ((i + 1) % 10 === 0) {
            console.log(`✅ Processed ${i + 1}/${allVideos.length} videos`);
          }
        }
      } catch (e) {
        console.error(`⚠️ Failed to get details for ${video.video_id}`);
        // Add without URL
        detailedVideos.push({
          id: video.video_id,
          title: video.video_title || `Video ${video.video_id.substring(0, 8)}`,
          status: video.status,
          video_url: null,
          thumbnail_url: null,
          created_at: video.created_at,
          duration: null
        });
      }
    }

    console.log(`\n✅ Completed: ${detailedVideos.length} videos with details\n`);

    return Response.json({
      total: detailedVideos.length,
      videos: detailedVideos
    });

  } catch (error) {
    console.error('🔴 Fatal Error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});