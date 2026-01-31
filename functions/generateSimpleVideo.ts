import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { title, content, imageUrl } = await req.json();

    if (!title || !content) {
      return Response.json({ error: 'Missing title or content' }, { status: 400 });
    }

    const LUMA_API_KEY = Deno.env.get('LUMA_API_KEY');
    
    if (!LUMA_API_KEY) {
      return Response.json({ error: 'Luma API Key not configured' }, { status: 500 });
    }

    console.log('🎬 Generating video for:', title);

    // Use Luma to create a video from the image and text
    const response = await fetch('https://api.lumaai.net/video/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LUMA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: `${title}. ${content}`,
        aspect_ratio: '16:9',
        loop: false
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Luma error:', error);
      return Response.json({ error: `Luma error: ${error}` }, { status: 500 });
    }

    const result = await response.json();
    
    return Response.json({
      success: true,
      url: result.url || result.video_url,
      video_url: result.url || result.video_url
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});