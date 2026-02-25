Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { maxResults = 50 } = body;
    const apiKey = Deno.env.get('YOUTUBE_API_KEY');

    if (!apiKey) {
      return Response.json({ error: 'YouTube API key not configured' }, { status: 500 });
    }

    // Search for the channel by name
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&q=הרשת החדשה&type=channel&part=snippet&maxResults=1`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.error || !searchData.items || searchData.items.length === 0) {
      return Response.json({ error: 'Channel not found', details: searchData.error }, { status: 404 });
    }

    const channelId = searchData.items[0].snippet.channelId;

    // Get channel details
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&id=${channelId}&part=contentDetails,snippet`;
    const channelResponse = await fetch(channelUrl);
    const channelData = await channelResponse.json();

    if (channelData.error || !channelData.items || channelData.items.length === 0) {
      return Response.json({ error: 'Failed to get channel details' }, { status: 404 });
    }

    const channel = channelData.items[0];
    const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;

    const channelInfo = {
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnail: channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.medium?.url
    };

    // Get videos from uploads playlist
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${uploadsPlaylistId}&part=snippet&maxResults=${maxResults}`;
    const playlistResponse = await fetch(playlistUrl);
    const playlistData = await playlistResponse.json();

    if (playlistData.error) {
      return Response.json({ error: playlistData.error.message }, { status: 400 });
    }

    const videos = playlistData.items?.map(item => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
      embedUrl: `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}`
    })) || [];

    return Response.json({ videos, channelInfo });

  } catch (error) {
    console.error('YouTube API Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});