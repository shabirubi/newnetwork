import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get('LIVEAVATAR_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'LiveAvatar API key not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.liveavatar.com/v1/sessions/token', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mode: 'LITE',
        avatar_id: 'Anna_public_3_20240108',
        voice_id: '7a1c045c-af31-49ae-8960-9d8a8c9d5e9e'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('LiveAvatar API error:', error);
      return Response.json({ 
        error: 'Failed to create token',
        details: error 
      }, { status: response.status });
    }

    const data = await response.json();
    
    return Response.json({
      token: data.token
    });

  } catch (error) {
    console.error('Error getting LiveAvatar token:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});