import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const heygenApiKey = Deno.env.get('HEYGEN_API_KEY');

    if (!heygenApiKey) {
      return Response.json({ error: 'HEYGEN_API_KEY not configured' }, { status: 500 });
    }

    // Create HeyGen Interactive Avatar session
    const sessionResponse = await fetch('https://api.heygen.com/v1/interactive_avatar/start', {
      method: 'POST',
      headers: {
        'X-Api-Key': heygenApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quality: 'medium',
        avatar_id: 'Wayne_20240711',
        voice: {
          voice_id: '3d3b23fa-acaa-4ba6-a498-e6f7c34d37c8'
        }
      })
    });

    if (!sessionResponse.ok) {
      const error = await sessionResponse.text();
      console.error('HeyGen session creation failed:', sessionResponse.status, error);
      return Response.json({ error: `Failed to create HeyGen session: ${error}` }, { status: 500 });
    }

    const sessionData = await sessionResponse.json();

    return Response.json({
      session_id: sessionData.data?.session_id,
      access_token: sessionData.data?.access_token,
      livekit_url: sessionData.data?.livekit_server,
      livekit_client_token: sessionData.data?.livekit_token,
      success: true
    });
  } catch (error) {
    console.error('HeyGen session error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});