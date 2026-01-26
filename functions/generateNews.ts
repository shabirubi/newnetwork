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
      { category: 'breaking', count: 8, query: 'breaking news today' },
      { category: 'security', count: 7, query: 'security defense news' },
      { category: 'economy', count: 7, query: 'economy business news' },
      { category: 'politics', count: 7, query: 'politics government' },
      { category: 'technology', count: 7, query: 'technology startup innovation' },
      { category: 'sports', count: 6, query: 'sports football news' },
      { category: 'entertainment', count: 6, query: 'entertainment culture movies' },
      { category: 'world', count: 7, query: 'world international news' },
      { category: 'health', count: 6, query: 'health medical science' },
      { category: 'music', count: 5, query: 'music artists concerts' },
      { category: 'horoscope', count: 3, query: 'horoscope astrology' },
      { category: 'finance', count: 6, query: 'finance market stocks' }
    ];

    const results = [];
    
    // רק שתי קטגוריות בכל פעם להימנע מ-timeout
    const categoriesToProcess = categories.slice(0, 4);
    
    for (const cat of categoriesToProcess) {
      try {
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Find ${cat.count} REAL news articles from today about: ${cat.query}.
          Return JSON with articles array. Each article has: title, subtitle, content (3 paragraphs), source.`,
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
                    source: { type: "string" }
                  }
                }
              }
            }
          }
        });

        const articles = response.articles || [];
        let created = 0;
        
        for (const article of articles) {
          try {
            await base44.asServiceRole.entities.NewsArticle.create({
              title: article.title,
              subtitle: article.subtitle || '',
              content: article.content,
              image_url: '',
              category: cat.category,
              source: article.source || 'News',
              is_breaking: cat.category === 'breaking',
              is_featured: Math.random() > 0.7
            });
            created++;
          } catch (e) {
            console.log(`Save error: ${e.message}`);
          }
        }
        
        results.push({
          category: cat.category,
          created: created,
          status: 'done'
        });
        
      } catch (error) {
        results.push({
          category: cat.category,
          error: error.message || 'Failed'
        });
      }
    }

    return Response.json({
      success: true,
      generated: results.filter(r => r.status === 'created').length,
      with_images: results.filter(r => r.image === 'generated').length,
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