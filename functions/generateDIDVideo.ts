export default async function generateDIDVideo(data) {
  const { text } = data;
  const DID_API_KEY = 'c2V5b3JsYXlsYUBnbWFpbC5jb206qkNB7jwoi4z_0QU-HIqdi';

  try {
    const response = await fetch('https://api.d-id.com/talks', {
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
        source_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || `D-ID API error: ${response.status}`);
    }

    const talkId = result.id;
    let done = false;
    let videoResult = result;
    
    // Poll until video is ready
    while (!done) {
      const statusResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${DID_API_KEY}`,
        },
      });
      
      videoResult = await statusResponse.json();
      
      if (videoResult.status === 'done') {
        done = true;
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return {
      success: true,
      video_url: videoResult.result_url,
      talk_id: talkId,
      status: videoResult.status,
    };
  } catch (error) {
    console.error('D-ID Video Error:', error.message);
    console.error('Full error:', error);
    throw new Error(`D-ID Error: ${error.message}`);
  }
}