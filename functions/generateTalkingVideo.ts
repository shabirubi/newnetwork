import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, avatarUrl, gender = 'male', avatarBase64 } = await req.json();

    if (!text) {
      return Response.json({ error: 'Missing text' }, { status: 400 });
    }

    if (!avatarUrl && !avatarBase64) {
      return Response.json({ error: 'Missing avatarUrl or avatarBase64' }, { status: 400 });
    }

    const voiceIdMap = {
      male: 'he-IL-AvriNeural',
      female: 'he-IL-HilaNeural'
    };
    const voiceId = voiceIdMap[gender] || voiceIdMap.male;

    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    
    if (!DID_API_KEY) {
      return Response.json({ error: 'D-ID API Key not configured' }, { status: 500 });
    }

    console.log('🎤 Using Microsoft TTS via D-ID...');
    console.log('Avatar URL:', avatarUrl);
    console.log('Gender:', gender);
    console.log('Has Base64:', !!avatarBase64);

    let imageUrl = avatarUrl;
    
    // If Base64 provided, upload to private storage first
    if (avatarBase64) {
      try {
        const base64Data = avatarBase64.split(',')[1] || avatarBase64;
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'image/jpeg' });
        
        const uploadResult = await base44.integrations.Core.UploadFile({ file: blob });
        imageUrl = uploadResult.file_url || uploadResult.url;
        console.log('✅ Image uploaded:', imageUrl);
      } catch (uploadError) {
        console.error('Upload error:', uploadError.message);
        return Response.json({ error: `Failed to upload image: ${uploadError.message}` }, { status: 500 });
      }
    }

    // Create talk using D-ID API with enhanced body language
    const didPayload = {
      source_url: imageUrl,
      driver_url: 'bank://presenters-v1/',
      config: {
        fluent: true,
        pad_audio: 0,
        stitch: true,
        result_format: 'mp4'
      }
    };

    didPayload.script = {
      type: 'text',
      input: text,
      provider: {
        type: 'microsoft',
        voice_id: voiceId
      }
    };

    const response = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(didPayload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('D-ID Response Error:', error);
      return Response.json({ error: `D-ID API error: ${error}` }, { status: 500 });
    }

    const result = await response.json();
    const talkId = result.id;

    // Poll for video completion
    let attempts = 0;
    const maxAttempts = 90;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const statusResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        headers: {
          'Authorization': `Basic ${DID_API_KEY}`,
          'accept': 'application/json'
        }
      });
      
      const statusData = await statusResponse.json();
      
      if (statusData.status === 'done') {
        // שמירת הוידאו ב-NewsArticle
        try {
          const article = await base44.asServiceRole.entities.NewsArticle.create({
            title: `דמות מדברת - ${text.substring(0, 50)}`,
            subtitle: 'וידאו שנוצר על ידי טכנולוגיית D-ID',
            content: text,
            category: 'technology',
            video_url: statusData.result_url,
            image_url: avatarUrl,
            is_featured: true,
            is_breaking: false,
            source: 'AI Avatar Generator'
          });
          console.log('✅ Video saved to NewsArticle:', article.id);
        } catch (dbError) {
          console.error('❌ Failed to save to database:', dbError.message);
        }

        return Response.json({
          success: true,
          video_url: statusData.result_url,
          duration: statusData.duration,
          talk_id: talkId,
          saved_to_feed: true
        });
      }
      
      if (statusData.status === 'error') {
        console.error('D-ID Error:', JSON.stringify(statusData, null, 2));
        return Response.json({ error: `Video generation failed: ${JSON.stringify(statusData.error || statusData)}` }, { status: 500 });
      }
      
      attempts++;
    }
    
    return Response.json({ error: 'Video generation timeout' }, { status: 504 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});