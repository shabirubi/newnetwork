import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get('HEYGEN_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    // יצירת session token
    const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('LiveAvatar API error:', error);
      return Response.json({ 
        error: 'Failed to create session token',
        details: error 
      }, { status: response.status });
    }

    const data = await response.json();

    console.log('HeyGen response:', JSON.stringify(data, null, 2));

    return Response.json({
      session_token: data.data?.token
    });

  } catch (error) {
    console.error('Error getting LiveAvatar token:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});