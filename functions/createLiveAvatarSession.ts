import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // אין צורך באימות - האפליקציה ציבורית
    
    const LIVEAVATAR_API_KEY = Deno.env.get("LIVEAVATAR_API_KEY");
    if (!LIVEAVATAR_API_KEY) {
      return Response.json({ error: 'LiveAvatar API Key not configured' }, { status: 500 });
    }

    // יצירת session חדש עם LiveAvatar
    const response = await fetch('https://api.liveavatar.com/v1/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LIVEAVATAR_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        avatar_id: '66a73b1b5a61c4fc67a0e2bb', // ה-ID מהצילום מסך
        language: 'he',
        voice: 'hebrew-female'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LiveAvatar API Error:', errorText);
      return Response.json({ 
        error: 'Failed to create LiveAvatar session',
        details: errorText 
      }, { status: response.status });
    }

    const data = await response.json();
    
    return Response.json({
      success: true,
      session_url: data.session_url,
      session_id: data.session_id
    });

  } catch (error) {
    console.error('createLiveAvatarSession error:', error);
    return Response.json({ 
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
});