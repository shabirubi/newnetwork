import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const NEWS_CATEGORIES = [
  { label: "חדשות חמות", query: "breaking news israel today", videoSearch: false, category: "breaking" },
  { label: "ביטחון", query: "israel security defense IDF today", videoSearch: true, category: "security" },
  { label: "כלכלה", query: "israel economy business today", videoSearch: false, category: "economy" },
  { label: "פוליטיקה", query: "israel politics government today", videoSearch: false, category: "politics" },
  { label: "טכנולוגיה", query: "israel technology startups today", videoSearch: false, category: "technology" },
  { label: "ספורט", query: "israel sports football basketball today", videoSearch: true, category: "sports" },
  { label: "בידור", query: "israel entertainment drama today", videoSearch: false, category: "entertainment" },
  { label: "חדשות עולם", query: "world news international today", videoSearch: false, category: "world" },
  { label: "בריאות", query: "health medical news today", videoSearch: false, category: "health" }
];

export default function AutoNewsUpdater() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const checkAndUpdate = async () => {
      // Get last update time from localStorage
      const lastUpdateTime = localStorage.getItem('newsLastUpdate');
      const now = Date.now();
      
      // If never updated or more than 1 hour passed
      if (!lastUpdateTime || now - parseInt(lastUpdateTime) > 3600000) {
        await updateNews();
      }
      
      setLastUpdate(lastUpdateTime ? new Date(parseInt(lastUpdateTime)) : null);
    };

    checkAndUpdate();

    // Check every 10 minutes if we need to update
    const interval = setInterval(checkAndUpdate, 600000);
    return () => clearInterval(interval);
  }, []);

  const updateNews = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    console.log('🔄 Starting automatic news update...');

    try {
      // Randomly select 3-5 categories to update
      const numCategories = Math.floor(Math.random() * 3) + 3; // 3-5
      const shuffled = [...NEWS_CATEGORIES].sort(() => Math.random() - 0.5);
      const selectedCategories = shuffled.slice(0, numCategories);

      for (const category of selectedCategories) {
        try {
          const articles = await fetchNewsForCategory(category);
          
          if (articles && articles.length > 0) {
            // Add to database
            for (const article of articles) {
              try {
                await base44.entities.NewsArticle.create(article);
              } catch (err) {
                console.log('Article already exists or error:', err.message);
              }
            }
            console.log(`✅ Updated ${articles.length} articles for ${category.label}`);
          }
        } catch (error) {
          console.error(`Error updating ${category.label}:`, error);
        }

        // Small delay between categories
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Update timestamp
      localStorage.setItem('newsLastUpdate', Date.now().toString());
      setLastUpdate(new Date());
      console.log('✅ Automatic news update completed');

    } catch (error) {
      console.error('Error in auto update:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchNewsForCategory = async (category) => {
    try {
      const today = new Date().toLocaleDateString('he-IL');
      
      const prompt = `תן לי 3 כותרות חדשות מהיום (${today}) בנושא: ${category.label}.
      
אני צריך חדשות אמיתיות ומעודכנות מהיום האחרון בלבד.
החזר JSON array עם 3 articles בפורמט הבא:
[{
  "title": "כותרת קצרה ומדויקת",
  "subtitle": "כותרת משנה",
  "content": "תוכן מפורט של הידיעה (2-3 פסקאות)",
  "is_breaking": true/false,
  "is_featured": false
}]

התמקד בחדשות אמיתיות ומעניינות. ללא המצאות.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
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
                  is_breaking: { type: "boolean" },
                  is_featured: { type: "boolean" }
                }
              }
            }
          }
        }
      });

      const articles = result?.articles || [];
      
      // Generate images and add details
      const enrichedArticles = await Promise.all(
        articles.map(async (article) => {
          try {
            const imagePrompt = `News photo for: ${article.title}. Professional journalism photography, high quality, realistic.`;
            const { url: image_url } = await base44.integrations.Core.GenerateImage({
              prompt: imagePrompt
            });

            return {
              ...article,
              category: category.category,
              image_url,
              source: "הרשת החדשה"
            };
          } catch (error) {
            return {
              ...article,
              category: category.category,
              source: "הרשת החדשה"
            };
          }
        })
      );

      return enrichedArticles;
    } catch (error) {
      console.error(`Error fetching news for ${category.label}:`, error);
      return [];
    }
  };

  // This component doesn't render anything visible
  return null;
}