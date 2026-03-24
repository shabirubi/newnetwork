import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { script, topic } = await req.json();

    if (!script) {
      return Response.json({ error: 'Missing script' }, { status: 400 });
    }

    console.log('🎬 Starting production video creation...');
    console.log('📝 Script:', script.substring(0, 100) + '...');

    // 1. Generate background image
    console.log('🎨 Generating background...');
    const bgPrompt = `Professional news studio background, modern TV broadcast set, clean and minimalist, blue and white colors, professional lighting, 16:9 aspect ratio, photorealistic`;
    
    const bgResult = await base44.integrations.Core.GenerateImage({
      prompt: bgPrompt
    });
    
    const backgroundUrl = bgResult.url;
    console.log('✅ Background created:', backgroundUrl);

    // 2. Generate talking head video with HeyGen
    console.log('🎤 Generating presenter video...');
    const videoResult = await base44.functions.invoke('generateHeyGenCharacter', {
      script: script,
      avatar_id: "Abigail_expressive_2024112501",
      voice_id: "v6WKRTqObgmv7NHgVAFD",
      background: "transparent"
    });

    if (!videoResult.data?.video_url) {
      return Response.json({ error: 'Failed to generate video' }, { status: 500 });
    }

    const presenterVideoUrl = videoResult.data.video_url;
    console.log('✅ Presenter video created:', presenterVideoUrl);

    // 3. Create overlay graphics (title, logo, etc)
    console.log('📊 Generating title card...');
    const titlePrompt = `Professional news title card, Hebrew text "${topic || 'חדשות'}", modern design, blue and white gradient, clean typography, news broadcast style, 16:9`;
    
    const titleResult = await base44.integrations.Core.GenerateImage({
      prompt: titlePrompt
    });
    
    const titleCardUrl = titleResult.url;
    console.log('✅ Title card created:', titleCardUrl);

    // Return all assets - frontend will compose them
    return Response.json({
      success: true,
      video_url: presenterVideoUrl,
      background_url: backgroundUrl,
      title_card_url: titleCardUrl,
      duration: videoResult.data.duration || 10,
      message: 'Video assets ready for composition'
    });

  } catch (error) {
    console.error('🔴 Error:', error);
    return Response.json({ 
      error: error.message || 'Production failed' 
    }, { status: 500 });
  }
});