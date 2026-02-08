import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const didApiKey = Deno.env.get('DID_API_KEY');

    if (!didApiKey) {
      return Response.json({ error: 'DID_API_KEY not configured' }, { status: 500 });
    }

    // Create D-ID Talk session for real-time video interaction
    const sessionResponse = await fetch('https://api.d-id.com/talks/stream', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${didApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_url: 'https://assets.d-id.com/avatars/Niki_20240123_20240502_1080p_sad.png',
        driver_url: 'bank://lipsync--v2',
        config: {
          sharpen: true,
          motion_factor: 1,
          normalization_factor: 1,
          stitch: false
        }
      })
    });

    if (!sessionResponse.ok) {
      const error = await sessionResponse.text();
      console.error('D-ID session creation failed:', sessionResponse.status, error);
      return Response.json({ error: `Failed to create D-ID session: ${error}` }, { status: 500 });
    }

    const sessionData = await sessionResponse.json();

    return Response.json({
      session_id: sessionData.session_id,
      session_token: sessionData.session_token,
      livekit_url: 'wss://livekit.d-id.com',
      livekit_client_token: sessionData.session_token,
      success: true
    });
  } catch (error) {
    console.error('D-ID session error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});