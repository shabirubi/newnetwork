export default async function generateDIDVideo(data) {
  const { text } = data;
  const DID_API_KEY = 'c2V5b3JsYXlsYUBnbWFpbC5jb206qkNB7jwoi4z_0QU-HIqdi';

  try {
    const credentials = Buffer.from(DID_API_KEY).toString('base64');
    const response = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
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
        source_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || `D-ID API error: ${response.status}`);
    }

    return {
      success: true,
      video_url: result.result_url,
      talk_id: result.id,
      status: result.status,
    };
  } catch (error) {
    console.error('D-ID Video Error:', error);
    throw new Error(error.message);
  }
}