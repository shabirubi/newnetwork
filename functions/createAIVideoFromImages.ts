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

    // Generate multiple AI images with slight variations
    const frames = [];
    const basePrompt = prompt;
    
    for (let i = 0; i < num_frames; i++) {
      // Add motion keywords to create progression
      const framePrompt = `${basePrompt}, frame ${i + 1} of ${num_frames}, slight motion, cinematic`;
      
      try {
        const imageResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Generate an image: ${framePrompt}`,
          response_json_schema: {
            type: "object",
            properties: {
              image_url: { type: "string" }
            }
          }
        });

        // Actually generate the image
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