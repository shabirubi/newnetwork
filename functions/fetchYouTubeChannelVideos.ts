Deno.serve(async (req) => {
  try {
    const { channelId = 'UC2G__804P86EaUIYXPo4yAw', maxResults = 50 } = await req.json();
    const apiKey = Deno.env.get('YOUTUBE_API_KEY');

    if (!apiKey) {
      return Response.json({ error: 'YouTube API key not configured' }, { status: 500 });
    }

    // Get channel info
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&id=${channelId}&part=snippet,brandingSettings`;
    const channelResponse = await fetch(channelUrl);
    const channelData = await channelResponse.json();
    
    let channelInfo = null;
    if (channelData.items && channelData.items.length > 0) {
      channelInfo = {
        title: channelData.items[0].snippet.title,
        description: channelData.items[0].snippet.description,
        thumbnail: channelData.items[0].snippet.thumbnails.high?.url || channelData.items[0].snippet.thumbnails.medium?.url
      };
    }

    // Get videos from channel
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&type=video&order=date&maxResults=${maxResults}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.error) {
      return Response.json({ error: searchData.error.message }, { status: 400 });
    }

    const videos = searchData.items?.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
    })) || [];

    return Response.json({ videos, channelInfo });

  } catch (error) {
    console.error('YouTube API Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});