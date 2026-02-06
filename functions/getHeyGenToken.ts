import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = Deno.env.get('LIVEAVATAR_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'LiveAvatar API key not configured' }, { status: 500 });
    }

    // שלב 1: קבלת רשימת דמויות זמינות
    const avatarsResponse = await fetch('https://api.liveavatar.com/v1/avatars/public', {
      headers: {
        'X-API-KEY': apiKey,
        'accept': 'application/json'
      }
    });

    if (!avatarsResponse.ok) {
      const error = await avatarsResponse.text();
      console.error('Failed to fetch avatars:', error);
      return Response.json({ 
        error: 'Failed to fetch avatars',
        details: error 
      }, { status: avatarsResponse.status });
    }

    const avatarsData = await avatarsResponse.json();
    
    // בחירת הדמות הראשונה הזמינה
    const firstAvatar = avatarsData.data?.results?.find(a => a.status === 'ACTIVE');
    if (!firstAvatar) {
      return Response.json({ 
        error: 'No active avatars available' 
      }, { status: 404 });
    }

    // שלב 2: יצירת session token עם הדמות הראשונה
    const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('LiveAvatar API error:', error);
      return Response.json({ 
        error: 'Failed to create session token',
        details: error 
      }, { status: response.status });
    }

    const data = await response.json();

    console.log('HeyGen response:', JSON.stringify(data, null, 2));

    return Response.json({
      session_token: data.data?.token,
      avatar_id: firstAvatar.id,
      voice_id: firstAvatar.default_voice?.id,
      avatar_name: firstAvatar.name
    });

  } catch (error) {
    console.error('Error getting LiveAvatar token:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});