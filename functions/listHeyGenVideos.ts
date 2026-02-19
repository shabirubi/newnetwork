import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');
    
    if (!HEYGEN_API_KEY) {
      return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    console.log('📋 Fetching ALL videos from HeyGen...');
    console.log('🔑 API Key:', HEYGEN_API_KEY.substring(0, 10) + '...');

    let allVideos = [];
    let paginationToken = null;
    let iteration = 0;
    const maxIterations = 50;

    // Use pagination with token as per HeyGen API docs
    while (iteration < maxIterations) {
      iteration++;
      
      const url = paginationToken 
        ? `https://api.heygen.com/v2/video/list?limit=100&pagination_token=${paginationToken}`
        : `https://api.heygen.com/v2/video/list?limit=100`;
      
      console.log(`\n📥 Iteration ${iteration}: GET ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      const responseText = await response.text();
      console.log(`📊 Status: ${response.status}`);
      console.log(`📄 Full Response: ${responseText}`);

      if (!response.ok) {
        console.error(`❌ Request failed: ${response.status} - ${responseText}`);
        break;
      }

      const data = JSON.parse(responseText);
      
      const videos = data.data?.videos || [];
      console.log(`📦 Found ${videos.length} videos in this batch`);
      
      // Log each video
      videos.forEach((v, idx) => {
        console.log(`  ${idx + 1}. ID: ${v.video_id} | Title: ${v.video_title || v.title || 'No title'} | Status: ${v.status} | URL: ${v.video_url ? 'YES' : 'NO'}`);
      });
      
      if (videos.length > 0) {
        allVideos.push(...videos);
        console.log(`✅ TOTAL SO FAR: ${allVideos.length} videos`);
      } else {
        console.log(`🛑 No more videos, stopping`);
        break;
      }

      // Check for next pagination token
      paginationToken = data.data?.pagination_token;
      
      if (!paginationToken) {
        console.log('✅ No pagination token - reached end');
        break;
      }
      
      console.log(`🔄 Next token: ${paginationToken}`);
    }

    console.log(`\n🎬 FINAL COUNT: ${allVideos.length} videos\n`);

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