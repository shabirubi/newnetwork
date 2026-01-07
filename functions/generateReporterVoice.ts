import fetch from 'node-fetch';

export default async function generateReporterVoice({ text, gender, reporter_name }, { secrets }) {
  const ELEVENLABS_API_KEY = secrets.ELEVENLABS_API_KEY;
  
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  // Voice IDs for Hebrew speakers (you'll need to get these from ElevenLabs dashboard)
  const VOICE_IDS = {
    female: [
      'pNInz6obpgDQGcFmaJgB', // Adam (can be tuned for female)
      '21m00Tcm4TlvDq8ikWAM', // Rachel
      'AZnzlk1XvdvUeBnXmlld', // Domi
    ],
    male: [
      'TxGEqnHWrfWFTfGW9XjX', // Josh
      'VR6AewLTigWG4xSOukaG', // Arnold
      'pqHfZKP75CvOlQylNhV4', // Bill
    ]
  };

  // Select voice based on gender and reporter name hash
  const voiceList = VOICE_IDS[gender] || VOICE_IDS.male;
  let hash = 0;
  for (let i = 0; i < reporter_name.length; i++) {
    hash = ((hash << 5) - hash) + reporter_name.charCodeAt(i);
    hash = hash & hash;
  }
  const voiceId = voiceList[Math.abs(hash) % voiceList.length];

  // Call ElevenLabs API
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.statusText}`);
  }

  // Get audio as buffer
  const audioBuffer = await response.arrayBuffer();
  
  // Convert to base64
  const base64Audio = Buffer.from(audioBuffer).toString('base64');
  
  // Return as data URL
  return {
    audio_data: `data:audio/mpeg;base64,${base64Audio}`,
    success: true
  };
}