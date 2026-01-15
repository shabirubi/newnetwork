import { base44 } from "@/api/base44Client";

export async function generateElevenLabsAudio(text) {
  try {
    const response = await fetch('/api/generate-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        voice_id: 'nPczCjzI2devNBz1zQrH'
      })
    });

    if (response.ok) {
      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    }
  } catch (error) {
    console.error('ElevenLabs error:', error);
  }
  return null;
}