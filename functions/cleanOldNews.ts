import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Admin only
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all news articles
    const allNews = await base44.asServiceRole.entities.NewsArticle.list('-created_date', 10000);
    
    // Delete articles that appear to be in English
    let deleted = 0;
    for (const article of allNews) {
      // Check if title is mostly English
      const englishRegex = /^[A-Za-z\s.,!?-]*$/;
      const isEnglish = englishRegex.test(article.title);
      
      if (isEnglish) {
        try {
          await base44.asServiceRole.entities.NewsArticle.delete(article.id);
          deleted++;
        } catch (e) {
          console.log(`Failed to delete ${article.id}:`, e.message);
        }
      }
    }

    return Response.json({
      success: true,
      deleted: deleted,
      message: `Deleted ${deleted} English articles`
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});