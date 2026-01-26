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
        // Create a detailed prompt for studio setting with microphone and logo
        const prompt = `Professional TV news reporter ${reporter.name} in a modern broadcast news studio. 
The reporter is ${reporter.gender === 'male' ? 'a man' : 'a woman'} holding a microphone with a visible red logo on it. 
Behind them is a professional news studio background with screens, lights, and modern broadcast equipment.
The reporter is wearing professional business attire, looking confident and professional.
Photorealistic style, high quality, professional lighting, TV broadcast quality.
The microphone should be prominently visible in their hand with the red branding logo clearly shown.
Studio background should include: news desk, multiple monitors, professional lighting setup, modern design.`;

        // Generate new image
        const imageResult = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: prompt,
          existing_image_urls: [reporter.image, logoUrl]
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