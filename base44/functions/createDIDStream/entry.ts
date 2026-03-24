import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get('DID_API_KEY');
    if (!apiKey) {
      console.error('D-ID API key not found');
      return Response.json({ error: 'D-ID API key not configured' }, { status: 500 });
    }

    const { source_url, driver_url } = await req.json();
    
    if (!source_url) {
      return Response.json({ error: 'source_url is required' }, { status: 400 });
    }

    console.log('Creating D-ID stream with source:', source_url);

    const response = await fetch('https://api.d-id.com/talks/streams', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_url: source_url,
        driver_url: driver_url || 'bank://lively'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('D-ID API error:', error);
      return Response.json({ 
        error: 'Failed to create stream',
        details: error 
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('D-ID stream created:', data.id);
    
    return Response.json(data);

  } catch (error) {
    console.error('Error creating D-ID stream:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});