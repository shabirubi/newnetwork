import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { description, imageUrl } = await req.json();

    if (!description) {
      return Response.json({ error: 'Missing description' }, { status: 400 });
    }

    const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');
    
    if (!HEYGEN_API_KEY) {
      return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    console.log('🎬 Creating professional video with HeyGen Agent...');
    console.log('📝 Description:', description);

    // Use HeyGen Video Agent API - one-shot prompt approach
    const videoAgentPayload = {
      prompt: description,
      dimension: {
        width: 1920,
        height: 1080
      },
      aspect_ratio: '16:9'
    };

    console.log('🤖 Calling HeyGen Video Agent API...');
    console.log('📦 Payload:', JSON.stringify(videoAgentPayload, null, 2));

    const heygenResponse = await fetch('https://api.heygen.com/v1/video_agent.generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(videoAgentPayload)
    });

    const responseText = await heygenResponse.text();
    console.log('📥 HeyGen Response:', heygenResponse.status, responseText);

    if (!heygenResponse.ok) {
      console.error('❌ HeyGen error:', heygenResponse.status, responseText);
      return Response.json({ 
        error: `HeyGen API error: ${responseText}`,
        status: heygenResponse.status
      }, { status: 500 });
    }

    const heygenData = JSON.parse(responseText);
    const videoId = heygenData.data?.video_id;
    
    if (!videoId) {
      console.error('No video ID returned:', heygenData);
      return Response.json({ error: 'No video ID returned from HeyGen' }, { status: 500 });
    }

    console.log('✅ Video generation started:', videoId);

    // Return immediately with video_id for client-side polling
    return Response.json({
      success: true,
      video_id: videoId,
      status: 'processing',
      message: 'Video generation started successfully'
    });

  } catch (error) {
    console.error('🔴 Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});