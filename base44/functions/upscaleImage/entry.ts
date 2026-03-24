import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_url, scale = 2 } = await req.json();

    if (!image_url) {
      return Response.json({ error: 'image_url is required' }, { status: 400 });
    }

    const FAL_API_KEY = Deno.env.get('FAL_API_KEY');
    if (!FAL_API_KEY) {
      return Response.json({ error: 'FAL_API_KEY not configured' }, { status: 500 });
    }

    const response = await fetch('https://fal.run/fal-ai/clarity-upscaler', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: image_url,
        scale: Math.min(scale, 4), // Max 4x
        prompt: 'high quality, detailed, sharp'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Upscale error:', data);
      return Response.json({ error: data.detail || 'Upscaling failed' }, { status: response.status });
    }

    return Response.json({
      image_url: data.image.url
    });

  } catch (error) {
    console.error('Error upscaling image:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});