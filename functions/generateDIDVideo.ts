import axios from 'axios';

export async function generateDIDVideo(data) {
  const { text, presenter_image = 'https://d-id-public-bucket.s3.amazonaws.com/alice.jpg' } = data;

  if (!text) {
    throw new Error('Text is required');
  }

  const apiKey = process.env.DID_API_KEY;
  if (!apiKey) {
    throw new Error('D-ID API Key not configured');
  }

  try {
    // Create talking head video
    const response = await axios.post(
      'https://api.d-id.com/talks',
      {
        source_url: presenter_image,
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
          'Authorization': `Basic ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      video_url: response.data.result_url,
      talk_id: response.data.id,
      duration: response.data.duration || 0,
      status: response.data.status
    };
  } catch (error) {
    console.error('D-ID API Error:', error.response?.data || error.message);
    throw new Error('Failed to generate video: ' + (error.response?.data?.message || error.message));
  }
}