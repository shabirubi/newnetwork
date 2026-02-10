import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get current origin from request
    const origin = req.headers.get('origin') || req.headers.get('referer') || '';
    const allowedDomains = [origin, 'http://localhost:3000', 'https://localhost:3000'];
    
    console.log('Creating D-ID client key for domains:', allowedDomains);

    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    
    if (!DID_API_KEY) {
      return Response.json({ error: 'D-ID API key not configured' }, { status: 500 });
    }

    // Create client key from D-ID API
    const response = await fetch('https://api.d-id.com/agents/client-key', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        allowed_domains: allowedDomains
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('D-ID API error:', response.status, errorText);
      return Response.json({ 
        error: 'Failed to create client key', 
        details: errorText 
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('Client key created successfully');

    return Response.json({ 
      clientKey: data.client_key,
      allowedDomains
    });

  } catch (error) {
    console.error('Error creating D-ID client key:', error);
    return Response.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
});