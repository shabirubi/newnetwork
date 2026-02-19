import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');
    
    if (!HEYGEN_API_KEY) {
      return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    console.log('📋 Fetching ALL videos from HeyGen API...');

    // Try multiple API endpoints to get ALL videos
    let allVideos = [];
    
    // Method 1: Get video list with pagination
    try {
      console.log('📥 Method 1: Trying v1/video.list...');
      for (let page = 0; page < 20; page++) {
        const response = await fetch(`https://api.heygen.com/v1/video.list?page=${page}&limit=100`, {
          method: 'GET',
          headers: {
            'X-Api-Key': HEYGEN_API_KEY,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`📦 v1/video.list Page ${page} Response:`, JSON.stringify(data));
          
          const videos = data.data?.videos || [];
          if (videos.length > 0) {
            allVideos.push(...videos);
            console.log(`✅ Page ${page}: Added ${videos.length} videos, total: ${allVideos.length}`);
          } else {
            console.log(`🛑 Page ${page}: No more videos, stopping pagination`);
            break;
          }
        } else {
          console.log(`⚠️ v1/video.list failed with status ${response.status}`);
          break;
        }
      }
    } catch (e) {
      console.error('❌ Method 1 failed:', e.message);
    }

    // Method 2: Try v2/video/list
    try {
      console.log('📥 Method 2: Trying v2/video/list...');
      const response2 = await fetch('https://api.heygen.com/v2/video/list', {
        method: 'GET',
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (response2.ok) {
        const data2 = await response2.json();
        console.log('📦 v2/video/list Response:', JSON.stringify(data2));
        const videos2 = data2.data?.videos || [];
        
        // Merge without duplicates
        for (const video of videos2) {
          if (!allVideos.find(v => v.video_id === video.video_id)) {
            allVideos.push(video);
          }
        }
        console.log(`✅ v2/video/list: Total after merge: ${allVideos.length}`);
      }
    } catch (e) {
      console.error('❌ Method 2 failed:', e.message);
    }

    // Method 3: Try listing templates/projects
    try {
      console.log('📥 Method 3: Trying v1/template.list...');
      const response3 = await fetch('https://api.heygen.com/v1/template.list', {
        method: 'GET',
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (response3.ok) {
        const data3 = await response3.json();
        console.log('📦 v1/template.list Response:', JSON.stringify(data3));
      }
    } catch (e) {
      console.error('❌ Method 3 failed:', e.message);
    }

    console.log(`✅ FINAL TOTAL: ${allVideos.length} videos found`);

    // Map and return all videos
    const mappedVideos = allVideos.map(v => ({
      id: v.video_id,
      title: v.video_title || v.title || `Video ${v.video_id?.substring(0, 8)}`,
      status: v.status,
      video_url: v.video_url,
      thumbnail_url: v.thumbnail_url,
      created_at: v.created_at,
      duration: v.duration,
      raw: v // Include raw data for debugging
    }));

    console.log('🎬 Returning mapped videos:', mappedVideos.length);

    return Response.json({
      total: mappedVideos.length,
      videos: mappedVideos
    });

  } catch (error) {
    console.error('🔴 Fatal Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});