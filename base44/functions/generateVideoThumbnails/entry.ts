import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import ffmpeg from 'npm:fluent-ffmpeg@2.1.2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all videos without thumbnails
    const videos = await base44.entities.UserVideo.filter({
      thumbnail_url: null
    });

    const results = [];
    
    for (const video of videos.slice(0, 10)) { // Process 10 at a time
      try {
        // Download video to temp file
        const videoResponse = await fetch(video.video_url);
        const videoBlob = await videoResponse.blob();
        const videoBuffer = await videoBlob.arrayBuffer();
        
        const tempVideoPath = `/tmp/video_${video.id}.mp4`;
        const tempThumbPath = `/tmp/thumb_${video.id}.jpg`;
        
        // Write video to temp
        await Deno.writeFile(tempVideoPath, new Uint8Array(videoBuffer));
        
        // Extract frame at 1 second using ffmpeg
        await new Promise((resolve, reject) => {
          ffmpeg(tempVideoPath)
            .screenshots({
              timestamps: ['1'],
              filename: 'thumb.jpg',
              folder: '/tmp',
              size: '320x568'
            })
            .on('end', resolve)
            .on('error', reject);
        });
        
        // Read thumbnail
        const thumbData = await Deno.readFile(tempThumbPath);
        
        // Upload thumbnail
        const file = new File([thumbData], `thumb_${video.id}.jpg`, { type: 'image/jpeg' });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        // Update video with thumbnail
        await base44.entities.UserVideo.update(video.id, {
          thumbnail_url: file_url
        });
        
        results.push({ video_id: video.id, thumbnail_url: file_url });
        
        // Cleanup
        await Deno.remove(tempVideoPath);
        await Deno.remove(tempThumbPath);
        
      } catch (err) {
        console.error(`Failed to process video ${video.id}:`, err);
        results.push({ video_id: video.id, error: err.message });
      }
    }

    return Response.json({ processed: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});