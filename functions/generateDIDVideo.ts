export default async function generateDIDVideo(data) {
  const { text } = data;
  const DID_API_KEY = process.env.DID_API_KEY;

  if (!DID_API_KEY) {
    throw new Error('DID_API_KEY not configured');
  }

  try {
    // Create a new talk/video
    const createResponse = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        script: {
          type: 'text',
          input: text,
        },
        config: {
          fluent: true,
          pad_audio: true,
        },
        source_url: 'https://d-id-public-bucket.s3.amazonaws.com/or-头像.jpg',
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(error.detail || 'Failed to create video');
    }

    const result = await createResponse.json();
    
    return {
      success: true,
      video_url: result.result_url || result.video_url,
      talk_id: result.id,
      status: result.status || 'processing',
      duration: result.duration || 0,
    };
  } catch (error) {
    throw new Error(`D-ID API Error: ${error.message}`);
  }
}