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

    const { batch = 0 } = await req.json().catch(() => ({}));
    
    const results = [];
    
    // מעבד 3 קטגוריות בכל קריאה
    const batchSize = 3;
    const startIdx = batch * batchSize;
    const categoriesToProcess = categories.slice(startIdx, startIdx + batchSize);
    
    for (const cat of categoriesToProcess) {
      try {
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
                        prompt: `חפש ${cat.count} כתבות חדשות אמיתיות מהיום בנושא: ${cat.query}.
                        חשוב: החזר את כל הטקסט בעברית בלבד! לא אנגלית!
                        החזר JSON עם מערך articles. כל כתבה צריכה להכיל:
                        - title: כותרת בעברית (קצרה ומעניינת)
                        - subtitle: כותרת משנה בעברית 
                        - content: תוכן בעברית (3 פסקאות)
                        - source: מקור בעברית

                        דוגמה:
                        {
                          "articles": [
                            {
                              "title": "כותרת בעברית",
                              "subtitle": "כותרת משנה",
                              "content": "תוכן...",
                              "source": "וואלה"
                            }
                          ]
                        }`,
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
            const hebrewTitle = article.title || '';
            const hebrewSubtitle = article.subtitle || '';
            const hebrewContent = article.content || '';

            // יצירת תמונה מותאמת לתוכן הכתבה
            let imageUrl = '';
            try {
              console.log(`Generating image for: ${hebrewTitle}`);
              const imageResponse = await base44.asServiceRole.integrations.Core.GenerateImage({
                prompt: `Professional news photo representing: "${hebrewTitle}". ${hebrewSubtitle}. High quality photojournalism style, realistic, dramatic lighting, modern composition. No text overlay, no Hebrew letters, just visual representation of the news story.`
              });
              imageUrl = imageResponse.url || '';
              console.log(`Image created: ${imageUrl}`);
            } catch (imgErr) {
              console.log('Image generation error:', imgErr.message);
            }

            await base44.asServiceRole.entities.NewsArticle.create({
              title: hebrewTitle,
              subtitle: hebrewSubtitle,
              content: hebrewContent,
              image_url: imageUrl,
              category: cat.category,
              source: article.source || 'חדשות',
              is_breaking: cat.category === 'breaking',
              is_featured: Math.random() > 0.7
            });
            created++;
            console.log(`Article created: ${hebrewTitle}`);
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