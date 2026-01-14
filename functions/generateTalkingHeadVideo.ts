import axios from 'axios';

const DID_API_KEY = 'c2V5b3JsYXlsYUBnbWFpbC5jb20:lcR_jsVWiAMdctYjJVqme';
const DID_API_URL = 'https://api.d-id.com/talks';
const PRESENTER_ID = 'default'; // ID של הכתב - אפשר לשנות לכתבים שונים

export async function generateTalkingHeadVideo(articleData) {
  try {
    const {
      title,
      subtitle,
      content,
      reporter_name = 'כתב הרשת החדשה',
      reporter_image = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/a6c94b22a_image.png'
    } = articleData;

    // כתבו את הטקסט שהכתב ישדר
    const presentationText = `
שלום, אני ${reporter_name}. 
${subtitle || title}

${content.substring(0, 300)}...
    `.trim();

    console.log('📹 יוצר וידאו מדבר עם D-ID...');

    // קריאה ל-D-ID API
    const response = await axios.post(
      DID_API_URL,
      {
        source_url: reporter_image,
        script: {
          type: 'text',
          subtitles: false,
          provider: {
            type: 'elevenlabs',
            voice_id: 'JBFqnCBsd6RMkjVY3eQj' // קול גברי בעברית
          },
          ssml: false,
          input: presentationText
        },
        config: {
          fluent: true,
          pad_audio: 0.0
        },
        session_id: `session_${Date.now()}`
      },
      {
        headers: {
          'Authorization': `Bearer ${DID_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data?.result_url) {
      console.log('✅ וידאו נוצר בהצלחה');
      return {
        success: true,
        video_url: response.data.result_url,
        talk_id: response.data.id,
        duration: response.data.duration
      };
    } else {
      throw new Error('No video URL in response');
    }

  } catch (error) {
    console.error('❌ שגיאה ביצירת וידאו D-ID:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// פונקציה לבדיקת סטטוס של וידאו
export async function checkVideoStatus(talkId) {
  try {
    const response = await axios.get(
      `${DID_API_URL}/${talkId}`,
      {
        headers: {
          'Authorization': `Bearer ${DID_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      status: response.data?.status,
      video_url: response.data?.result_url,
      progress: response.data?.progress
    };

  } catch (error) {
    console.error('❌ שגיאה בבדיקת סטטוס:', error.message);
    return { error: error.message };
  }
}

// פונקציה להריסת וידאו (עבור ניהול תקציב)
export async function deleteVideo(talkId) {
  try {
    await axios.delete(
      `${DID_API_URL}/${talkId}`,
      {
        headers: {
          'Authorization': `Bearer ${DID_API_KEY}`
        }
      }
    );
    return { success: true };
  } catch (error) {
    console.error('❌ שגיאה במחיקת וידאו:', error.message);
    return { error: error.message };
  }
}