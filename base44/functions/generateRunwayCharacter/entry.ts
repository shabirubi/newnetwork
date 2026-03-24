import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_url, prompt } = await req.json();
    
    if (!image_url || !prompt) {
      return Response.json({ error: 'image_url and prompt are required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('RUNWAY_API_KEY');
    
    if (!apiKey) {
      return Response.json({ error: 'Runway API key not configured' }, { status: 500 });
    }

    console.log('Creating Runway Gen-4 video...');

    // Create video generation task
    const createResponse = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Runway-Version': '2024-11-06'
      },
      body: JSON.stringify({
        model: 'gen4_turbo',
        promptImage: image_url,
        promptText: prompt,
        duration: 10,
        ratio: '1280:720'
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Runway API error:', errorText);
      return Response.json({ error: 'Runway API error: ' + errorText }, { status: createResponse.status });
    }

    const createData = await createResponse.json();
    console.log('Runway create response:', createData);
    
    const taskId = createData.id;

    if (!taskId) {
      console.error('No task ID in response:', createData);
      return Response.json({ error: 'No task ID returned from Runway', details: createData }, { status: 500 });
    }

    // Poll for completion (max 5 minutes)
    const maxAttempts = 60;
    const pollInterval = 5000;
    
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const statusResponse = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Runway-Version': '2024-11-06'
        }
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log(`Poll attempt ${i + 1}:`, statusData);
        
        if (statusData.status === 'SUCCEEDED') {
          const videoUrl = statusData.output?.[0];
          if (videoUrl) {
            return Response.json({
              video_url: videoUrl,
              thumbnail_url: image_url,
              duration: 10
            });
          }
        }
        
        if (statusData.status === 'FAILED') {
          console.error('Generation failed:', statusData);
          return Response.json({ error: 'Video generation failed', details: statusData }, { status: 500 });
        }
      } else {
        console.error('Status check failed:', await statusResponse.text());
      }
    }

    return Response.json({ 
      still_processing: true,
      task_id: taskId,
      message: 'התהליך לוקח זמן, נסה שוב בעוד דקה'
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});