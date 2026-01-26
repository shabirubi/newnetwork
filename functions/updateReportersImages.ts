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
        const prompt = `Professional news reporter ${reporter.gender === 'male' ? 'male' : 'female'} standing in a TV broadcast studio.
The reporter is holding a large professional microphone in their hand. The microphone has a RED CIRCULAR LOGO on top (the "הרשת החדשה" logo).
Behind the reporter: modern news studio with LED screens, professional broadcast lighting, news desk, multiple monitors showing graphics.
The reporter is wearing formal business attire (suit/blazer), looking directly at camera, confident pose.
Studio has blue/red accent lighting, very professional TV news environment.
Photorealistic, high quality, professional broadcast photography, 4K quality.
The microphone with red logo must be clearly visible and prominent in the frame.
Israeli TV news studio aesthetic.`;

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