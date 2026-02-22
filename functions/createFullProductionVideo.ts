import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { description } = await req.json();

    if (!description) {
      return Response.json({ error: 'Missing description' }, { status: 400 });
    }

    const LUMA_API_KEY = Deno.env.get('LUMA_API_KEY');
    if (!LUMA_API_KEY) {
      return Response.json({ error: 'Luma API key not configured' }, { status: 500 });
    }

    console.log('🎨 Digital Dreams - Creating immersive world from:', description);

    // Build artistic narrative with LLM
    const narrativePrompt = `You are Digital Dreams Pro - a digital alchemist building immersive visual worlds.

USER'S VISION: "${description}"

Create a RICH NARRATIVE for a cinematic video experience (NOT a news report):

Build:
1. **Opening Scene** - Set the atmosphere, the mood, the world we're entering
2. **Core Journey** - The heart of the story, what unfolds, the emotions
3. **Visual Poetry** - Describe colors, movements, textures, light
4. **Closing Moment** - How does this world leave us feeling?

Write as if painting with words. Each frame is designed like a painting. Each moment has soul.

Return ONLY the narrative text - poetic, atmospheric, immersive.`;

    console.log('🎭 Building narrative with LLM...');
    const narrative = await base44.integrations.Core.InvokeLLM({
      prompt: narrativePrompt
    });

    console.log('📝 NARRATIVE CREATED:', narrative.substring(0, 200) + '...');

    // Create video prompt for Luma - artistic and cinematic
    const lumaPrompt = `${narrative}

Cinematic, dreamlike, artistic, immersive visuals, emotional atmosphere, rich colors, dynamic camera movement, professional cinematography`;

    console.log('🎬 Generating video with Luma AI...');
    
    const lumaResponse = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LUMA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: lumaPrompt,
        aspect_ratio: '16:9',
        expand_prompt: true,
        loop: false
      })
    });

    if (!lumaResponse.ok) {
      const errorText = await lumaResponse.text();
      console.error('❌ Luma error:', errorText);
      return Response.json({ error: 'Luma generation failed', details: errorText }, { status: 500 });
    }

    const lumaData = await lumaResponse.json();
    const generationId = lumaData.id;

    console.log('✅ Luma generation started:', generationId);

    return Response.json({
      video_id: generationId,
      status: 'processing',
      narrative: narrative,
      message: 'Digital Dreams is crafting your immersive world...'
    });

  } catch (error) {
    console.error('🔴 Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});