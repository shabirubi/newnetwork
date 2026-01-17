import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch world news from multiple sources
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `חפש את הידיעות החמות ביותר כרגע בעולם מ BBC, CNN, Reuters, Al Jazeera, Guardian ועוד. תן לי 15-20 ידיעות שונות בעברית על:
- פוליטיקה בינלאומית
- כלכלה עולמית  
- מאורעות חמים בעולם
- טכנולוגיה
- ספורט

לכל ידיעה תן בדיוק: title (בעברית), description (בעברית, 1-2 משפטים), category, source (שם הרשת).`,
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
                description: { type: "string" },
                category: { type: "string" },
                source: { type: "string" }
              },
              required: ["title", "description"]
            }
          }
        },
        required: ["articles"]
      }
    });

    const articles = Array.isArray(response?.articles) ? response.articles : [];
    
    return Response.json({
      articles: articles.map(a => ({
        title: a.title || 'חדשה ללא כותרת',
        description: a.description || '',
        category: a.category || 'world',
        source: a.source || 'עיתון בינלאומי'
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching world news:', error);
    return Response.json({ 
      error: error.message,
      articles: []
    }, { status: 500 });
  }
});