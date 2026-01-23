import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoUrl } = await req.json();

    if (!videoUrl) {
      return Response.json({ error: 'Missing videoUrl' }, { status: 400 });
    }

    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    if (!DID_API_KEY) {
      return Response.json({ error: 'D-ID API Key not configured' }, { status: 500 });
    }

    console.log('🎓 Training Express Avatar...');
    console.log('📹 Video URL:', videoUrl);

    // V3 Express - Train custom avatar
    const response = await fetch('https://api.d-id.com/clips/actors', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        video_url: videoUrl
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ D-ID Training Error:', response.status, errorText);
      return Response.json({ 
        error: `D-ID Training error: ${errorText}`,
        status: response.status
      }, { status: 500 });
    }

    const result = await response.json();
    const actorId = result.id;

    console.log('✅ Training started:', actorId);

    // Poll for training completion (4-10 minutes)
    let pollAttempts = 0;
    const maxPollAttempts = 200; // ~16 minutes max
    const pollInterval = 5000; // Check every 5 seconds

    while (pollAttempts < maxPollAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      try {
        const statusResponse = await fetch(`https://api.d-id.com/clips/actors/${actorId}`, {
          headers: {
            'Authorization': `Basic ${DID_API_KEY}`,
            'accept': 'application/json'
          }
        });

        if (!statusResponse.ok) {
          console.error('Poll failed:', statusResponse.status);
          pollAttempts++;
          continue;
        }

        const statusData = await statusResponse.json();
        console.log(`📊 Training poll ${pollAttempts + 1}: ${statusData.status}`);

        if (statusData.status === 'done') {
          console.log('🎉 Avatar trained successfully!');
          return Response.json({
            success: true,
            avatar_id: actorId,
            status: 'done'
          });
        }

        if (statusData.status === 'error' || statusData.status === 'rejected') {
          console.error('❌ Training failed:', statusData);
          return Response.json({ 
            error: `Training failed: ${statusData.error?.message || 'Unknown error'}` 
          }, { status: 500 });
        }

        pollAttempts++;
      } catch (pollError) {
        console.error('Poll error:', pollError.message);
        pollAttempts++;
      }
    }

    return Response.json({ error: 'Avatar training timeout' }, { status: 504 });

  } catch (error) {
    console.error('🔴 Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});