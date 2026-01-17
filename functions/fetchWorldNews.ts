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
      prompt: `עבור את הידיעות החמות ביותר כרגע בעולם. חפש ידיעות מ:
      - BBC
      - CNN
      - Fox News
      - Reuters
      - Associated Press
      - The Guardian
      - The New York Times
      - Sky News
      - France 24
      - Al Jazeera
      
      תחזור עם מיני 15-20 ידיעות חדשות וחשמוניות מהעולם כמו:
      - אירועי פוליטיקה בינלאומית
      - בעיות כלכליות גלובליות
      - מאורעות בעולם
      - חדשות טכנולוגיה בינלאומית
      - חדשות ספורט עולמיות
      
      לכל ידיעה, תן:
      - כותרת (בעברית)
      - תיאור קצר (בעברית)
      - קטגוריה
      - מקור (הרשת החדשות)`,
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
              }
            }
          }
        }
      }
    });

    return Response.json({
      articles: response.articles || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ 
      error: error.message,
      articles: []
    }, { status: 500 });
  }
});