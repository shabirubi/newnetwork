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
      return Response.json({ 
        error: 'ELEVENLABS_API_KEY not configured' 
      }, { status: 500 });
    }

    // Get all available voices from ElevenLabs
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ 
        error: 'ElevenLabs API error',
        details: errorText,
        status: response.status
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Filter for Hebrew voices or voices that support Hebrew
    const hebrewVoices = data.voices.filter(voice => {
      const labels = voice.labels || {};
      const description = voice.description || '';
      const name = voice.name || '';
      
      // Check if voice supports Hebrew
      return (
        labels.language === 'he' || 
        labels.language === 'hebrew' ||
        description.toLowerCase().includes('hebrew') ||
        description.toLowerCase().includes('עברית') ||
        name.toLowerCase().includes('hebrew') ||
        name.includes('עברית')
      );
    });

    return Response.json({
      success: true,
      totalVoices: data.voices.length,
      hebrewVoices: hebrewVoices.length,
      allVoices: data.voices.map(v => ({
        voice_id: v.voice_id,
        name: v.name,
        labels: v.labels,
        description: v.description,
        preview_url: v.preview_url
      })),
      hebrewVoicesOnly: hebrewVoices.map(v => ({
        voice_id: v.voice_id,
        name: v.name,
        labels: v.labels,
        description: v.description,
        preview_url: v.preview_url
      }))
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});