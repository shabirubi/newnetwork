import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl, name } = await req.json();

    if (!imageUrl) {
      return Response.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    if (!DID_API_KEY) {
      return Response.json({ error: 'D-ID API key not configured' }, { status: 500 });
    }

    // Create instant avatar from image
    const response = await fetch('https://api.d-id.com/v3/avatars', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: imageUrl,
        name: name || 'Custom Avatar',
        type: 'instant'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('D-ID API error:', error);
      return Response.json({ 
        error: 'Failed to create avatar',
        details: error 
      }, { status: response.status });
    }

    const data = await response.json();

    return Response.json({
      success: true,
      avatar_id: data.id,
      avatar_url: data.image_url,
      name: data.name
    });

  } catch (error) {
    console.error('Create instant avatar error:', error);
    return Response.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
});