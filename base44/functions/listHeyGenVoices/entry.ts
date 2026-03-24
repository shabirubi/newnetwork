import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get('HEYGEN_API_KEY');
    
    if (!apiKey) {
      return Response.json({ error: 'HEYGEN_API_KEY not configured' }, { status: 500 });
    }

    console.log('Fetching HeyGen voices...');

    const response = await fetch('https://api.heygen.com/v2/voices', {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch voices:', response.status, errorText);
      return Response.json({ 
        error: 'Failed to fetch voices',
        details: errorText 
      }, { status: 500 });
    }

    const data = await response.json();
    const voices = data?.data?.voices || [];
    
    // Filter for Hebrew voices
    const hebrewVoices = voices.filter(v => 
      v.language?.toLowerCase().includes('hebrew') || 
      v.language?.toLowerCase().includes('he') ||
      v.name?.toLowerCase().includes('hebrew')
    );

    console.log(`Found ${voices.length} total voices, ${hebrewVoices.length} Hebrew voices`);

    return Response.json({
      all_voices: voices,
      hebrew_voices: hebrewVoices,
      total_count: voices.length,
      hebrew_count: hebrewVoices.length
    });

  } catch (error) {
    console.error('ERROR:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});