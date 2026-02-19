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

    // 5. Create HeyGen video using Video Agent API
    const detailedPrompt = `Create a professional broadcast-quality video about: ${description}

Language: ${detectedLanguage}

Full Script to narrate:
${script}

Visual Style:
- Professional news studio setting with modern background
- High-quality avatar presenter (expressive, natural movements)
- Clean, minimalist design with professional lighting
- Use provided background image: ${backgroundUrl}

Video Requirements:
- Duration: Match script length (2-3 minutes)
- Aspect ratio: 16:9 (1920x1080)
- Professional broadcast quality
- Natural voice delivery with appropriate pacing
- Smooth transitions and engaging presentation

Make it look like a professional TV news segment with high production value.`;

    console.log('🎬 Calling HeyGen Video Agent API...');
    console.log('📋 Prompt:', detailedPrompt.substring(0, 200) + '...');

    const heygenResponse = await fetch('https://api.heygen.com/v1/video_agent/generate', {
      method: 'POST',
      headers: {
        'X-API-KEY': HEYGEN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: detailedPrompt
      })
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

    // Return video_id immediately - client will poll
    return Response.json({
      video_id: videoId,
      status: 'processing'
    });

  } catch (error) {
    console.error('🔴 Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});