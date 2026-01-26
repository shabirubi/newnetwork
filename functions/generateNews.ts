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
          
          // יצור תמונה עם טקסט משולב - עברית בכותרת ואנגלית בתמונה
          if (article.title) {
            const topic = article.image_topic || article.title;
            const shortText = topic.length > 35 ? topic.substring(0, 35) + "..." : topic;
            
            try {
              const imagePrompt = `Professional news article thumbnail image. Bold English text: "${shortText}" centered. Topic: ${topic}. Modern design, high contrast, journalism style, vibrant colors. 16:9 aspect.`;
              
              const imgResponse = await base44.asServiceRole.integrations.Core.GenerateImage({
                prompt: imagePrompt
              });
              
              if (imgResponse && imgResponse.url) {
                final_image = imgResponse.url;
              }
            } catch (imgErr) {
              console.log(`Generating backup image for: ${topic}`);
              try {
                const backupPrompt = `News article image for: ${topic}. Professional, modern, high quality.`;
                const backupImg = await base44.asServiceRole.integrations.Core.GenerateImage({
                  prompt: backupPrompt
                });
                if (backupImg && backupImg.url) {
                  final_image = backupImg.url;
                }
              } catch (e) {
                console.error(`Both image generations failed for ${article.title}`);
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
            image: final_image ? 'generated' : 'none',
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