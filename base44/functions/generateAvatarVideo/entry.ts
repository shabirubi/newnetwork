import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();
    const { script, avatarStyle, voiceId, language } = body;

    if (!script || !script.trim()) {
      return Response.json({ error: 'Missing script' }, { status: 400 });
    }

    // Avatar images mapping
    const avatarImages = {
      "modern-woman": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      "modern-man": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      "professional-woman": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      "professional-man": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      "casual-woman": "https://images.unsplash.com/photo-1517849845537-1d51a20414de?w=400&h=400&fit=crop",
      "casual-man": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop"
    };

    const avatarUrl = avatarImages[avatarStyle] || avatarImages["modern-woman"];

    // Generate talking video
    const videoResponse = await base44.functions.invoke("generateTalkingVideo", {
      text: script,
      avatarUrl: avatarUrl,
      voiceId: voiceId,
      voiceProvider: "microsoft",
      gender: voiceId.includes("Ava") || voiceId.includes("Dinah") || voiceId.includes("Hila") ? "female" : "male",
      backgroundUrl: "https://images.unsplash.com/photo-1598550487956-4238a7359cd5?w=1920&h=1080&fit=crop"
    });

    if (!videoResponse.data?.video_url) {
      return Response.json({ error: 'Failed to generate video' }, { status: 500 });
    }

    return Response.json({
      success: true,
      video_url: videoResponse.data.video_url
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message || 'Generation failed'
    }, { status: 500 });
  }
});