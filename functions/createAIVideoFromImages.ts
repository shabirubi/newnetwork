import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, num_frames = 4, fps = 2 } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Enhance prompt with character details if not explicitly mentioned
    let enhancedPrompt = prompt;
    const hasCharacter = /person|man|woman|character|דמות|אדם|איש|אישה/i.test(prompt);
    
    if (!hasCharacter) {
      // Add a character to make the video more dynamic
      enhancedPrompt = `${prompt}, with a person in the scene, cinematic framing`;
    }

    // Generate multiple AI images with slight variations
    const frames = [];
    const motionKeywords = [
      'beginning of motion',
      'slight movement forward',
      'continuing motion',
      'end of motion sequence'
    ];
    
    for (let i = 0; i < num_frames; i++) {
      // Create progression through motion keywords
      const motionPhase = motionKeywords[Math.min(i, motionKeywords.length - 1)];
      const framePrompt = `${enhancedPrompt}, ${motionPhase}, frame ${i + 1} of ${num_frames}, cinematic, smooth motion, professional photography`;
      
      try {
        // Generate the image
        const { url } = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: framePrompt
        });

        if (url) {
          frames.push({
            url: url,
            order: i
          });
        }
      } catch (error) {
        console.error(`Error generating frame ${i}:`, error);
      }
    }

    if (frames.length === 0) {
      return Response.json({
        error: 'Failed to generate any frames'
      }, { status: 500 });
    }

    // Return the frames - frontend will create video from them
    return Response.json({
      success: true,
      frames: frames,
      metadata: {
        prompt: prompt,
        num_frames: frames.length,
        fps: fps,
        duration: frames.length / fps,
        type: 'image-sequence'
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message
    }, { status: 500 });
  }
});