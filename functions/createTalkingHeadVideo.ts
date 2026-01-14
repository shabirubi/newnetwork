import axios from 'axios';

export async function createTalkingHeadVideo(data) {
  const { text } = data;

  if (!text) {
    throw new Error('Text is required');
  }

  try {
    const response = await axios.post(
      'https://api.d-id.com/talks',
      {
        source_url: 'https://d-id-public-bucket.s3.amazonaws.com/alice.jpg',
        script: {
          type: 'text',
          provider: {
            type: 'elevenlabs',
            voice_id: 'Adam'
          },
          ssml: false,
          input: text
        }
      },
      {
        headers: {
          'Authorization': `Basic ${process.env.REACT_APP_DID_API_KEY || ''}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      video_url: response.data.result_url,
      talk_id: response.data.id,
      duration: response.data.duration || 0
    };
  } catch (error) {
    console.error('D-ID API Error:', error);
    throw new Error('Failed to generate video: ' + (error.response?.data?.message || error.message));
  }
}