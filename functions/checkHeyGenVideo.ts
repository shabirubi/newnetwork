import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { video_id } = await req.json();
    
    if (!video_id) {
      return Response.json({ error: 'video_id is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('HEYGEN_API_KEY');
    
    if (!apiKey) {
      return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    console.log('Checking HeyGen video status:', video_id);

    // Check video status
    const statusResponse = await fetch(`https://api.heygen.com/v2/video/${video_id}`, {
      method: 'GET',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      }
    });

    const statusText = await statusResponse.text();
    console.log(`Status response (${statusResponse.status}):`, statusText.substring(0, 200));
    
    let statusData;
    try {
      statusData = JSON.parse(statusText);
    } catch (e) {
      console.error('Failed to parse:', statusText);
      return Response.json({ error: 'Failed to parse API response', details: statusText }, { status: 500 });
    }

    const status = statusData.data?.status;
    console.log('Video status:', status);

    if (status === 'completed') {
      const videoUrl = statusData.data?.video_url;
      console.log('Video ready:', videoUrl);
      if (videoUrl) {
        try {
          // Download the video from HeyGen
          console.log('Downloading video from:', videoUrl);
          const videoResponse = await fetch(videoUrl);
          if (!videoResponse.ok) {
            throw new Error(`Failed to download video: ${videoResponse.status}`);
          }
          
          const videoBlob = await videoResponse.blob();
          
          // Upload to our storage
          const uploadResponse = await base44.integrations.Core.UploadFile({
            file: videoBlob
          });
          
          console.log('Video uploaded successfully:', uploadResponse.file_url);
          
          return Response.json({
            video_url: uploadResponse.file_url,
            duration: statusData.data?.duration || 30
          });
        } catch (downloadErr) {
          console.error('Failed to download/upload video:', downloadErr.message);
          // Return HeyGen URL as fallback
          return Response.json({
            video_url: videoUrl,
            duration: statusData.data?.duration || 30
          });
        }
      }
    }
    
    if (status === 'failed') {
      console.error('Video generation failed:', statusData);
      return Response.json({ error: 'Video generation failed', details: statusData }, { status: 500 });
    }

    // Still processing
    return Response.json({ 
      still_processing: true,
      video_id: video_id,
      status: status,
      message: 'הסרטון עדיין בעיבוד'
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});