Deno.serve(async (req) => {
  try {
    const body = await req.json();
    console.log('📥 Request body:', body);
    
    const { channelId = 'UC2G__804P86EaUIYXPo4yAw', maxResults = 50 } = body;
    const apiKey = Deno.env.get('YOUTUBE_API_KEY');

    console.log('🔑 Using channel ID:', channelId);
    console.log('🔑 API Key exists:', !!apiKey);

    if (!apiKey) {
      return Response.json({ error: 'YouTube API key not configured' }, { status: 500 });
    }

    // Get videos from channel using playlistId (uploads playlist)
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&id=${channelId}&part=contentDetails,snippet`;
    console.log('📡 Fetching channel info...');
    
    const channelResponse = await fetch(channelUrl);
    const channelData = await channelResponse.json();
    console.log('📦 Channel data:', JSON.stringify(channelData, null, 2));
    
    if (channelData.error) {
      console.error('❌ Channel API error:', channelData.error);
      return Response.json({ error: channelData.error.message }, { status: 400 });
    }

    if (!channelData.items || channelData.items.length === 0) {
      console.error('❌ Channel not found');
      return Response.json({ error: 'Channel not found' }, { status: 404 });
    }

    const channel = channelData.items[0];
    const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;
    console.log('📺 Uploads playlist ID:', uploadsPlaylistId);

    const channelInfo = {
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnail: channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.medium?.url
    };

    // Get videos from uploads playlist
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${uploadsPlaylistId}&part=snippet&maxResults=${maxResults}&order=date`;
    console.log('📡 Fetching videos from playlist...');
    
    const playlistResponse = await fetch(playlistUrl);
    const playlistData = await playlistResponse.json();
    console.log('📦 Playlist data items count:', playlistData.items?.length || 0);

    if (playlistData.error) {
      console.error('❌ Playlist API error:', playlistData.error);
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

    console.log('✅ Returning', videos.length, 'videos');
    return Response.json({ videos, channelInfo });

  } catch (error) {
    console.error('YouTube API Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});