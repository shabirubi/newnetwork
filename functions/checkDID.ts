import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    
    if (!DID_API_KEY) {
      return Response.json({ error: 'DID_API_KEY not set' }, { status: 500 });
    }

    console.log('Testing D-ID connection...');
    console.log('API Key exists:', !!DID_API_KEY);
    console.log('API Key length:', DID_API_KEY.length);

    // Try to get credits info
    const creditsResponse = await fetch('https://api.d-id.com/credits', {
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`
      }
    });

    const creditsText = await creditsResponse.text();
    console.log('Credits response status:', creditsResponse.status);
    console.log('Credits response:', creditsText);

    if (!creditsResponse.ok) {
      return Response.json({
        error: 'API key invalid or expired',
        status: creditsResponse.status,
        details: creditsText
      }, { status: 500 });
    }

    return Response.json({
      success: true,
      credits: JSON.parse(creditsText),
      message: 'D-ID connection successful'
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});