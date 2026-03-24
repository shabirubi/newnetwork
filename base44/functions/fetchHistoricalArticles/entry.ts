import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sourceId, query = "", limit = 20 } = body;

    // Fetch source details
    const source = await base44.asServiceRole.entities.HistoricalSource.read(sourceId);
    
    if (!source) {
      return Response.json({ error: 'Source not found' }, { status: 404 });
    }

    // Mock historical articles - in production, integrate with actual archive APIs
    // For Israel State Archives, this would connect to their API
    const mockArticles = [
      {
        title: "הקמת מדינת ישראל",
        content: "ב-14 במאי 1948 הוקמה מדינת ישראל",
        year: 1948,
        source: source.name,
        description: "הצהרת העצמאות של מדינת ישראל"
      },
      {
        title: "מלחמת השחרור",
        content: "בנובמבר 1947 הצביעה האו\"ם על חלוקת ארץ ישראל",
        year: 1947,
        source: source.name,
        description: "תקופת המאבק לעצמאות"
      },
      {
        title: "הירדן נחצתה",
        content: "כוחות ישראליים חצו את נהר הירדן",
        year: 1967,
        source: source.name,
        description: "מלחמת השישה ימים"
      }
    ];

    // Filter by query if provided
    const filtered = query 
      ? mockArticles.filter(a => 
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.content.toLowerCase().includes(query.toLowerCase())
        )
      : mockArticles;

    return Response.json({ 
      data: filtered.slice(0, limit) 
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});