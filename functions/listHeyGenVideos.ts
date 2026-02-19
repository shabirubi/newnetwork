import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');
    
    if (!HEYGEN_API_KEY) {
      return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    console.log('📋 Fetching ALL videos & templates from HeyGen...');
    console.log('🔑 API Key:', HEYGEN_API_KEY.substring(0, 10) + '...');

    let allVideos = [];

    // Method 1: Get regular videos with pagination
    console.log('\n🎥 METHOD 1: Fetching regular videos...');
    let paginationToken = null;
    let iteration = 0;
    const maxIterations = 50;

    while (iteration < maxIterations) {
      iteration++;
      
      const url = paginationToken 
        ? `https://api.heygen.com/v2/video/list?limit=100&pagination_token=${paginationToken}`
        : `https://api.heygen.com/v2/video/list?limit=100`;
      
      console.log(`📥 Video Iteration ${iteration}: GET ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`❌ Videos request failed: ${response.status}`);
        break;
      }

      const data = await response.json();
      const videos = data.data?.videos || [];
      console.log(`📦 Found ${videos.length} regular videos`);
      
      if (videos.length > 0) {
        allVideos.push(...videos.map(v => ({ ...v, source: 'regular' })));
        console.log(`✅ Total videos: ${allVideos.length}`);
      } else {
        break;
      }

      paginationToken = data.data?.pagination_token;
      if (!paginationToken) break;
    }

    // Method 2: Get template-based videos
    console.log('\n📐 METHOD 2: Fetching template videos...');
    try {
      const templatesResponse = await fetch('https://api.heygen.com/v2/templates', {
        method: 'GET',
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        console.log('📄 Templates response:', JSON.stringify(templatesData).substring(0, 500));
        
        const templates = templatesData.data?.templates || templatesData.data || [];
        console.log(`📐 Found ${templates.length} templates`);
        
        // For each template, try to get generated videos
        for (const template of templates.slice(0, 10)) {
          try {
            const templateVideosResponse = await fetch(
              `https://api.heygen.com/v2/video/list?template_id=${template.template_id}`,
              {
                method: 'GET',
                headers: {
                  'X-Api-Key': HEYGEN_API_KEY,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            if (templateVideosResponse.ok) {
              const templateVideosData = await templateVideosResponse.json();
              const templateVideos = templateVideosData.data?.videos || [];
              if (templateVideos.length > 0) {
                allVideos.push(...templateVideos.map(v => ({ ...v, source: 'template', template_id: template.template_id })));
                console.log(`✅ Added ${templateVideos.length} videos from template ${template.template_id}`);
              }
            }
          } catch (e) {
            console.log(`⚠️ Failed to fetch videos for template ${template.template_id}`);
          }
        }
      }
    } catch (e) {
      console.error('❌ Templates fetch failed:', e.message);
    }

    console.log(`\n🎬 FINAL COUNT: ${allVideos.length} total videos\n`);

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