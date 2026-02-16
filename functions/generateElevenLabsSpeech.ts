import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { text, voice_id } = body;

    if (!text || !text.trim()) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!voice_id) {
      return Response.json({ error: 'Voice ID is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs error:', error);
      return Response.json(
        { error: 'Failed to generate speech' },
        { status: response.status }
      );
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer();
    
    // Convert to base64 data URL
    const uint8Array = new Uint8Array(audioBuffer);
    let base64Audio = '';
    for (let i = 0; i < uint8Array.length; i++) {
      base64Audio += String.fromCharCode(uint8Array[i]);
    }
    base64Audio = btoa(base64Audio);
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

    return Response.json({
      audio_url: audioUrl,
      success: true,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});