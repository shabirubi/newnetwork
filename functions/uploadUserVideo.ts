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

    // Get file size
    const fileSizeInMB = file.size / (1024 * 1024);

    // Convert File to ArrayBuffer for upload
    const buffer = await file.arrayBuffer();
    
    // Upload file using the integration
    const uploadResponse = await base44.integrations.Core.UploadFile({ file: buffer });
    const videoUrl = uploadResponse.file_url;

    // Create UserVideo record
    const userVideo = await base44.entities.UserVideo.create({
      title,
      video_url: videoUrl,
      file_size: fileSizeInMB,
      status: 'ready',
      uploader_email: user.email
    });

    return Response.json({ success: true, video: userVideo });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});