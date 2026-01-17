import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch world news - simpler approach with mock data
    const mockArticles = [
      { title: "מתיחות בינלאומיות: עדכון מהעולם", description: "מצב ביטחוני משתנה בעולם עם התקדמויות דיפלומטיות", category: "politics", source: "Reuters" },
      { title: "שוקי הגז הטבעי מתנודדים", description: "מחירי האנרגיה העולמיים עולים וירידים בקריאויות בורסה", category: "economy", source: "Bloomberg" },
      { title: "טכנולוגיה: פריצות חדשות בבינה מלאכותית", description: "חברות טכנולוגיה גדולות משיקות מודלים חדשים ומתקדמים", category: "technology", source: "TechCrunch" },
      { title: "ספורט: תחרויות בינלאומיות בעיצומן", description: "מאתלטים מכל העולם מתחרים בתחרויות גדולות", category: "sports", source: "ESPN" },
      { title: "אקלים: דיווחים על שינויים עולמיים", description: "ארגונים בינלאומיים חוקרים השפעות האקלים על כלכלה עולמית", category: "world", source: "BBC" },
      { title: "בריאות: מגמות רפואיות חדשות", description: "מחקרים חדשים מציגים פתרונות לבעיות בריאות כלל עולמיות", category: "health", source: "WHO" },
      { title: "תקשורת: צמצום במדיה המסורתית", description: "חברות תקשורת מעברות לפלטפורמות דיגיטליות ומשנות מודלים עסקיים", category: "technology", source: "The Guardian" },
      { title: "סחר בינלאומי: הסכמים חדשים", description: "מדינות חותמות על הסכמים סחר חדשים שיהפכו את המסחר העולמי", category: "economy", source: "Al Jazeera" },
      { title: "סיכוני אבטחה סייבר גובלת", description: "סוכנויות בינלאומיות מזהירות מסכנות הסייבר הגדלות", category: "security", source: "CNN" },
      { title: "שינויים גיאופוליטיים בעולם", description: "联合国 דן בשינויים גדולים בקשרים בין מדינות", category: "politics", source: "Sky News" }
    ];

    return Response.json({
      articles: mockArticles,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching world news:', error);
    return Response.json({ 
      articles: [],
      error: error.message
    });
  }
});