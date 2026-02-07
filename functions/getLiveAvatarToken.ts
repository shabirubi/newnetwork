import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get('LIVEAVATAR_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'LiveAvatar API key not configured' }, { status: 500 });
    }

    // Step 1: Create session token
    const tokenResponse = await fetch('https://api.liveavatar.com/v1/sessions/token', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        mode: 'FULL',
        avatar_id: 'f0a9978d-634a-4063-8164-42ba6670542f',
        avatar_persona: {
          voice_id: 'de5574fc-009e-4a01-a881-9919ef8f5a0c',
          language: 'en'
        }
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('LiveAvatar API error:', error);
      return Response.json({ 
        error: 'Failed to create token',
        details: error 
      }, { status: tokenResponse.status });
    }

    const tokenData = await tokenResponse.json();
    
    console.log('Token data received:', JSON.stringify(tokenData, null, 2));
    
    // Step 2: Start the session
    const startResponse = await fetch('https://api.liveavatar.com/v1/sessions/start', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'authorization': `Bearer ${tokenData.session_token}`
      }
    });

    if (!startResponse.ok) {
      const error = await startResponse.text();
      console.error('LiveAvatar start session error:', error);
      return Response.json({ 
        error: 'Failed to start session',
        details: error 
      }, { status: startResponse.status });
    }

    const startData = await startResponse.json();
    
    return Response.json({
      session_id: tokenData.session_id,
      session_token: tokenData.session_token,
      livekit_url: startData.livekit_url,
      livekit_token: startData.livekit_client_token
    });

  } catch (error) {
    console.error('Error getting LiveAvatar token:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});