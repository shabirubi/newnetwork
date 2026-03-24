Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get('HEYGEN_API_KEY');
    
    if (!apiKey) {
      return Response.json({ error: 'HEYGEN_API_KEY not configured' }, { status: 500 });
    }

    console.log('Fetching HeyGen avatars...');

    const res = await fetch('https://api.heygen.com/v2/avatars', {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error fetching avatars:', errorText);
      return Response.json({ 
        error: 'Failed to fetch avatars',
        details: errorText
      }, { status: res.status });
    }

    const data = await res.json();
    console.log(`Found ${data?.data?.avatars?.length || 0} avatars`);

    return Response.json({
      avatars: data?.data?.avatars || [],
      count: data?.data?.avatars?.length || 0
    });

  } catch (error) {
    console.error('ERROR:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});