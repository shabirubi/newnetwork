Deno.serve(async (req) => {
  try {
    const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY');

    if (!elevenLabsKey) {
      return Response.json({ error: 'ELEVENLABS_API_KEY not set' }, { status: 500 });
    }

    console.log('Testing ElevenLabs with key:', elevenLabsKey.substring(0, 10) + '...');

    const voiceId = '9BWtsMINqrJLrRacOk9x'; // Hebrew voice
    
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'שלום עולם',
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    const statusCode = response.status;
    const responseText = await response.text();

    if (!response.ok) {
      return Response.json({
        error: 'ElevenLabs API error',
        status: statusCode,
        message: responseText,
      }, { status: 500 });
    }

    return Response.json({
      success: true,
      status: statusCode,
      message: 'ElevenLabs API is working correctly',
    });

  } catch (error) {
    return Response.json({
      error: error.message,
    }, { status: 500 });
  }
});