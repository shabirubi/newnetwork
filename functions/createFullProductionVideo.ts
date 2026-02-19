import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { description, imageUrl } = await req.json();

    if (!description) {
      return Response.json({ error: 'Missing description' }, { status: 400 });
    }

    const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');
    
    if (!HEYGEN_API_KEY) {
      return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    console.log('🎬 Creating professional video with HeyGen...');
    console.log('📝 User Request:', description);

    // 1. Detect language
    const detectLanguagePrompt = `Detect the language of this text and return ONLY the language name in English (Hebrew/English/Arabic/Spanish/etc): ${description}`;
    const languageResult = await base44.integrations.Core.InvokeLLM({
      prompt: detectLanguagePrompt
    });
    const detectedLanguage = languageResult?.trim() || 'Hebrew';
    console.log('🌍 Detected language:', detectedLanguage);

    // 2. Generate professional script
    const scriptPrompt = `Create a professional broadcast-quality script (200-300 words) about: ${description}

Requirements:
- Write in ${detectedLanguage} language ONLY
- Professional news/broadcast tone
- Strong opening hook
- Rich content with details
- Natural speaking rhythm
- Clear conclusion
- Make it engaging

Return only the script text in ${detectedLanguage}.`;

    const scriptResult = await base44.integrations.Core.InvokeLLM({
      prompt: scriptPrompt,
      add_context_from_internet: true
    });

    const script = scriptResult?.trim() || description;
    console.log('✅ Script generated:', script.substring(0, 100) + '...');

    // 3. Generate professional background
    let backgroundUrl = imageUrl;
    if (!backgroundUrl) {
      const bgResult = await base44.integrations.Core.GenerateImage({
        prompt: 'Professional news studio background, modern TV broadcast set, blue and white colors, clean minimalist design, professional lighting, 16:9 aspect ratio, photorealistic'
      });
      backgroundUrl = bgResult.url;
      console.log('✅ Background created');
    }

    // 4. Select voice based on language
    let voiceId = 'v6WKRTqObgmv7NHgVAFD'; // Hebrew
    if (detectedLanguage.toLowerCase().includes('english')) {
      voiceId = 'EXAVITQu4vr4xnSDxMaL';
    } else if (detectedLanguage.toLowerCase().includes('arabic')) {
      voiceId = 'AZnzlk1XvdvUeBnXmlld';
    }
    console.log('🎤 Voice ID:', voiceId);

    // 5. Create HeyGen video
    const videoPayload = {
      video_inputs: [{
        character: {
          type: 'avatar',
          avatar_id: 'Abigail_expressive_2024112501',
          avatar_style: 'normal'
        },
        voice: {
          type: 'text',
          input_text: script,
          voice_id: voiceId
        },
        background: {
          type: 'image',
          url: backgroundUrl
        }
      }],
      dimension: {
        width: 1920,
        height: 1080
      },
      aspect_ratio: '16:9',
      test: false
    };

    console.log('🎤 Calling HeyGen API with script...');

    const heygenResponse = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(videoPayload)
    });

    const responseText = await heygenResponse.text();
    console.log('📥 HeyGen Response:', heygenResponse.status, responseText);

    if (!heygenResponse.ok) {
      console.error('❌ HeyGen error:', heygenResponse.status, responseText);
      return Response.json({ 
        error: `HeyGen API error: ${responseText}`,
        status: heygenResponse.status
      }, { status: 500 });
    }

    const heygenData = JSON.parse(responseText);
    const videoId = heygenData.data?.video_id;
    
    if (!videoId) {
      console.error('No video ID returned:', heygenData);
      return Response.json({ error: 'No video ID returned from HeyGen' }, { status: 500 });
    }

    console.log('✅ Video generation started:', videoId);

    // Poll for video status with longer timeout
    let attempts = 0;
    const maxAttempts = 100; // 5 minutes
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const statusResponse = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY
        }
      });
      
      const statusData = await statusResponse.json();
      console.log(`📊 Attempt ${attempts + 1}:`, statusData.data?.status);
      
      if (statusData.data?.status === 'completed') {
        console.log('✅ Video ready!', statusData.data?.video_url);
        return Response.json({
          video_url: statusData.data.video_url,
          video_id: videoId
        });
      }
      
      if (statusData.data?.status === 'failed') {
        return Response.json({ error: 'Video generation failed' }, { status: 500 });
      }
      
      attempts++;
    }
    
    return Response.json({ error: 'Timeout' }, { status: 500 });

  } catch (error) {
    console.error('🔴 Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});