import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');
    
    if (!HEYGEN_API_KEY) {
      return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    console.log('📋 Fetching ALL videos from HeyGen (including completed ones)...');

    // Get all videos with pagination
    let allVideos = [];
    let page = 0;
    let hasMore = true;

    while (hasMore && page < 10) {
      const response = await fetch(`https://api.heygen.com/v1/video.list?page=${page}&limit=100`, {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY
        }
      });

      const responseText = await response.text();
      console.log(`📥 Page ${page} Response:`, response.status);

      if (!response.ok) {
        console.error('❌ Failed to fetch videos:', responseText);
        break;
      }

      const data = JSON.parse(responseText);
      const videos = data.data?.videos || [];
      
      console.log(`📦 Page ${page}: Found ${videos.length} videos`);
      
      if (videos.length > 0) {
        allVideos.push(...videos);
        page++;
      } else {
        hasMore = false;
      }

      // Also check if there's a next page indicator
      if (!data.data?.has_more) {
        hasMore = false;
      }
    }

    console.log(`✅ TOTAL: ${allVideos.length} videos found across all pages`);

    // Map and return all videos
    const mappedVideos = allVideos.map(v => ({
      id: v.video_id,
      title: v.video_title || v.title || `Video ${v.video_id?.substring(0, 8)}`,
      status: v.status,
      video_url: v.video_url,
      thumbnail_url: v.thumbnail_url,
      created_at: v.created_at,
      duration: v.duration
    }));

    console.log('🎬 Mapped videos:', mappedVideos.length);

    return Response.json({
      total: mappedVideos.length,
      videos: mappedVideos
    });

  } catch (error) {
    console.error('🔴 Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});