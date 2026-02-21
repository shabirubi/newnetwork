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

    // 2. Generate professional script (optimal for Video Agent - max 4 minutes)
    const scriptPrompt = `Create a professional broadcast-quality script about: ${description}

Requirements:
- Write in ${detectedLanguage} language ONLY
- Duration: 3-4 minutes of narration (optimal for HeyGen Video Agent)
- Professional news/documentary tone
- Structure:
  * Strong opening hook (20 seconds)
  * Main content with key points (2.5-3 minutes)
  * Strong closing summary (20 seconds)
- Clear, engaging delivery
- Natural speaking rhythm

Return only the complete script text in ${detectedLanguage}.`;

    console.log('📝 Generating professional script (3-4 minutes)...');
    const scriptResult = await base44.integrations.Core.InvokeLLM({
      prompt: scriptPrompt,
      add_context_from_internet: true
    });

    const fullScript = scriptResult?.trim() || description;
    console.log('✅ Script generated:', fullScript.length, 'characters');
    console.log('📊 Preview:', fullScript.substring(0, 150) + '...');

    // Split script into chunks if too long (Pro Plan limit: 5 minutes ≈ 1500 chars)
    const chunkScript = (text) => {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      const chunks = [];
      let current = '';
      
      sentences.forEach(sentence => {
        if((current + sentence).length < 1400) {
          current += sentence;
        } else {
          if(current) chunks.push(current.trim());
          current = sentence;
        }
      });
      if(current) chunks.push(current.trim());
      return chunks;
    };

    const scriptChunks = chunkScript(fullScript);
    console.log(`📊 Script split into ${scriptChunks.length} chunks for processing`);
    scriptChunks.forEach((chunk, i) => {
      console.log(`  Chunk ${i+1}: ${chunk.length} chars`);
    });

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

    // 5. Process each script chunk with queue to respect concurrent limits (Pro: 3 concurrent)
    console.log('🎬 Generating videos from script chunks...');
    
    const videoIds = [];
    const baseDelay = 5000; // 5 seconds between requests
    
    for (let i = 0; i < scriptChunks.length; i++) {
      const chunk = scriptChunks[i];
      
      // Respect concurrent limits - wait before processing
      if(i > 0) {
        await new Promise(resolve => setTimeout(resolve, baseDelay));
      }
      
      const videoPrompt = `Create a professional ${detectedLanguage} news broadcast video.

Script (chunk ${i+1}/${scriptChunks.length}):
${chunk}

Style: Professional TV news presenter, studio background, engaging delivery.`;

      console.log(`📤 Chunk ${i+1}/${scriptChunks.length}: Calling HeyGen Video Agent API...`);
      
      try {
        const heygenResponse = await fetch('https://api.heygen.com/v1/video_agent/generate', {
          method: 'POST',
          headers: {
            'X-API-KEY': HEYGEN_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: videoPrompt
          })
        });

        const responseText = await heygenResponse.text();
        console.log(`📥 Chunk ${i+1} Response:`, heygenResponse.status);

        if (!heygenResponse.ok) {
          console.error(`❌ Chunk ${i+1} HeyGen error:`, heygenResponse.status, responseText);
          continue; // Skip failed chunk and continue with next
        }

        const heygenData = JSON.parse(responseText);
        const videoId = heygenData.data?.video_id || heygenData.video_id || heygenData.data?.id || heygenData.id;
        
        if (videoId) {
          videoIds.push(videoId);
          console.log(`✅ Chunk ${i+1} started! video_id:`, videoId);
        } else {
          console.error(`❌ No video ID for chunk ${i+1}:`, heygenData);
        }
      } catch (error) {
        console.error(`❌ Chunk ${i+1} error:`, error.message);
        continue;
      }
    }

    if (videoIds.length === 0) {
      return Response.json({ 
        error: 'Failed to start any video generation',
        details: 'All chunks failed'
      }, { status: 500 });
    }

    console.log(`✅ Total videos queued: ${videoIds.length}/${scriptChunks.length}`);

    return Response.json({
      video_ids: videoIds,
      total_chunks: scriptChunks.length,
      successful_chunks: videoIds.length,
      status: 'processing',
      message: `${videoIds.length} videos are being generated by HeyGen Video Agent`
    });

  } catch (error) {
    console.error('🔴 Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});