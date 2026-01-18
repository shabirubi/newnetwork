import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all articles
    const articles = await base44.asServiceRole.entities.NewsArticle.list('-created_date', 500);
    
    let updated = 0;
    let failed = 0;
    const results = [];

    for (const article of articles) {
      try {
        // Generate new image with English prompt
        const imagePrompt = `Professional news photograph depicting: ${article.title}. High quality journalism image, realistic, professional photography. IMPORTANT: NO TEXT OR CAPTIONS in the image, only visual content.`;
        
        const { url: image_url } = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: imagePrompt
        });

        // Update article with new image
        await base44.asServiceRole.entities.NewsArticle.update(article.id, {
          image_url
        });

        updated++;
        results.push({ id: article.id, title: article.title, status: 'success' });
        
        // Wait a bit between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        failed++;
        results.push({ 
          id: article.id, 
          title: article.title, 
          status: 'failed', 
          error: error.message 
        });
        console.error(`Failed to update ${article.id}:`, error);
      }
    }

    return Response.json({
      success: true,
      total: articles.length,
      updated,
      failed,
      results
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});