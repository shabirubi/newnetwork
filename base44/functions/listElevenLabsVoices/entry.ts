import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }

    // Get available voices from ElevenLabs
    const response = await fetch(
      'https://api.elevenlabs.io/v1/voices',
      {
        headers: {
          'xi-api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs error:', error);
      return Response.json(
        { error: 'Failed to fetch voices' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Format voices with gender and language info
    const voices = data.voices.map(voice => ({
      id: voice.voice_id,
      name: voice.name,
      preview_url: voice.preview_url,
      labels: voice.labels || {},
      gender: voice.labels?.gender || 'unknown',
      language: voice.labels?.language || 'multilingual',
      accent: voice.labels?.accent || 'neutral',
    }));

    return Response.json({ voices, success: true });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});