Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');
    
    if (!targetUrl) {
      return Response.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    const response = await fetch(targetUrl);
    let html = await response.text();

    // Remove headers, navbars, titles, logos
    html = html.replace(/<header[^>]*>.*?<\/header>/gis, '');
    html = html.replace(/<nav[^>]*>.*?<\/nav>/gis, '');
    html = html.replace(/<title[^>]*>.*?<\/title>/gis, '');
    html = html.replace(/<h1[^>]*>.*?<\/h1>/gis, '');
    html = html.replace(/class="[^"]*header[^"]*"/gi, '');
    html = html.replace(/class="[^"]*navbar[^"]*"/gi, '');
    html = html.replace(/class="[^"]*nav[^"]*"/gi, '');
    html = html.replace(/class="[^"]*logo[^"]*"/gi, '');
    html = html.replace(/class="[^"]*branding[^"]*"/gi, '');
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});