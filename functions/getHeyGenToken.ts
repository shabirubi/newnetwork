import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = Deno.env.get('HEYGEN_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    // קבלת access token מ-HeyGen
    const response = await fetch('https://api.heygen.com/v1/streaming.new', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quality: 'high',
        avatar_name: 'Wayne_20240711',
        voice: {
          voice_id: 'en-US-JennyNeural'
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('HeyGen API error:', error);
      return Response.json({ 
        error: 'Failed to get HeyGen token',
        details: error 
      }, { status: response.status });
    }

    const data = await response.json();
    
    return Response.json({
      token: data.data.session_id,
      serverUrl: data.data.server_url
    });

  } catch (error) {
    console.error('Error getting HeyGen token:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});