import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_url, script } = await req.json();
    
    if (!image_url || !script) {
      return Response.json({ error: 'image_url and script are required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('HEYGEN_API_KEY');
    
    if (!apiKey) {
      return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    console.log('Uploading image to HeyGen...');

    // Step 1: Upload the image
    const uploadFormData = new FormData();
    const imageBlob = await fetch(image_url).then(r => r.blob());
    uploadFormData.append('file', imageBlob, 'avatar.jpg');

    const uploadResponse = await fetch('https://api.heygen.com/v2/assets/upload', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey
      },
      body: uploadFormData
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Upload error:', errorText);
      return Response.json({ error: 'Failed to upload image', details: errorText }, { status: 500 });
    }

    const uploadData = await uploadResponse.json();
    const imageKey = uploadData.data?.image_key;

    if (!imageKey) {
      console.error('No image key returned:', uploadData);
      return Response.json({ error: 'No image key returned from upload' }, { status: 500 });
    }

    console.log('Image uploaded, getting voices...');

    // Step 2: Get voice list
    const voiceResponse = await fetch('https://api.heygen.com/v2/voices', {
      headers: {
        'X-API-KEY': apiKey
      }
    });

    let voiceId = 'en-US-Neural2-C'; // Default voice
    if (voiceResponse.ok) {
      const voiceData = await voiceResponse.json();
      if (voiceData.data?.voices?.length > 0) {
        voiceId = voiceData.data.voices[0].voice_id || voiceId;
      }
    }

    console.log('Creating HeyGen avatar IV video...');

    // Step 3: Create video with Avatar IV
    const createResponse = await fetch('https://api.heygen.com/v1/avatar_iv/generate_video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey
      },
      body: JSON.stringify({
        image_key: imageKey,
        script: script,
        voice_id: voiceId,
        video_title: 'Avatar Video - ' + script.substring(0, 30)
      })
    });

    let responseData;
    const responseText = await createResponse.text();
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', responseText);
      return Response.json({ error: 'Failed to parse HeyGen API response', details: responseText }, { status: 500 });
    }

    if (!createResponse.ok) {
      console.error('HeyGen API error:', responseData);
      return Response.json({ error: 'HeyGen API error: ' + JSON.stringify(responseData) }, { status: createResponse.status });
    }

    console.log('HeyGen create response:', responseData);
    
    const videoId = responseData.data?.video_id || responseData.video_id;

    if (!videoId) {
      console.error('No video ID in response:', responseData);
      return Response.json({ error: 'No video ID returned from HeyGen', details: responseData }, { status: 500 });
    }

    // Poll for completion (max 5 minutes)
    const maxAttempts = 60;
    const pollInterval = 5000;
    
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const statusResponse = await fetch(`https://api.heygen.com/v1/video_status/${videoId}`, {
        headers: {
          'X-API-KEY': apiKey
        }
      });

      let statusData;
      const statusText = await statusResponse.text();
      
      try {
        statusData = JSON.parse(statusText);
      } catch (e) {
        console.error('Failed to parse status response:', statusText);
        continue;
      }

      console.log(`Poll attempt ${i + 1}:`, statusData);
      
      if (statusResponse.ok) {
        const status = statusData.status || statusData.video_status;
        
        if (status === 'completed') {
          const videoUrl = statusData.video_url || statusData.output_url;
          if (videoUrl) {
            return Response.json({
              video_url: videoUrl,
              thumbnail_url: image_url,
              duration: statusData.duration || 30
            });
          }
        }
        
        if (status === 'failed') {
          console.error('Generation failed:', statusData);
          return Response.json({ error: 'Video generation failed', details: statusData }, { status: 500 });
        }
      }
    }

    return Response.json({ 
      still_processing: true,
      video_id: videoId,
      message: 'התהליך לוקח זמן, נסה שוב בעוד דקה'
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});