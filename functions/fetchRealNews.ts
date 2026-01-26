import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Fetch real news from NewsAPI (Hebrew news)
    const newsResponse = await fetch(
      'https://newsapi.org/v2/everything?q=Israel&sortBy=publishedAt&language=en&apiKey=demo'
    );
    
    const newsData = await newsResponse.json();
    const articles = newsData.articles || [];
    
    // Map news to our schema
    const mappedArticles = articles.slice(0, 50).map((article, idx) => {
      const categories = ['breaking', 'security', 'economy', 'politics', 'technology', 'sports', 'entertainment', 'world', 'health'];
      const category = categories[idx % categories.length];
      
      return {
        title: article.title,
        subtitle: article.description,
        content: article.content || article.description,
        category: category,
        source: article.source.name,
        image_url: article.urlToImage,
        is_breaking: idx < 3,
        is_featured: idx < 5
      };
    });
    
    // Bulk create articles
    if (mappedArticles.length > 0) {
      await base44.asServiceRole.entities.NewsArticle.bulkCreate(mappedArticles);
    }
    
    return Response.json({ 
      success: true, 
      count: mappedArticles.length,
      message: `Updated with ${mappedArticles.length} real news articles`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});