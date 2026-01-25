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

    console.log('🎬 Training Express Avatar from video:', videoUrl);

    // Step 1: Create avatar (this starts the training process)
    const createResponse = await fetch('https://api.d-id.com/agents/avatars', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(DID_API_KEY)}`,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        source_url: videoUrl,
        name: `Avatar_${user.email}_${Date.now()}`
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('❌ D-ID Create Error:', createResponse.status, errorText);
      return Response.json({ 
        error: `D-ID API error: ${errorText}`,
        status: createResponse.status
      }, { status: 500 });
    }

    const createResult = await createResponse.json();
    const avatarId = createResult.id;
    console.log('✅ Avatar training started:', avatarId);

    // Step 2: Poll for training completion
    let pollAttempts = 0;
    const maxPollAttempts = 180; // 15 minutes max (5 seconds interval)
    const pollInterval = 5000; // 5 seconds

    while (pollAttempts < maxPollAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      try {
        const statusResponse = await fetch(`https://api.d-id.com/agents/avatars/${avatarId}`, {
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
        console.log(`📊 Poll ${pollAttempts + 1}: ${statusData.status}`);

        if (statusData.status === 'done') {
          console.log('🎉 Avatar ready:', avatarId);
          return Response.json({
            success: true,
            avatar_id: avatarId,
            status: 'done'
          });
        }

        if (statusData.status === 'error' || statusData.status === 'failed') {
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

    return Response.json({ error: 'Avatar training timeout (15 minutes)' }, { status: 504 });

  } catch (error) {
    console.error('🔴 Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});