import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get('LIVEAVATAR_API_KEY');

    if (!apiKey) {
      return Response.json({ error: 'LIVEAVATAR_API_KEY not configured' }, { status: 500 });
    }

    // List public avatars
    const response = await fetch('https://api.liveavatar.com/v1/avatars', {
      method: 'GET',
      headers: {
        'X-API-KEY': apiKey,
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to list avatars:', error);
      return Response.json({ error: 'Failed to list avatars' }, { status: 500 });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('List avatars error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});