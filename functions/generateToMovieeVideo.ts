import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Parse request
    const { prompt, movement = 'duck', mode = 'text-to-video' } = await req.json();
    
    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    console.log('Generating video with ToMoviee:', { prompt, movement, mode });

    // דמה: החזר סרטון דוגמה
    const mockVideo = 'https://media.w3.org/cc0-video/big_buck_bunny_720p_2mb.mp4';

    return Response.json({
      success: true,
      video_url: mockVideo,
      prompt: prompt,
      movement: movement
    });

  } catch (error) {
    console.error('Error generating ToMoviee video:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate video' 
    }, { status: 500 });
  }
});