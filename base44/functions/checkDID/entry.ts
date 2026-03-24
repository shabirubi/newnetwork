import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!DID_API_KEY) {
      return Response.json({ error: 'DID_API_KEY not set' }, { status: 500 });
    }

    if (!ELEVENLABS_API_KEY) {
      return Response.json({ error: 'ELEVENLABS_API_KEY not set' }, { status: 500 });
    }

    console.log('Testing D-ID and ElevenLabs...');

    // Test D-ID
    const creditsResponse = await fetch('https://api.d-id.com/credits', {
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`
      }
    });

    const creditsText = await creditsResponse.text();
    console.log('D-ID Credits:', creditsText);

    // Test ElevenLabs voices
    const voicesResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      }
    });

    const voicesText = await voicesResponse.text();
    console.log('ElevenLabs Voices response:', voicesResponse.status);

    if (!creditsResponse.ok) {
      return Response.json({
        error: 'D-ID API key invalid',
        details: creditsText
      }, { status: 500 });
    }

    if (!voicesResponse.ok) {
      return Response.json({
        error: 'ElevenLabs API key invalid',
        details: voicesText
      }, { status: 500 });
    }

    const voices = JSON.parse(voicesText);

    return Response.json({
      success: true,
      did_credits: JSON.parse(creditsText),
      elevenlabs_voices: voices.voices?.length || 0,
      message: 'Both APIs working!'
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});