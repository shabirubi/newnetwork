Deno.serve(async (req) => {
  try {
    const { searchQuery, channelId, channelHandle, maxResults = 20 } = await req.json();
    const apiKey = Deno.env.get('YOUTUBE_API_KEY');

    if (!apiKey) {
      return Response.json({ error: 'YouTube API key not configured' }, { status: 500 });
    }

    let videos = [];
    let actualChannelId = channelId;
    let channelInfo = null;

    // If handle provided, get channel ID first
    if (channelHandle && !channelId) {
      const channelUrl = `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&forHandle=${channelHandle}&part=snippet,brandingSettings`;
      const channelResponse = await fetch(channelUrl);
      const channelData = await channelResponse.json();
      
      if (channelData.items && channelData.items.length > 0) {
        actualChannelId = channelData.items[0].id;
        channelInfo = {
          title: channelData.items[0].snippet.title,
          description: channelData.items[0].snippet.description,
          thumbnail: channelData.items[0].snippet.thumbnails.high?.url || channelData.items[0].snippet.thumbnails.medium?.url,
          bannerImage: channelData.items[0].brandingSettings?.image?.bannerExternalUrl
        };
      }
    }

    if (actualChannelId) {
      // Fetch videos from specific channel
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${actualChannelId}&part=snippet&type=video&order=date&maxResults=${maxResults}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (searchData.error) {
        return Response.json({ error: searchData.error.message }, { status: 400 });
      }

      videos = searchData.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
      }));
    } else if (searchQuery) {
      // Search for videos by query
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&q=${encodeURIComponent(searchQuery)}&part=snippet&type=video&order=date&maxResults=${maxResults}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (searchData.error) {
        return Response.json({ error: searchData.error.message }, { status: 400 });
      }

      videos = searchData.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
      }));
    } else {
      return Response.json({ error: 'Either channelId, channelHandle or searchQuery is required' }, { status: 400 });
    }

    return Response.json({ videos, channelInfo });

  } catch (error) {
    console.error('YouTube API Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});