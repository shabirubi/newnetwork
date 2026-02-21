import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { title, description } = await req.json();

    if (!title || !description) {
      return Response.json({ error: 'Title and description required' }, { status: 400 });
    }

    // 1. חיפוש בק-גראונד מ-YouTube
    const bgResponse = await base44.functions.invoke('searchYouTubeBackgrounds', {
      description: `${title} ${description}`,
      limit: 3
    });

    // 2. חיפוש מוזיקה מ-Spotify
    const musicResponse = await base44.functions.invoke('searchSpotifyMusic', {
      description: `${title} mood`,
      limit: 3
    });

    // 3. יצירת סקריפט חכם עם LLM
    const scriptResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a professional video script for: "${title}"\nDescription: ${description}\n\nMake it engaging, 30-60 seconds. Include scene descriptions.`,
      response_json_schema: {
        type: "object",
        properties: {
          scenes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                duration: { type: "number" },
                visual: { type: "string" }
              }
            }
          },
          voiceStyle: { type: "string" },
          mood: { type: "string" }
        }
      }
    });

    // 4. בחירת הטוב ביותר
    const bestBg = bgResponse.data?.videos?.[0];
    const bestTrack = musicResponse.data?.tracks?.[0];

    return Response.json({
      title,
      description,
      script: scriptResponse.scenes,
      background: bestBg,
      music: bestTrack,
      voiceStyle: scriptResponse.voiceStyle,
      mood: scriptResponse.mood,
      status: 'ready_for_generation',
      message: '🎬 סרטון חכם מוכן ליצירה עם תוכן מ-YouTube ו-Spotify!'
    });
  } catch (error) {
    console.error('Smart media video error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});