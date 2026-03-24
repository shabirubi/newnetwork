import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { photo_url } = await req.json();
    
    if (!photo_url) {
      return Response.json({ error: 'photo_url is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('HEYGEN_API_KEY');
    
    if (!apiKey) {
      return Response.json({ error: 'HEYGEN_API_KEY not configured' }, { status: 500 });
    }

    console.log('Creating HeyGen photo avatar from URL:', photo_url);

    // Step 1: Create talking photo avatar
    const createRes = await fetch('https://api.heygen.com/v1/talking_photo', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: photo_url
      })
    });

    const createBody = await createRes.text();
    console.log('Create response:', createRes.status, createBody);

    if (!createRes.ok) {
      return Response.json({ 
        error: 'Failed to create photo avatar',
        details: createBody
      }, { status: 500 });
    }

    const createData = JSON.parse(createBody);
    const talkingPhotoId = createData?.data?.id;
    
    if (!talkingPhotoId) {
      return Response.json({ error: 'No talking_photo_id', response: createData }, { status: 500 });
    }

    console.log('Talking Photo ID:', talkingPhotoId);

    // Wait for processing (up to 60 seconds)
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 1000));

      const statusRes = await fetch(`https://api.heygen.com/v1/talking_photo/${talkingPhotoId}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': apiKey
        }
      });

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        const status = statusData?.data?.status;

        console.log(`Status check ${i + 1}/60: ${status}`);

        if (status === 'completed') {
          console.log('Photo avatar ready:', statusData.data);
          return Response.json({
            talking_photo_id: talkingPhotoId,
            status: 'completed',
            data: statusData.data
          });
        }

        if (status === 'failed') {
          console.error('Photo avatar failed:', statusData);
          return Response.json({ error: 'Photo avatar creation failed', details: statusData }, { status: 500 });
        }
      }
    }

    return Response.json({ 
      talking_photo_id: talkingPhotoId,
      status: 'processing',
      message: 'עדיין בעיבוד - בדוק שוב בעוד דקה'
    });

  } catch (error) {
    console.error('ERROR:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});