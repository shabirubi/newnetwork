import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, model = 'flux-pro', style = '', negative_prompt = '', num_images = 1, aspect_ratio = '16:9' } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const FAL_API_KEY = Deno.env.get('FAL_API_KEY');
    if (!FAL_API_KEY) {
      return Response.json({ error: 'FAL_API_KEY not configured' }, { status: 500 });
    }

    // Enhanced prompt with style
    let enhancedPrompt = prompt;
    if (style) {
      enhancedPrompt = `${prompt}, ${style}`;
    }

    // Model endpoints
    const modelEndpoints = {
      'flux-pro': 'fal-ai/flux-pro',
      'flux-dev': 'fal-ai/flux/dev',
      'flux-schnell': 'fal-ai/flux/schnell',
      'sdxl': 'fal-ai/fast-sdxl',
      'sdxl-turbo': 'fal-ai/fast-turbo-diffusion'
    };

    const endpoint = modelEndpoints[model] || modelEndpoints['flux-pro'];

    // Convert aspect ratio to dimensions
    const dimensionsMap = {
      '16:9': { width: 1344, height: 768 },
      '9:16': { width: 768, height: 1344 },
      '1:1': { width: 1024, height: 1024 },
      '4:3': { width: 1152, height: 896 },
      '3:4': { width: 896, height: 1152 }
    };
    const dimensions = dimensionsMap[aspect_ratio] || dimensionsMap['16:9'];

    const response = await fetch(`https://fal.run/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        negative_prompt: negative_prompt || undefined,
        num_images: num_images,
        image_size: aspect_ratio === '1:1' ? 'square' : (aspect_ratio === '9:16' ? 'portrait_16_9' : 'landscape_16_9'),
        ...dimensions,
        num_inference_steps: model === 'flux-schnell' ? 4 : (model === 'sdxl-turbo' ? 8 : 28),
        guidance_scale: 3.5,
        enable_safety_checker: true
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('FAL API Error:', data);
      return Response.json({ error: data.detail || 'Image generation failed' }, { status: response.status });
    }

    const images = data.images?.map(img => img.url) || [data.image?.url].filter(Boolean);

    return Response.json({
      images,
      model,
      prompt: enhancedPrompt,
      timings: data.timings
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});