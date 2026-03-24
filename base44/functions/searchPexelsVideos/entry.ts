import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, page = 1, per_page = 15 } = await req.json();

    if (!query || query.trim() === '') {
      return Response.json({ error: 'חיפוש ריק' }, { status: 400 });
    }

    const apiKey = Deno.env.get('PEXELS_API_KEY');
    if (!apiKey) {
      return Response.json({ 
        error: 'PEXELS_API_KEY לא מוגדר. הגדר ב-Dashboard > Settings > Secrets',
        videos: []
      }, { status: 200 });
    }

    // חיפוש ב-Pexels API
    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}&orientation=landscape`,
      {
        headers: {
          'Authorization': apiKey
        }
      }
    );

    if (!response.ok) {
      console.error('Pexels API error:', response.status, await response.text());
      return Response.json({ 
        error: `Pexels API error: ${response.status}`,
        videos: []
      }, { status: 200 });
    }

    const data = await response.json();

    // המר לפורמט שלנו
    const videos = data.videos.map(video => ({
      id: video.id,
      title: query,
      url: video.video_files.find(f => f.quality === 'hd')?.link || video.video_files[0]?.link,
      thumbnail: video.image,
      duration: video.duration,
      description: `${video.width}x${video.height} • ${video.user.name}`,
      width: video.width,
      height: video.height,
      user: video.user.name
    }));

    return Response.json({ 
      videos,
      total: data.total_results,
      page: data.page,
      per_page: data.per_page
    });

  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ 
      error: error.message,
      videos: []
    }, { status: 500 });
  }
});