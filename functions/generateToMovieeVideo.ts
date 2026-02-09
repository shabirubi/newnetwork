import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authentication check
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request
    const { prompt, movement = 'duck', mode = 'text-to-video' } = await req.json();
    
    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Get API credentials
    const accessKey = Deno.env.get('TOMOVIEE_ACCESS_KEY');
    const secretKey = Deno.env.get('TOMOVIEE_SECRET_KEY');

    if (!accessKey || !secretKey) {
      console.error('ToMoviee API keys not configured');
      return Response.json({ 
        error: 'ToMoviee API keys not configured. Please set TOMOVIEE_ACCESS_KEY and TOMOVIEE_SECRET_KEY in environment variables.' 
      }, { status: 500 });
    }

    console.log('Generating video with ToMoviee:', { prompt, movement, mode });

    // Call ToMoviee API
    // Note: This is a placeholder - update with actual ToMoviee API endpoint and format
    const apiResponse = await fetch('https://api.tomoviee.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': accessKey,
        'X-Secret-Key': secretKey
      },
      body: JSON.stringify({
        prompt: prompt,
        camera_movement: movement,
        mode: mode,
        duration: 5, // 5 seconds default
        quality: 'high'
      })
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.text();
      console.error('ToMoviee API error:', errorData);
      return Response.json({ 
        error: `ToMoviee API error: ${apiResponse.status} - ${errorData}` 
      }, { status: apiResponse.status });
    }

    const result = await apiResponse.json();
    console.log('ToMoviee API response:', result);

    // Poll for completion if needed (if API returns task_id)
    let videoUrl = result.video_url;
    let taskId = result.task_id;

    if (taskId && !videoUrl) {
      console.log('Polling for video completion, task_id:', taskId);
      
      // Poll every 5 seconds for up to 2 minutes
      for (let i = 0; i < 24; i++) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const statusResponse = await fetch(`https://api.tomoviee.ai/v1/tasks/${taskId}`, {
          headers: {
            'X-Access-Key': accessKey,
            'X-Secret-Key': secretKey
          }
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          console.log(`Poll attempt ${i + 1}:`, statusData.status);
          
          if (statusData.status === 'completed' && statusData.video_url) {
            videoUrl = statusData.video_url;
            break;
          } else if (statusData.status === 'failed') {
            return Response.json({ 
              error: 'Video generation failed: ' + (statusData.error || 'Unknown error') 
            }, { status: 500 });
          }
        }
      }

      if (!videoUrl) {
        return Response.json({ 
          error: 'Video generation timeout. Please try again later.',
          task_id: taskId 
        }, { status: 408 });
      }
    }

    return Response.json({
      success: true,
      video_url: videoUrl,
      task_id: taskId,
      prompt: prompt,
      movement: movement
    });

  } catch (error) {
    console.error('Error generating ToMoviee video:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate video' 
    }, { status: 500 });
  }
});