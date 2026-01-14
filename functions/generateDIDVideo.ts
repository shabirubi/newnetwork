export default async function generateDIDVideo(data) {
  const { text } = data;
  const auth = process.env.DID_API_KEY || 'c2V5b3JsYXlsYUBnbWFpbC5jb206MUJNeVNPcmtGRHFHbGtnak1xb3NR';

  try {
    const response = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
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

    if (!response.ok) {
      throw new Error(`D-ID API error: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      video_url: result.result_url,
      talk_id: result.id,
      status: result.status,
    };
  } catch (error) {
    throw new Error(error.message);
  }
}