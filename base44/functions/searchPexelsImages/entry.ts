import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, per_page = 15, orientation = 'landscape' } = await req.json();
    
    if (!query || query.trim() === '') {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('PEXELS_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'PEXELS_API_KEY not configured' }, { status: 500 });
    }

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${per_page}&orientation=${orientation}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': apiKey
      }
    });

    if (!response.ok) {
      return Response.json({ error: 'Pexels API error: ' + response.statusText }, { status: response.status });
    }

    const data = await response.json();
    
    const images = data.photos?.map(photo => ({
      id: photo.id,
      url: photo.src.large2x,
      thumbnail: photo.src.medium,
      description: `${photo.width}x${photo.height} • ${photo.photographer}`,
      photographer: photo.photographer,
      width: photo.width,
      height: photo.height
    })) || [];

    return Response.json({ images });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});