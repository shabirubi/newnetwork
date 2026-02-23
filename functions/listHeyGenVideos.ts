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

    // Get only completed videos
    const completedVideos = allVideos.filter(v => v.status === 'completed');
    console.log(`✅ ${completedVideos.length} completed videos`);

    // Fetch video URLs for ALL completed videos in batches
    const result = [];
    const batchSize = 50;
    
    console.log(`🚀 Processing ALL ${completedVideos.length} completed videos...`);
    
    for (let i = 0; i < completedVideos.length; i += batchSize) {
      const batch = completedVideos.slice(i, i + batchSize);
      console.log(`🔄 Fetching URLs for videos ${i}-${Math.min(i + batch.length, completedVideos.length)} of ${completedVideos.length}...`);
      
      const batchPromises = batch.map(async (v) => {
        try {
          const detailResponse = await fetch(
            `https://api.heygen.com/v1/video_status.get?video_id=${v.video_id}`,
            {
              method: 'GET',
              headers: {
                'X-Api-Key': HEYGEN_API_KEY,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            return {
              id: v.video_id,
              title: v.video_title || `Video ${v.video_id.substring(0, 8)}`,
              status: v.status,
              video_url: detailData.data?.video_url,
              thumbnail_url: detailData.data?.thumbnail_url,
              created_at: v.created_at,
              duration: detailData.data?.duration
            };
          }
        } catch (e) {
          console.error(`Failed to get URL for ${v.video_id}:`, e.message);
        }
        return null;
      });
      
      const batchResults = await Promise.all(batchPromises);
      result.push(...batchResults.filter(v => v && v.video_url));
    }

    console.log(`\n✅✅✅ SUCCESS! Returning ${result.length} videos with URLs out of ${completedVideos.length} completed videos`);
    console.log(`📊 Coverage: ${Math.round(result.length / completedVideos.length * 100)}% of completed videos have URLs`);

    return Response.json({
      total: result.length,
      total_completed: completedVideos.length,
      videos: result
    });

  } catch (error) {
    console.error('🔴 Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});