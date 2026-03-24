import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const newsData = [
      { title: "חדשות ביטחון: פעולה צבאית משמעותית בשטח", category: "security", subtitle: "כוחות ביטחוניים בפעולה", content: "כוחות הביטחון פעלו בפעולה משמעותית שלל נגד איומים בטחוניים." },
      { title: "כלכלה: שוקי המניות עלו בחדות", category: "economy", subtitle: "שוק ההון משגשג", content: "בורסת תל אביב רשמה עלייה משמעותית בעקבות חדשות כלכליות חיוביות." },
      { title: "טכנולוגיה: סטארטאפ ישראלי זכה בתחרות בינלאומיות", category: "technology", subtitle: "הצלחה ישראלית", content: "חברת טכנולוגיה ישראלית זכתה בפרס בינלאומי על פיתוח טכנולוגיה חדשנית." },
      { title: "פלילים: משטרה עצרה חשודים בפרצות", category: "crime", subtitle: "חקירה משטרתית", content: "המשטרה עצרה חשודים בסדרת פרצות בערים שונות." },
      { title: "פוליטיקה: הכנסת אישרה חוק חדש", category: "politics", subtitle: "תיקון משפטי", content: "הכנסת אישרה קריאה שלישית לחוק חדש לשינוי המערכת המדינית." },
      { title: "ספורט: נבחרת ישראל ניצחה במשחק כדורגל", category: "sports", subtitle: "זכייה בליגה", content: "נבחרת ישראל בכדורגל ניצחה בניצחון משכנע במשחק זה." },
      { title: "בידור: סדרת ישראלית זכתה בפרס בינלאומי", category: "entertainment", subtitle: "הצלחה תרבותית", content: "סדרה ישראלית קיבלה הכרה בינלאומית על איכות הייצור שלה." },
      { title: "עולם: מתח בינלאומי בחזית הנילוס", category: "world", subtitle: "התפתחויות גיאופוליטיות", content: "מתחים בינלאומיים על שימוש במי הנילוס בין מדינות אפריקאיות." },
      { title: "בריאות: חדשה על טיפול חדש בסוכרת", category: "health", subtitle: "התקדמות רפואית", content: "חוקרים פיתחו טיפול חדש לחולי סוכרת עם זו הצלחה גבוהה." },
      { title: "חדשות ישראל: צפיפות אוכלוסיה עולה בערים", category: "israel", subtitle: "מזג אוויר בישראל", content: "נתונים סטטיסטיים מראים עלייה בצפיפות האוכלוסיה בערים הגדולות." }
    ];

    for (const news of newsData) {
      try {
        // Generate image for each article - only English text
        const imagePrompt = `Professional news article image about ${news.category}. Style: modern, professional, clean. No text or Hebrew characters. High quality, 16:9 aspect ratio. Relevant to news and current events.`;
        
        const imageResponse = await base44.integrations.Core.GenerateImage({
          prompt: imagePrompt
        });

        const imageUrl = imageResponse?.url;

        // Create article with generated image
        await base44.asServiceRole.entities.NewsArticle.create({
          title: news.title,
          subtitle: news.subtitle,
          content: news.content,
          category: news.category,
          image_url: imageUrl,
          is_breaking: news.category === "security" || news.category === "crime",
          is_featured: false,
          source: "newsroom"
        });

        console.log(`✅ Created: ${news.title}`);
      } catch (err) {
        console.error(`⚠️ Error creating ${news.title}:`, err.message);
      }
    }

    return Response.json({ 
      success: true, 
      message: `יצרתי ${newsData.length} כתבות עם תמונות AI`
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});