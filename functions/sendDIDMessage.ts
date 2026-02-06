import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get('DID_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'D-ID API key not configured' }, { status: 500 });
    }

    const { stream_id, session_id, text } = await req.json();

    if (!stream_id || !session_id || !text) {
      return Response.json({ 
        error: 'Missing required parameters' 
      }, { status: 400 });
    }

    const response = await fetch(`https://api.d-id.com/talks/streams/${stream_id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        script: {
          type: 'text',
          input: text,
          provider: {
            type: 'microsoft',
            voice_id: 'he-IL-AvriNeural'
          }
        },
        session_id: session_id
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('D-ID API error:', error);
      return Response.json({ 
        error: 'Failed to send message',
        details: error 
      }, { status: response.status });
    }

    const data = await response.json();
    
    return Response.json(data);

  } catch (error) {
    console.error('Error sending D-ID message:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});