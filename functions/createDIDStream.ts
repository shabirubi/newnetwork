import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get('DID_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'D-ID API key not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.d-id.com/talks/streams', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_url: 'https://create-images-results.d-id.com/google-oauth2%7C113633094228589980123/upl_-tCCgOmv_5qfD_TEwhSR8/image.png'
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
    
    return Response.json(data);

  } catch (error) {
    console.error('Error creating D-ID stream:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});