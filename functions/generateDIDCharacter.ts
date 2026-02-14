import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { script, avatar_id, voice_id } = await req.json();

    if (!script || !avatar_id) {
      return Response.json({ 
        error: 'Script and avatar_id are required' 
      }, { status: 400 });
    }

    const voiceId = voice_id || 'he-IL-AvriNeural';

    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    if (!DID_API_KEY) {
      return Response.json({ 
        error: 'D-ID API key not configured' 
      }, { status: 500 });
    }

    // Create talking video with custom avatar
    const response = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        script: {
          type: 'text',
          input: script,
          provider: {
            type: 'microsoft',
            voice_id: voiceId
          }
        },
        source_url: avatar_id,
        config: {
          fluent: true,
          pad_audio: 0
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('D-ID talks API error:', error);
      return Response.json({ 
        error: 'Failed to create video',
        details: error 
      }, { status: response.status });
    }

    const data = await response.json();
    const talkId = data.id;

    // Poll for video completion
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        headers: {
          'Authorization': `Basic ${DID_API_KEY}`
        }
      });

      if (!statusResponse.ok) {
        console.error('Failed to check video status');
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();
      
      if (statusData.status === 'done') {
        return Response.json({
          success: true,
          video_url: statusData.result_url,
          duration: statusData.duration || 10
        });
      }
      
      if (statusData.status === 'error') {
        return Response.json({ 
          error: 'Video generation failed',
          details: statusData.error 
        }, { status: 500 });
      }
      
      attempts++;
    }

    return Response.json({ 
      error: 'Video generation timeout' 
    }, { status: 408 });

  } catch (error) {
    console.error('Generate D-ID character error:', error);
    return Response.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
});