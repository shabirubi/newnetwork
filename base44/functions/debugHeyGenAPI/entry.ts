import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');
    
    if (!HEYGEN_API_KEY) {
      return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    console.log('🔍 DEBUG: Testing all HeyGen API endpoints...\n');

    const results = {};

    // Test 1: v2/video/list
    console.log('📥 Test 1: GET /v2/video/list');
    try {
      const r1 = await fetch('https://api.heygen.com/v2/video/list?limit=100', {
        headers: { 'X-Api-Key': HEYGEN_API_KEY }
      });
      const d1 = await r1.json();
      results.v2_video_list = {
        status: r1.status,
        count: d1.data?.videos?.length || 0,
        has_pagination: !!d1.data?.pagination_token,
        sample: d1.data?.videos?.[0] || null,
        full_response: d1
      };
      console.log(`✅ Found ${results.v2_video_list.count} videos`);
    } catch (e) {
      results.v2_video_list = { error: e.message };
      console.log(`❌ Failed: ${e.message}`);
    }

    // Test 2: v1/video.list
    console.log('\n📥 Test 2: GET /v1/video.list');
    try {
      const r2 = await fetch('https://api.heygen.com/v1/video.list?limit=100', {
        headers: { 'X-Api-Key': HEYGEN_API_KEY }
      });
      const d2 = await r2.json();
      results.v1_video_list = {
        status: r2.status,
        count: d2.data?.videos?.length || 0,
        sample: d2.data?.videos?.[0] || null,
        full_response: d2
      };
      console.log(`✅ Found ${results.v1_video_list.count} videos`);
    } catch (e) {
      results.v1_video_list = { error: e.message };
      console.log(`❌ Failed: ${e.message}`);
    }

    // Test 3: v2/templates
    console.log('\n📥 Test 3: GET /v2/templates');
    try {
      const r3 = await fetch('https://api.heygen.com/v2/templates', {
        headers: { 'X-Api-Key': HEYGEN_API_KEY }
      });
      const d3 = await r3.json();
      results.v2_templates = {
        status: r3.status,
        count: d3.data?.templates?.length || 0,
        sample: d3.data?.templates?.[0] || null,
        full_response: d3
      };
      console.log(`✅ Found ${results.v2_templates.count} templates`);
    } catch (e) {
      results.v2_templates = { error: e.message };
      console.log(`❌ Failed: ${e.message}`);
    }

    // Test 4: v1/template.list
    console.log('\n📥 Test 4: GET /v1/template.list');
    try {
      const r4 = await fetch('https://api.heygen.com/v1/template.list', {
        headers: { 'X-Api-Key': HEYGEN_API_KEY }
      });
      const d4 = await r4.json();
      results.v1_template_list = {
        status: r4.status,
        data: d4,
        full_response: d4
      };
      console.log(`✅ Response:`, JSON.stringify(d4).substring(0, 200));
    } catch (e) {
      results.v1_template_list = { error: e.message };
      console.log(`❌ Failed: ${e.message}`);
    }

    // Test 5: v2/video_status
    console.log('\n📥 Test 5: GET /v2/video_status (if we have a video ID)');
    if (results.v2_video_list?.sample?.video_id) {
      try {
        const videoId = results.v2_video_list.sample.video_id;
        const r5 = await fetch(`https://api.heygen.com/v2/video_status/${videoId}`, {
          headers: { 'X-Api-Key': HEYGEN_API_KEY }
        });
        const d5 = await r5.json();
        results.v2_video_status = { status: r5.status, data: d5 };
        console.log(`✅ Status response:`, JSON.stringify(d5).substring(0, 200));
      } catch (e) {
        results.v2_video_status = { error: e.message };
      }
    }

    console.log('\n📊 SUMMARY:');
    console.log(`- v2/video/list: ${results.v2_video_list.count || 0} videos`);
    console.log(`- v1/video.list: ${results.v1_video_list.count || 0} videos`);
    console.log(`- v2/templates: ${results.v2_templates.count || 0} templates`);

    return Response.json({
      summary: {
        v2_videos: results.v2_video_list.count || 0,
        v1_videos: results.v1_video_list.count || 0,
        templates: results.v2_templates.count || 0
      },
      detailed_results: results
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('🔴 Fatal Error:', error);
    return Response.json({ 
      error: error.message, 
      stack: error.stack 
    }, { status: 500 });
  }
});