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

    // Fetch details in parallel batches of 20
    console.log('\n🔄 Fetching video details in parallel...');
    const detailedVideos = [];
    const batchSize = 20;

    for (let i = 0; i < allVideos.length; i += batchSize) {
      const batch = allVideos.slice(i, i + batchSize);
      
      const promises = batch.map(async (video) => {
        try {
          const detailResponse = await fetch(
            `https://api.heygen.com/v1/video_status.get?video_id=${video.video_id}`,
            {
              method: 'GET',
              headers: { 'X-Api-Key': HEYGEN_API_KEY }
            }
          );

          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            const detail = detailData.data;
            
            return {
              id: video.video_id,
              title: video.video_title || `Video ${video.video_id.substring(0, 8)}`,
              status: detail?.status || video.status,
              video_url: detail?.video_url,
              thumbnail_url: detail?.thumbnail_url,
              created_at: video.created_at,
              duration: detail?.duration
            };
          }
        } catch (e) {
          console.error(`⚠️ Failed: ${video.video_id}`);
        }
        
        return {
          id: video.video_id,
          title: video.video_title || `Video ${video.video_id.substring(0, 8)}`,
          status: video.status,
          video_url: null,
          thumbnail_url: null,
          created_at: video.created_at,
          duration: null
        };
      });

      const batchResults = await Promise.all(promises);
      detailedVideos.push(...batchResults);
      
      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: ${detailedVideos.length}/${allVideos.length}`);
    }

    console.log(`\n✅ DONE: ${detailedVideos.length} videos\n`);

    return Response.json({
      total: detailedVideos.length,
      videos: detailedVideos
    });

  } catch (error) {
    console.error('🔴 Fatal Error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});