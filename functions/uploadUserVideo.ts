import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const title = formData.get('title');

    if (!file || !title) {
      return Response.json({ error: 'Missing file or title' }, { status: 400 });
    }

    // Check file size (30MB max)
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 30) {
      return Response.json({ error: 'File size exceeds 30MB limit' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const fileBlob = new Blob([buffer], { type: file.type });

    // Upload file
    const uploadResponse = await base44.integrations.Core.UploadFile({ file: fileBlob });
    const videoUrl = uploadResponse.file_url;

    // Create UserVideo record
    const userVideo = await base44.entities.UserVideo.create({
      title,
      video_url: videoUrl,
      file_size: fileSizeInMB,
      status: 'ready',
      uploader_email: user.email,
      thumbnail_url: `https://img.youtube.com/vi/${Math.random().toString(36).substring(7)}/0.jpg`
    });

    return Response.json({ success: true, video: userVideo });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});