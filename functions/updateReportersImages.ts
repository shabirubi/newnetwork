import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    // Logo URL
    const logoUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

    // Fetch all active reporters
    const reporters = await base44.asServiceRole.entities.Reporter.filter({ is_active: true });

    const results = [];

    for (const reporter of reporters) {
      try {
        // Create an extremely detailed prompt focusing on the microphone with logo
        const prompt = `A professional Israeli TV news reporter standing in a modern broadcast studio, holding a large TV news microphone prominently in front of them. 
The microphone must have a bright RED CIRCULAR LOGO FLAG/CUBE on top - this is the station's branding, similar to CNN or BBC microphones.
The reporter is ${reporter.gender === 'male' ? 'a confident young man' : 'a confident young woman'} wearing elegant business attire (dark suit/blazer).
Background: Professional Israeli news studio with LED video walls displaying news graphics, studio lights, modern anchor desk, multiple flat screen monitors.
The reporter is looking at the camera with a professional expression, in a classic news reporter pose.
Lighting: Professional TV studio lighting - key light, fill light, rim light - creating a polished broadcast look.
The red branded microphone is the focal point - held at chest level, clearly visible with the red logo/flag on top.
Style: Photorealistic, high-end broadcast photography, sharp focus, professional color grading, TV production quality.
Israeli broadcast news aesthetic - modern, clean, professional.`;

        // Generate new image with logo reference
        const imageResult = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: prompt,
          existing_image_urls: [logoUrl]
        });

        if (imageResult && imageResult.url) {
          // Update reporter with new image
          await base44.asServiceRole.entities.Reporter.update(reporter.id, {
            image: imageResult.url
          });

          results.push({
            reporter: reporter.name,
            status: 'success',
            newImage: imageResult.url
          });
        } else {
          results.push({
            reporter: reporter.name,
            status: 'failed',
            error: 'No image URL returned'
          });
        }

        // Wait 2 seconds between requests to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        results.push({
          reporter: reporter.name,
          status: 'error',
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      totalReporters: reporters.length,
      updated: results.filter(r => r.status === 'success').length,
      results: results
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});