const DID_API_KEY = 'c2V5b3JsYXlsYUBnbWFpbC5jb206qkNB7jwoi4z_0QU-HIqdi';
const DID_API_URL = 'https://api.d-id.com/talks';

export default async function generateTalkingHeadVideo(articleData) {
  try {
    const {
      title,
      subtitle,
      content,
      reporter_name = 'כתב הרשת החדשה',
      reporter_image = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/a6c94b22a_image.png'
    } = articleData;

    const presentationText = `
שלום, אני ${reporter_name}. 
${subtitle || title}

${content.substring(0, 300)}...
    `.trim();

    console.log('📹 יוצר וידאו מדבר עם D-ID...');

    const response = await fetch(DID_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_url: reporter_image,
        script: {
          type: 'text',
          input: presentationText,
          provider: {
            type: 'microsoft',
            voice_id: 'he-IL-AvriNeural'
          }
        },
        config: {
          fluent: true,
          pad_audio: 0
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API error: ${response.status}`);
    }

    const talkId = data.id;
    let done = false;
    let videoData = data;
    
    while (!done) {
      const statusResponse = await fetch(`${DID_API_URL}/${talkId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${DID_API_KEY}`
        }
      });
      
      videoData = await statusResponse.json();
      
      if (videoData.status === 'done') {
        done = true;
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('✅ וידאו נוצר בהצלחה');
    return {
      success: true,
      video_url: videoData.result_url,
      talk_id: talkId,
      duration: videoData.duration
    };

  } catch (error) {
    console.error('❌ שגיאה ביצירת וידאו:', error.message);
    throw new Error(error.message);
  }
}