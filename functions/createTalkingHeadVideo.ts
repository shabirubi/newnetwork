import axios from 'axios';
import { base44 } from '@/api/base44Client';

const DID_API_KEY = 'c2V5b3JsYXlsYUBnbWFpbC5jb20:lcR_jsVWiAMdctYjJVqme';
const DID_API_URL = 'https://api.d-id.com/talks';

export async function createTalkingHeadVideo(text) {
  try {
    console.log('🎬 מתחיל ליצור וידאו עם D-ID...');

    const response = await axios.post(
      DID_API_URL,
      {
        source_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
        script: {
          type: 'text',
          subtitles: false,
          provider: {
            type: 'elevenlabs',
            voice_id: 'JBFqnCBsd6RMkjVY3eQj',
          },
          ssml: false,
          input: text,
        },
        config: {
          fluent: true,
          pad_audio: 0.0,
        },
        session_id: `session_${Date.now()}`,
      },
      {
        headers: {
          Authorization: `Bearer ${DID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 120000,
      }
    );

    if (response.data?.result_url) {
      console.log('✅ וידאו נוצר בהצלחה!');
      return {
        success: true,
        video_url: response.data.result_url,
        talk_id: response.data.id,
        duration: response.data.duration || 30,
      };
    } else {
      throw new Error('לא קיבלנו URL של וידאו מ-D-ID');
    }
  } catch (error) {
    console.error('❌ שגיאה:', error.message);
    throw error;
  }
}