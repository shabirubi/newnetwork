import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { description, limit = 5 } = await req.json();

    if (!description) {
      return Response.json({ error: 'Description required' }, { status: 400 });
    }

    const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
    const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      return Response.json({ error: 'Spotify credentials not configured' }, { status: 500 });
    }

    // קבלת access token
    const authResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
      },
      body: 'grant_type=client_credentials'
    });

    const authData = await authResponse.json();
    if (!authData.access_token) {
      throw new Error('Failed to authenticate with Spotify');
    }

    // חיפוש מוזיקה רלוונטית
    const searchQuery = description;
    const spotifyUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=${limit}`;

    const response = await fetch(spotifyUrl, {
      headers: {
        'Authorization': `Bearer ${authData.access_token}`
      }
    });

    const data = await response.json();

    if (!data.tracks || data.tracks.items.length === 0) {
      return Response.json({ 
        tracks: [],
        message: 'No music found'
      });
    }

    const tracks = data.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      duration: track.duration_ms,
      preview: track.preview_url,
      image: track.album.images[0]?.url,
      url: track.external_urls.spotify
    }));

    return Response.json({ 
      tracks,
      count: tracks.length,
      searchQuery
    });
  } catch (error) {
    console.error('Spotify search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});