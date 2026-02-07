import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get('LIVEAVATAR_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'LiveAvatar API key not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.liveavatar.com/v1/avatars/public', {
      method: 'GET',
      headers: {
        'X-API-KEY': apiKey,
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('LiveAvatar API error:', error);
      return Response.json({ 
        error: 'Failed to list avatars',
        details: error 
      }, { status: response.status });
    }

    const data = await response.json();
    
    return Response.json(data);

  } catch (error) {
    console.error('Error listing LiveAvatar avatars:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});