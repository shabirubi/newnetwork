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
      { category: 'breaking', count: 5, query: 'breaking news today' },
      { category: 'security', count: 4, query: 'security defense news' },
      { category: 'economy', count: 4, query: 'economy business news' },
      { category: 'politics', count: 4, query: 'politics government' },
      { category: 'technology', count: 4, query: 'technology startup news' },
      { category: 'sports', count: 3, query: 'sports football news' },
      { category: 'entertainment', count: 3, query: 'entertainment culture' },
      { category: 'world', count: 4, query: 'world international news' },
      { category: 'health', count: 3, query: 'health medical' },
      { category: 'music', count: 2, query: 'music artists' },
      { category: 'horoscope', count: 1, query: 'horoscope today' },
      { category: 'finance', count: 3, query: 'finance market' }
    ];

    const results = [];
    
    for (const cat of categories) {
      try {
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Search for ${cat.count} REAL, TODAY's news articles about: "${cat.query}". 
          Use ONLY reliable, free news sources (BBC, Reuters, AP, Haaretz, Ynet, etc).
          
          For EACH article provide:
          - Compelling Hebrew title (1 sentence)
          - 2-3 paragraph detailed Hebrew content
          - Topic/subject for image generation
          - Source name (real news organization)
          
          Return ONLY real news from TODAY or this week. Return as JSON.`,
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
                    image_topic: { type: "string" },
                    source: { type: "string" }
                  }
                }
              }
            }
          }
        });

        const articles = response.articles || [];
        
        for (const article of articles) {
          let final_image = null;
          
          // יצור תמונה עבור כל כתבה (ללא המתנה, ברקע)
          if (article.image_topic || article.title) {
            base44.asServiceRole.integrations.Core.GenerateImage({
              prompt: `News photo: ${article.image_topic || article.title}. Professional, high quality.`
            }).then(img => {
              final_image = img.url;
            }).catch(err => console.error('Image:', err.message));
          }
          
          await base44.asServiceRole.entities.NewsArticle.create({
            title: article.title,
            subtitle: article.subtitle || '',
            content: article.content,
            image_url: final_image || '',
            category: cat.category,
            source: article.source || 'News Source',
            is_breaking: cat.category === 'breaking' ? Math.random() > 0.7 : false,
            is_featured: cat.category === 'breaking' || cat.category === 'security' ? Math.random() > 0.6 : false
          });
          
          results.push({
            category: cat.category,
            title: article.title,
            image: final_image ? 'generated' : 'failed',
            status: 'created'
          });
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
        
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