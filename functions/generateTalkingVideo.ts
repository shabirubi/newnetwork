/**
 * Generate talking video using D-ID API
 * Creates realistic AI avatars that speak with lip-sync
 */
export default async function generateTalkingVideo(data, context) {
  const { text, avatarUrl, voice = "he-IL-AvriNeural" } = data;
  
  const DID_API_KEY = context.secrets.DID_API_KEY;
  
  if (!DID_API_KEY) {
    throw new Error("D-ID API Key not configured. Please add DID_API_KEY to secrets.");
  }

  // Create talk using D-ID API
  const response = await fetch('https://api.d-id.com/talks', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${DID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      script: {
        type: 'text',
        input: text,
        provider: {
          type: 'microsoft',
          voice_id: voice
        }
      },
      source_url: avatarUrl,
      config: {
        fluent: true,
        pad_audio: 0,
        stitch: true
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`D-ID API error: ${error}`);
  }

  const result = await response.json();
  const talkId = result.id;

  // Poll for video completion
  let attempts = 0;
  const maxAttempts = 60; // 60 seconds max wait
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    const statusResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`
      }
    });
    
    const statusData = await statusResponse.json();
    
    if (statusData.status === 'done') {
      return {
        success: true,
        video_url: statusData.result_url,
        duration: statusData.duration,
        talk_id: talkId
      };
    }
    
    if (statusData.status === 'error') {
      throw new Error(`Video generation failed: ${statusData.error}`);
    }
    
    attempts++;
  }
  
  throw new Error('Video generation timeout');
}