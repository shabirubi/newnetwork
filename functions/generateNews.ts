import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Admin only
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const categories = [
      { category: 'breaking', count: 5, query: 'חדשות חמות בישראל עכשיו' },
      { category: 'security', count: 3, query: 'חדשות ביטחון ומדיניות ישראל' },
      { category: 'economy', count: 3, query: 'חדשות כלכלה ועסקים ישראל' },
      { category: 'politics', count: 2, query: 'חדשות פוליטיקה ישראל' },
      { category: 'technology', count: 2, query: 'חדשות טכנולוגיה והייטק ישראל' },
      { category: 'sports', count: 2, query: 'חדשות ספורט ישראל' },
      { category: 'entertainment', count: 2, query: 'חדשות בידור ותרבות ישראל' },
      { category: 'world', count: 2, query: 'חדשות עולם בינלאומיות' }
    ];

    const results = [];
    
    for (const cat of categories) {
      try {
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `חפש ${cat.count} כתבות חדשות אמיתיות ועדכניות על "${cat.query}".
          
          עבור כל כתבה תן:
          - כותרת מושכת בעברית
          - תוכן מפורט (2-3 פסקאות)
          - תמונה רלוונטית (URL)
          - מקור
          
          החזר ${cat.count} כתבות בפורמט JSON.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              articles: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    subtitle: { type: "string" },
                    content: { type: "string" },
                    image_url: { type: "string" },
                    source: { type: "string" }
                  }
                }
              }
            }
          }
        });

        const articles = response.articles || [];
        
        for (const article of articles) {
          await base44.asServiceRole.entities.NewsArticle.create({
            title: article.title,
            subtitle: article.subtitle || '',
            content: article.content,
            image_url: article.image_url,
            category: cat.category,
            source: article.source || 'הרשת החדשה',
            is_breaking: cat.category === 'breaking',
            is_featured: false
          });
          
          results.push({
            category: cat.category,
            title: article.title,
            status: 'created'
          });
        }

        // המתנה קצרה בין קטגוריות
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error in category ${cat.category}:`, error);
        results.push({
          category: cat.category,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      generated: results.filter(r => r.status === 'created').length,
      total_categories: categories.length,
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