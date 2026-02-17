import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { description, keyframes } = await req.json();

    if (!description) {
      return Response.json({ error: 'Missing description' }, { status: 400 });
    }

    const LUMA_API_KEY = Deno.env.get('LUMA_API_KEY');
    
    if (!LUMA_API_KEY) {
      return Response.json({ error: 'Luma API key not configured' }, { status: 500 });
    }

    console.log('🎬 Creating full production video with Luma AI...');
    console.log('📝 Description:', description);

    // Enhanced prompt for professional production
    const enhancedPrompt = `Professional news broadcast video: ${description}. Cinematic production quality, smooth camera movements, professional lighting, TV broadcast style, high definition, realistic details, 16:9 aspect ratio`;

    // Create Luma generation
    const lumaResponse = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LUMA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        aspect_ratio: '16:9',
        loop: false,
        keyframes: keyframes || undefined
      })
    });

    if (!lumaResponse.ok) {
      const errorText = await lumaResponse.text();
      console.error('Luma error:', errorText);
      return Response.json({ error: 'Failed to create video' }, { status: 500 });
    }

    const lumaData = await lumaResponse.json();
    const generationId = lumaData.id;
    
    console.log('✅ Generation started:', generationId);

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 180; // 3 minutes
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`, {
        headers: {
          'Authorization': `Bearer ${LUMA_API_KEY}`
        }
      });

      if (!statusResponse.ok) {
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();
      console.log(`📊 Status (${attempts}/${maxAttempts}):`, statusData.state);

      if (statusData.state === 'completed') {
        console.log('🎉 Video ready!');
        return Response.json({
          success: true,
          video_url: statusData.assets?.video || statusData.video?.url,
          thumbnail_url: statusData.assets?.thumbnail,
          generation_id: generationId,
          duration: 5
        });
      }

      if (statusData.state === 'failed') {
        return Response.json({ 
          error: 'Video generation failed: ' + (statusData.failure_reason || 'Unknown error')
        }, { status: 500 });
      }

      attempts++;
    }

    return Response.json({ error: 'Timeout - video still processing' }, { status: 408 });

  } catch (error) {
    console.error('🔴 Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});