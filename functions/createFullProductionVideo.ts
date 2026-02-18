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

    console.log('🎬 Creating professional video with HeyGen...');
    console.log('📝 Description:', description);

    // 1. Generate professional script
    const scriptPrompt = `Create a professional Hebrew news script (150-250 words) about: ${description}

Requirements:
- Professional broadcast tone
- Clear opening and closing
- Engaging and informative
- Natural speaking rhythm
- Hebrew language only

Return only the script text.`;

    const scriptResult = await base44.integrations.Core.InvokeLLM({
      prompt: scriptPrompt,
      add_context_from_internet: true
    });

    const script = scriptResult?.trim() || description;
    console.log('✅ Script generated');

    // 2. Generate professional background if needed
    let backgroundUrl = imageUrl;
    if (!backgroundUrl) {
      const bgResult = await base44.integrations.Core.GenerateImage({
        prompt: 'Professional news studio background, modern TV broadcast set, blue and white colors, clean minimalist design, professional lighting, 16:9 aspect ratio, photorealistic, high quality'
      });
      backgroundUrl = bgResult.url;
      console.log('✅ Background created:', backgroundUrl);
    }

    // 3. Create HeyGen video with professional avatar
    const videoPayload = {
      video_inputs: [{
        character: {
          type: 'avatar',
          avatar_id: 'Abigail_expressive_2024112501',
          avatar_style: 'normal'
        },
        voice: {
          type: 'text',
          input_text: script,
          voice_id: 'v6WKRTqObgmv7NHgVAFD',
          speed: 1.0
        },
        background: {
          type: 'image',
          url: backgroundUrl
        }
      }],
      dimension: {
        width: 1920,
        height: 1080
      },
      aspect_ratio: '16:9',
      test: false
    };

    console.log('🎤 Calling HeyGen API...');
    console.log('📦 Payload:', JSON.stringify(videoPayload, null, 2));

    const heygenResponse = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(videoPayload)
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