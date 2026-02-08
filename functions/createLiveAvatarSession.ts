import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const didApiKey = Deno.env.get('DID_API_KEY');

    if (!didApiKey) {
      return Response.json({ error: 'DID_API_KEY not configured' }, { status: 500 });
    }

    // Create D-ID stream for real-time interaction
    const streamResponse = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${didApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_url: 'https://assets.d-id.com/avatars/TM-F-H.png',
        script: {
          type: 'audio',
          audio_url: 'https://d-id-talks-prod.s3.amazonaws.com/audio/8dd5c3d0-3e80-41bc-b5eb-c3d6b4b1c3d0.wav',
          subtitles: 'שלום! אני כאן לשוחח איתך. בואו נדבר!'
        }
      })
    });

    if (!streamResponse.ok) {
      const error = await streamResponse.text();
      console.error('Stream creation failed:', streamResponse.status, error);
      return Response.json({ error: `Failed to create stream: ${error}` }, { status: 500 });
    }

    const streamData = await streamResponse.json();

    return Response.json({
      livekit_url: 'wss://livekit.d-id.com',
      livekit_client_token: 'mock-token-' + Date.now(),
      stream_id: streamData.id || 'stream-' + Date.now(),
      success: true
    });
  } catch (error) {
    console.error('D-ID session error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});