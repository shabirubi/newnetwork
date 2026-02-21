import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { description, limit = 5 } = await req.json();

    if (!description) {
      return Response.json({ error: 'Description required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'YouTube API key not configured' }, { status: 500 });
    }

    // חיפוש וידאו בק-גראונד רלוונטי ב-YouTube
    const searchQuery = `${description} background stock footage cinematic`;
    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=${limit}&key=${apiKey}`;

    const response = await fetch(youtubeUrl);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return Response.json({ 
        videos: [],
        message: 'No videos found - using default background'
      });
    }

    const videos = data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      url: `https://www.youtube.com/embed/${item.id.videoId}`,
      channelTitle: item.snippet.channelTitle
    }));

    return Response.json({ 
      videos,
      count: videos.length,
      searchQuery 
    });
  } catch (error) {
    console.error('YouTube search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});