import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const LIVEAVATAR_API_KEY = Deno.env.get("LIVEAVATAR_API_KEY");
    if (!LIVEAVATAR_API_KEY) {
      return Response.json({ error: 'LiveAvatar API Key not configured' }, { status: 500 });
    }

    // שלב 1: יצירת session token
    const tokenResponse = await fetch('https://api.liveavatar.com/v1/sessions/token', {
      method: 'POST',
      headers: {
        'X-API-KEY': LIVEAVATAR_API_KEY,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        mode: 'FULL',
        avatar_id: '66a73b1b5a61c4fc67a0e2bb',
        avatar_persona: {
          language: 'he'
        }
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('LiveAvatar Token Error:', errorText);
      return Response.json({ 
        error: 'Failed to create session token',
        details: errorText 
      }, { status: tokenResponse.status });
    }

    const tokenData = await tokenResponse.json();
    const { session_id, session_token } = tokenData;

    // שלב 2: התחלת ה-session
    const startResponse = await fetch('https://api.liveavatar.com/v1/sessions/start', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session_token}`,
        'accept': 'application/json'
      }
    });

    if (!startResponse.ok) {
      const errorText = await startResponse.text();
      console.error('LiveAvatar Start Error:', errorText);
      return Response.json({ 
        error: 'Failed to start session',
        details: errorText 
      }, { status: startResponse.status });
    }

    const startData = await startResponse.json();
    
    // יצירת LiveKit URL
    const livekitUrl = `https://meet.livekit.io/custom?liveKitUrl=${encodeURIComponent(startData.livekit_url)}&token=${encodeURIComponent(startData.livekit_client_token)}`;
    
    return Response.json({
      success: true,
      session_id: session_id,
      livekit_url: livekitUrl
    });

  } catch (error) {
    console.error('createLiveAvatarSession error:', error);
    return Response.json({ 
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
});