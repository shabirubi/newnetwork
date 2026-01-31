import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get ONLY real security and politics news from database
    const articles = await base44.asServiceRole.entities.NewsArticle.filter(
      { category: { $in: ['security', 'politics'] } },
      '-created_date',
      50
    ).catch(() => []);

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