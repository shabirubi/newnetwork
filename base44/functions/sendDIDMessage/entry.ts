import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get('DID_API_KEY');
    if (!apiKey) {
      console.error('D-ID API key not found');
      return Response.json({ error: 'D-ID API key not configured' }, { status: 500 });
    }

    const { stream_id, session_id, type, sdp, text, voice_id } = await req.json();

    if (!stream_id || !session_id) {
      return Response.json({ 
        error: 'stream_id and session_id are required' 
      }, { status: 400 });
    }

    let body;
    
    // Handle WebRTC signaling (answer)
    if (type === 'answer' && sdp) {
      body = {
        answer: {
          type: 'answer',
          sdp: sdp
        },
        session_id: session_id
      };
      console.log('Sending WebRTC answer for stream:', stream_id);
    }
    // Handle ICE candidate
    else if (type === 'ice') {
      body = {
        candidate: sdp,
        session_id: session_id
      };
      console.log('Sending ICE candidate for stream:', stream_id);
    }
    // Handle text message to speak
    else if (type === 'talk' && text) {
      body = {
        script: {
          type: 'text',
          input: text,
          provider: {
            type: 'microsoft',
            voice_id: voice_id || 'he-IL-AvriNeural'
          }
        },
        session_id: session_id
      };
      console.log('Sending text to speak for stream:', stream_id);
    }
    else {
      return Response.json({ 
        error: 'Invalid message type or missing parameters' 
      }, { status: 400 });
    }

    const response = await fetch(`https://api.d-id.com/talks/streams/${stream_id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
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
    console.log('D-ID message sent successfully');
    
    return Response.json(data);

  } catch (error) {
    console.error('Error sending D-ID message:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});