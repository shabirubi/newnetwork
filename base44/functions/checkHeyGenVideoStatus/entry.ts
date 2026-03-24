import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { video_id } = await req.json();

    if (!video_id) {
      return Response.json({ error: 'Missing video_id' }, { status: 400 });
    }

    const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');
    
    if (!HEYGEN_API_KEY) {
      return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    console.log('🔍 Checking video status for:', video_id);

    const statusResponse = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${video_id}`, {
      headers: {
        'X-Api-Key': HEYGEN_API_KEY
      }
    });

    const responseText = await statusResponse.text();
    console.log('📥 Status Response:', statusResponse.status, responseText);

    if (!statusResponse.ok) {
      return Response.json({ 
        error: `HeyGen status check failed: ${responseText}`,
        status: statusResponse.status
      }, { status: 500 });
    }

    const statusData = JSON.parse(responseText);
    const status = statusData.data?.status;
    let videoUrl = statusData.data?.video_url;
    const error = statusData.data?.error;

    console.log('📊 Status:', status, 'URL:', videoUrl ? '✅' : '⏳');

    // אם הסרטון מוכן ויש URL - נעלה אותו לאחסון שלנו
    if (status === 'completed' && videoUrl) {
      try {
        console.log('📥 Downloading video from HeyGen:', videoUrl);
        
        // הורדה מ-HeyGen
        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok) {
          console.error('❌ Failed to download video');
        } else {
          const videoBlob = await videoResponse.blob();
          const sizeInMB = (videoBlob.size / 1024 / 1024).toFixed(2);
          console.log('📦 Video size:', sizeInMB, 'MB');

          // העלאה לאחסון שלנו
          const fileName = `heygen_${video_id}_${Date.now()}.mp4`;
          const file = new File([videoBlob], fileName, { type: 'video/mp4' });
          
          console.log('⬆️ Uploading to our storage...');
          const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });
          
          console.log('✅ Uploaded successfully to our storage:', file_url);
          videoUrl = file_url; // החזר את ה-URL שלנו במקום של HeyGen
        }
      } catch (uploadError) {
        console.error('⚠️ Upload failed, using HeyGen URL:', uploadError.message);
        // אם ההעלאה נכשלה - נשתמש ב-URL המקורי
      }
    }

    return Response.json({
      video_id,
      status,
      video_url: videoUrl,
      error,
      stored_locally: videoUrl && !videoUrl.includes('heygen.com')
    });

  } catch (error) {
    console.error('🔴 Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});