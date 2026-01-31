import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get real security news from database
    let articles = await base44.asServiceRole.entities.NewsArticle.filter(
      { 
        category: 'security',
        is_breaking: true
      },
      '-created_date',
      20
    );

    // If no articles, use sample data
    if (!articles || articles.length === 0) {
      articles = [
        {
          id: 'sample1',
          title: 'אזעקת רקטות בעוטף',
          subtitle: 'צפון, קיבוץ בעוטף עזה',
          content: 'דיווח על שני פיצוצים בעוטף עזה לאחר אזעקה שהושמעה בשטחי ישראל',
          category: 'security',
          is_breaking: true,
          created_date: new Date().toISOString(),
          image_url: 'https://images.unsplash.com/photo-1579033100900-cb5520f64fcc?w=400&h=300&fit=crop'
        },
        {
          id: 'sample2',
          title: 'התנועה לביטחון בדרום',
          subtitle: 'אשקלון, מרכז העיר',
          content: 'תהליך סגירה חירום של מוקדים ציבוריים בתחנות האוטובוסים',
          category: 'security',
          is_breaking: true,
          created_date: new Date(Date.now() - 5*60000).toISOString(),
          image_url: 'https://images.unsplash.com/photo-1578778712661-7a82dccc0e6b?w=400&h=300&fit=crop'
        },
        {
          id: 'sample3',
          title: 'דיווחים על התנגשויות בירושלים',
          subtitle: 'ירושלים, רובע עתיק',
          content: 'גדודי כיבוי אש מגיעים לאזור המוקד לאחר דיווחים על חדירה',
          category: 'security',
          is_breaking: false,
          created_date: new Date(Date.now() - 15*60000).toISOString(),
          image_url: 'https://images.unsplash.com/photo-1580532154208-d2dccff24fcc?w=400&h=300&fit=crop'
        },
        {
          id: 'sample4',
          title: 'נחיל של כטבי"ם מעל ישראל',
          subtitle: 'חרמון, גולן',
          content: 'צבא ההגנה ישראל מדווח על כטבי"ם שחדרו לשטח ישראל ממערב',
          category: 'security',
          is_breaking: true,
          created_date: new Date(Date.now() - 2*60000).toISOString(),
          image_url: 'https://images.unsplash.com/photo-1578482446554-0626e7fa5d78?w=400&h=300&fit=crop'
        }
      ];
    }

    // Transform articles into alerts
    const alerts = articles.map((article, index) => {
      const typeMap = {
        'רקטה': 'rocket',
        'חדירה': 'infiltration',
        'כטב"מ': 'drone',
        'אזעקה': 'rocket',
        'פיצוץ': 'rocket',
        'שריפה': 'fire',
        'הצפה': 'flood'
      };

      let type = 'rocket';
      for (const [keyword, alertType] of Object.entries(typeMap)) {
        if (article.title.includes(keyword) || article.subtitle.includes(keyword)) {
          type = alertType;
          break;
        }
      }

      const severityMap = ['critical', 'high', 'medium', 'low'];
      const severity = article.is_breaking ? 'critical' : severityMap[index % 4];

      return {
        id: article.id,
        type,
        title: article.title,
        location: article.subtitle || 'אזור בישראל',
        time: new Date(article.created_date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        severity,
        status: article.is_breaking ? 'active' : 'resolved',
        content: article.content,
        image: article.image_url
      };
    });

    // Get total stats
    const allSecurityNews = await base44.asServiceRole.entities.NewsArticle.filter(
      { category: 'security' },
      '-created_date',
      1000
    );

    const stats = {
      activeAlerts: alerts.filter(a => a.status === 'active').length,
      threatenedAreas: Math.ceil(alerts.length / 2),
      resolvedEvents: allSecurityNews.length,
      citiesAffected: new Set(alerts.map(a => a.location)).size
    };

    return Response.json({
      alerts: alerts.slice(0, 15),
      stats,
      lastUpdate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Fetch alerts error:', error);
    return Response.json({ 
      alerts: [],
      stats: {
        activeAlerts: 0,
        threatenedAreas: 0,
        resolvedEvents: 0,
        citiesAffected: 0
      },
      error: error.message 
    }, { status: 500 });
  }
});