import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const apiKey = Deno.env.get('LIVEAVATAR_API_KEY');

    if (!apiKey) {
      return Response.json({ error: 'LIVEAVATAR_API_KEY not configured' }, { status: 500 });
    }

    // Create session token
    const tokenResponse = await fetch('https://api.liveavatar.com/v1/sessions/token', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        mode: 'FULL',
        avatar_id: 'joshua_lite3_20230714',
        avatar_persona: {
          voice_id: 'b7d50908-b17c-442d-ad8d-810c63997ed9',
          language: 'he'
        }
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token creation failed:', tokenResponse.status, error);
      return Response.json({ error: `Failed to create session token: ${error}` }, { status: 500 });
    }

    const { session_id, session_token } = await tokenResponse.json();

    // Start the session
    const startResponse = await fetch('https://api.liveavatar.com/v1/sessions/start', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'authorization': `Bearer ${session_token}`
      }
    });

    if (!startResponse.ok) {
      const error = await startResponse.text();
      console.error('Session start failed:', startResponse.status, error);
      return Response.json({ error: `Failed to start session: ${error}` }, { status: 500 });
    }

    const sessionData = await startResponse.json();

    return Response.json({
      session_id,
      session_token,
      ...sessionData
    });
  } catch (error) {
    console.error('LiveAvatar session error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});