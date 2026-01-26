import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { file, title, description, category } = body;

    if (!file || !title) {
      return Response.json({ error: 'Missing file or title' }, { status: 400 });
    }

    console.log('📥 Backend: התחיל להעלות קובץ...', title);

    // Convert base64 or blob to file
    let uploadFile = file;
    if (typeof file === 'string') {
      uploadFile = new Blob([Buffer.from(file.split(',')[1] || file, 'base64')], { type: 'video/mp4' });
    }

    // Upload file using the service role
    console.log('📤 מעלה לשרת...');
    const uploadResponse = await base44.asServiceRole.integrations.Core.UploadFile({ 
      file: uploadFile 
    });
    const videoUrl = uploadResponse.file_url;
    console.log('✅ קובץ הועלה:', videoUrl);

    // Create UserVideo record with category and feed if provided
    console.log('💾 יוצר רשומה ב-UserVideo...');
    const videoData = {
      title,
      video_url: videoUrl,
      description: description || '',
      status: 'ready',
      uploader_email: user.email,
      category: body.category || 'breaking',
      feed: body.feed || 'user-videos'
    };
    
    const userVideo = await base44.entities.UserVideo.create(videoData);
    
    console.log('✅ UserVideo נוצר:', userVideo.id);

    return Response.json({ success: true, video: userVideo });
  } catch (error) {
    console.error('❌ Upload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});