export default async function generateReporterVoice({ text, reporterName, reporterGender }) {
  const API_KEY = process.env.ELEVENLABS_API_KEY;
  
  if (!API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  // Male voice IDs
  const maleVoiceIds = [
    'pNInz6obpgDQGcFmaJgB', // Adam
    'yoZ06aMxZJJ28mfd3POQ', // Sam
    'Yko7PKHZNXotIFUBG7I9', // Daniel
    '21m00Tcm4TlvDq8ikWAM', // Josh
    'N2lVS1w4EtoT3dr4eOWO', // Callum
  ];
  
  // Female voice IDs
  const femaleVoiceIds = [
    'EXAVITQu4vr4xnSDxMaL', // Sarah
    'MF3mGyEYCl7XYWbV9V6O', // Elli
    'XrExE9yKIg1WjnnlVkGX', // Matilda
    'oWAxZDx7w5VEj9dCyTzz', // Grace
    'iP95p4xoKVk53GoZ742B', // Lily
  ];
  
  // Hash function to get consistent voice per reporter
  const getVoiceId = (name, gender) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash = hash & hash;
    }
    const voiceArray = gender === 'female' ? femaleVoiceIds : maleVoiceIds;
    return voiceArray[Math.abs(hash) % voiceArray.length];
  };
  
  const voiceId = getVoiceId(reporterName, reporterGender);
  
  // Call ElevenLabs API
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': API_KEY
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
  }

  // Get audio as base64
  const audioBuffer = await response.arrayBuffer();
  const base64Audio = Buffer.from(audioBuffer).toString('base64');
  
  return {
    audioBase64: base64Audio,
    mimeType: 'audio/mpeg'
  };
}