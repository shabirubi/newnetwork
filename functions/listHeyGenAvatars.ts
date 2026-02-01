import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const apiKey = Deno.env.get('HEYGEN_API_KEY');
    
    if (!apiKey) {
      return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    console.log('Fetching available HeyGen avatars...');

    const response = await fetch('https://api.heygen.com/v2/avatars', {
      headers: {
        'X-API-KEY': apiKey
      }
    });

    let responseData;
    const responseText = await response.text();
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', responseText);
      return Response.json({ error: 'Failed to parse HeyGen API response', details: responseText }, { status: 500 });
    }

    if (!response.ok) {
      console.error('HeyGen API error:', responseData);
      return Response.json({ error: 'HeyGen API error: ' + JSON.stringify(responseData) }, { status: response.status });
    }

    console.log('Available avatars:', responseData);

    const avatars = responseData.data?.avatars || responseData.avatars || [];
    
    if (avatars.length === 0) {
      return Response.json({ 
        error: 'No avatars available',
        raw_response: responseData
      }, { status: 400 });
    }

    return Response.json({
      avatars: avatars,
      total: avatars.length
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});