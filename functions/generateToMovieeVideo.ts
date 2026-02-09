import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Parse request
    const { prompt, movement = 'duck', mode = 'text-to-video' } = await req.json();
    
    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    console.log('Generating video with ToMoviee:', { prompt, movement, mode });

    // Get ToMoviee API credentials
    const accessKey = Deno.env.get('TOMOVIEE_ACCESS_KEY');
    const secretKey = Deno.env.get('TOMOVIEE_SECRET_KEY');

    if (!accessKey || !secretKey) {
      console.error('ToMoviee API keys not configured');
      return Response.json({ 
        error: 'ToMoviee API keys not configured' 
      }, { status: 500 });
    }

    try {
      // Call ToMoviee API
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
          duration: 5,
          quality: 'high'
        })
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.text();
        console.error('ToMoviee API error:', errorData);
        return Response.json({ 
          error: `API error: ${apiResponse.status}` 
        }, { status: apiResponse.status });
      }

      const result = await apiResponse.json();
      console.log('ToMoviee API response:', result);

      // Poll for video if task_id returned
      let videoUrl = result.video_url;
      const taskId = result.task_id;

      if (taskId && !videoUrl) {
        console.log('Polling for video completion:', taskId);
        
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
            console.log(`Poll ${i + 1}: ${statusData.status}`);
            
            if (statusData.status === 'completed' && statusData.video_url) {
              videoUrl = statusData.video_url;
              break;
            } else if (statusData.status === 'failed') {
              return Response.json({ 
                error: 'Video generation failed' 
              }, { status: 500 });
            }
          }
        }
      }

      return Response.json({
        success: true,
        video_url: videoUrl || result.url,
        task_id: taskId,
        prompt: prompt,
        movement: movement
      });
    } catch (error) {
      console.error('ToMoviee generation error:', error);
      return Response.json({ 
        error: error.message || 'Failed to generate video' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error generating ToMoviee video:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate video' 
    }, { status: 500 });
  }
});