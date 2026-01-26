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
          
          // משיכת תמונה מ-Unsplash בהתאם לנושא + שדרוג עם טקסט אנגלית
          if (article.image_topic || article.title) {
            try {
              const searchTerm = article.image_topic || article.title;
              const keywords = searchTerm.split(' ').slice(0, 2).join('+');
              const unsplashUrl = `https://source.unsplash.com/1280x720/?${encodeURIComponent(keywords)},news,professional`;
              
              // יוצרים תמונה עם טקסט משולב
              const textOverlay = searchTerm.substring(0, 35);
              const overlayPrompt = `Take the image from: ${unsplashUrl}. Add bold white English text at center: "${textOverlay}". Add professional news style dark overlay. Return the modified image.`;
              
              const imgResponse = await base44.asServiceRole.integrations.Core.GenerateImage({
                prompt: overlayPrompt,
                existing_image_urls: [unsplashUrl]
              });
              
              if (imgResponse && imgResponse.url) {
                final_image = imgResponse.url;
              } else {
                final_image = unsplashUrl;
              }
            } catch (imgErr) {
              try {
                const fallbackTerm = cat.category;
                final_image = `https://source.unsplash.com/1280x720/?${encodeURIComponent(fallbackTerm)},news`;
              } catch (e) {
                console.error('Image fetch error:', e.message);
              }
            }
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
            image: final_image ? 'success' : 'none',
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