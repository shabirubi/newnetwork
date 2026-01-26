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
      { category: 'breaking', count: 8, query: 'breaking news Israel today' },
      { category: 'security', count: 8, query: 'security defense Israel news' },
      { category: 'economy', count: 8, query: 'economy business Israel news' },
      { category: 'politics', count: 8, query: 'politics government Israel' },
      { category: 'technology', count: 8, query: 'technology startup Israel' },
      { category: 'sports', count: 8, query: 'sports Israel football' },
      { category: 'entertainment', count: 8, query: 'entertainment culture Israel' },
      { category: 'world', count: 8, query: 'international world news' },
      { category: 'health', count: 8, query: 'health medical news' },
      { category: 'music', count: 6, query: 'music artists Israel' },
      { category: 'horoscope', count: 4, query: 'horoscope astrology' },
      { category: 'finance', count: 8, query: 'finance stock market trading' }
    ];

    const results = [];
    
    for (const cat of categories) {
      try {
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Find ${cat.count} REAL, recent news articles about: "${cat.query}". Get them from current news sources.
          
          For EACH article provide:
          - Compelling Hebrew title
          - 2-3 paragraph detailed content in Hebrew
          - Professional image URL (real image from the article)
          - News source name
          
          Return ${cat.count} articles in JSON format with real, current information.`,
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
          let final_image = article.image_url;
          
          // אם אין תמונה או שהיא לא תקינה, ייצור תמונה
          if (!final_image || final_image.includes('placeholder') || final_image.includes('default')) {
            try {
              const imageResponse = await base44.asServiceRole.integrations.Core.GenerateImage({
                prompt: `Professional news article image for: "${article.title}". High quality, modern design, relevant to the news topic. Hebrew context.`,
                existing_image_urls: article.image_url ? [article.image_url] : []
              });
              final_image = imageResponse.url || article.image_url;
            } catch (imgErr) {
              console.error('Image generation failed:', imgErr);
              final_image = article.image_url || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop';
            }
          }
          
          await base44.asServiceRole.entities.NewsArticle.create({
            title: article.title,
            subtitle: article.subtitle || '',
            content: article.content,
            image_url: final_image,
            category: cat.category,
            source: article.source || 'News Source',
            is_breaking: cat.category === 'breaking' ? Math.random() > 0.7 : false,
            is_featured: cat.category === 'breaking' || cat.category === 'security' ? Math.random() > 0.6 : false
          });
          
          results.push({
            category: cat.category,
            title: article.title,
            image: final_image ? 'generated' : 'original',
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