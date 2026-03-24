import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { description } = await req.json();

    if (!description) {
      return Response.json({ error: 'Missing description' }, { status: 400 });
    }

    const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');
    if (!HEYGEN_API_KEY) {
      return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    console.log('🎬 Digital Dreams - Creating video with HeyGen...');
    console.log('📝 User Request:', description);

    // Call HeyGen Video Agent with user's exact text
    const heygenResponse = await fetch('https://api.heygen.com/v1/video_agent/generate', {
      method: 'POST',
      headers: {
        'X-API-KEY': HEYGEN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: description
      })
    });

    const responseText = await heygenResponse.text();
    console.log('📥 HeyGen Response:', heygenResponse.status);

    if (!heygenResponse.ok) {
      console.error('❌ HeyGen error:', heygenResponse.status, responseText);
      return Response.json({ 
        error: 'HeyGen generation failed', 
        details: responseText 
      }, { status: 500 });
    }

    const heygenData = JSON.parse(responseText);
    const videoId = heygenData.data?.video_id || heygenData.video_id || heygenData.data?.id || heygenData.id;
    
    if (!videoId) {
      console.error('❌ No video ID:', heygenData);
      return Response.json({ 
        error: 'No video ID returned', 
        details: heygenData 
      }, { status: 500 });
    }

    console.log('✅ HeyGen generation started:', videoId);

    return Response.json({
      video_id: videoId,
      status: 'processing',
      message: 'Digital Dreams is creating your video...'
    });

  } catch (error) {
    console.error('🔴 Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});