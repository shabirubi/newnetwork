import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Use InvokeLLM with internet context to fetch latest oref.org.il news
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `עבור לאתר פיקוד העורף oref.org.il ושלוף את הידיעות, ההוראות וההתראות האחרונות שמפורסמות שם כרגע.
            
תשלוף מהאתרים הבאים:
1. https://www.oref.org.il/heb
2. https://www.oref.org.il/heb/articles
3. https://www.oref.org.il/heb/guidelines

בנה רשימה של 10-15 ידיעות/הוראות/עדכונים אחרונים מפיקוד העורף.
כל פריט יכלול: כותרת, תוכן/תקציר, קטגוריה (אזהרה/הוראות/עדכון/ביטחון), תאריך אם זמין.
החזר בפורמט JSON בלבד.`,
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
                                content: { type: "string" },
                                category: { type: "string" },
                                date: { type: "string" },
                                url: { type: "string" },
                                is_urgent: { type: "boolean" }
                            }
                        }
                    },
                    last_updated: { type: "string" }
                }
            }
        });

        return Response.json({
            articles: result.articles || [],
            last_updated: result.last_updated || new Date().toISOString(),
            source: "oref.org.il"
        });

    } catch (error) {
        console.error('fetchOrefNews error:', error.message);
        return Response.json({ error: error.message, articles: [] }, { status: 500 });
    }
});