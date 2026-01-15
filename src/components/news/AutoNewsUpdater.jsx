import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const NEWS_CATEGORIES = [
  { label: "חדשות חמות", query: "breaking news israel today", videoSearch: false, category: "breaking" },
  { label: "ביטחון", query: "israel security defense IDF today", videoSearch: true, category: "security" },
  { label: "כלכלה", query: "israel economy business today", videoSearch: false, category: "economy" },
  { label: "שוק ההון", query: "israel stock market tel aviv exchange shares today", videoSearch: false, category: "finance" },
  { label: "פיננסים והשקעות", query: "israel finance banking investment funds today", videoSearch: false, category: "finance" },
  { label: "נדל\"ן ודיור", query: "israel real estate housing property prices today", videoSearch: false, category: "economy" },
  { label: "פוליטיקה", query: "israel politics government today", videoSearch: false, category: "politics" },
  { label: "טכנולוגיה", query: "israel technology startups today", videoSearch: false, category: "technology" },
  { label: "הייטק וחדשנות", query: "israel tech innovation AI cyber startups today", videoSearch: false, category: "technology" },
  { label: "ספורט", query: "israel sports football basketball today", videoSearch: true, category: "sports" },
  { label: "ספורט עולמי", query: "world sports champions league premier league NBA today", videoSearch: true, category: "sports" },
  { label: "בידור ורכילות", query: "israel entertainment celebrities gossip scandals today", videoSearch: false, category: "entertainment" },
  { label: "דרמות וסדרות", query: "israel tv series drama shows today", videoSearch: false, category: "entertainment" },
  { label: "מוזיקה ישראלית", query: "israel music songs singers albums charts today", videoSearch: true, category: "music" },
  { label: "קולנוע ותרבות", query: "israel cinema movies culture events today", videoSearch: false, category: "entertainment" },
  { label: "רכילות סלבריטאים", query: "israel celebrities gossip rumors relationships scandals", videoSearch: false, category: "entertainment" },
  { label: "אופנה וסגנון", query: "israel fashion style beauty trends today", videoSearch: false, category: "entertainment" },
  { label: "חדשות עולם", query: "world news international today", videoSearch: false, category: "world" },
  { label: "בריאות", query: "health medical news today", videoSearch: false, category: "health" },
  { label: "תזונה ותרופות", query: "nutrition diet supplements medicine health today", videoSearch: false, category: "health" },
  { label: "משפט ופלילים", query: "israel crime law court police justice today", videoSearch: false, category: "breaking" },
  { label: "חינוך והורות", query: "israel education parenting schools children today", videoSearch: false, category: "world" },
  { label: "מזלות", query: "horoscope astrology zodiac daily predictions", videoSearch: false, category: "horoscope" },
  { label: "טיולים ותיירות", query: "israel travel tourism destinations trips today", videoSearch: false, category: "world" },
  { label: "אוכל ומסעדות", query: "israel food restaurants culinary cooking today", videoSearch: false, category: "entertainment" }
];

export default function AutoNewsUpdater() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newArticles, setNewArticles] = useState([]);

  useEffect(() => {
    const checkAndUpdate = async () => {
      const lastUpdateTime = localStorage.getItem('newsLastUpdate');
      const now = Date.now();
      
      // Update immediately on first load, then every 30 minutes
      if (!lastUpdateTime || now - parseInt(lastUpdateTime) > 1800000) {
        await updateNews();
      }
    };

    // Run immediately on mount
    checkAndUpdate();

    // Check every 30 minutes
    const interval = setInterval(checkAndUpdate, 1800000);
    return () => clearInterval(interval);
  }, []);

  // Show notification for new articles on mobile
  useEffect(() => {
    if (newArticles.length > 0 && window.innerWidth <= 768) {
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 9999; background: linear-gradient(135deg, #E31E24 0%, #B91C1C 100%); color: white; padding: 12px 24px; border-radius: 12px; box-shadow: 0 8px 32px rgba(227, 30, 36, 0.4); animation: slideDown 0.5s ease-out; font-weight: bold; text-align: center; min-width: 280px;">
          <div style="display: flex; align-items: center; gap: 8px; justify-content: center;">
            <span style="font-size: 20px;">🔥</span>
            <span>${newArticles.length} חדשות חדשות!</span>
          </div>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.animation = 'slideUp 0.5s ease-out';
        setTimeout(() => notification.remove(), 500);
      }, 4000);
      
      setNewArticles([]);
    }
  }, [newArticles]);

  const updateNews = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    console.log('🔄 עדכון אוטומטי של חדשות מתחיל...');

    try {
      const numCategories = Math.floor(Math.random() * 6) + 8; // 8-13 קטגוריות
      const shuffled = [...NEWS_CATEGORIES].sort(() => Math.random() - 0.5);
      const selectedCategories = shuffled.slice(0, numCategories);
      
      const allNewArticles = [];

      for (const category of selectedCategories) {
        try {
          const articles = await fetchNewsForCategory(category);
          
          if (articles && articles.length > 0) {
            for (const article of articles) {
              try {
                await base44.entities.NewsArticle.create(article);
                allNewArticles.push(article);
              } catch (err) {
                console.log('Article exists:', err.message);
              }
            }
            console.log(`✅ ${articles.length} ידיעות חדשות - ${category.label}`);
          }
        } catch (error) {
          console.error(`שגיאה ב-${category.label}:`, error);
        }

        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      localStorage.setItem('newsLastUpdate', Date.now().toString());
      setNewArticles(allNewArticles);
      
      // Trigger refresh for NewsTicker
      window.dispatchEvent(new CustomEvent('newsUpdated'));
      
      console.log(`✅ ${allNewArticles.length} חדשות חדשות נוספו!`);

    } catch (error) {
      console.error('Error in auto update:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchNewsForCategory = async (category) => {
    try {
      const now = new Date();
      const currentDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
      const currentTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const prompt = `CRITICAL: התאריך היום הוא 7 בינואר 2026 (07/01/2026) והשעה ${currentTime}.

תן לי 4 כותרות חדשות אמיתיות מהיום 07/01/2026 בנושא: ${category.label}.

חשוב מאוד:
- חדשות מהיום 7 בינואר 2026 בלבד - לא מ-2025 ולא מתאריכים ישנים
- חפש חדשות שפורסמו ב-24 השעות האחרונות (7.1.2026)
- אם זה קטגוריית רכילות/בידור - סיפורים דרמטיים על סלבריטאים מהיום
- אם זה שוק הון/נדל"ן - נתונים כלכליים מהיום 7.1.2026
- וודא שכל הידיעות מתייחסות לאירועים של 2026 ולא 2025

החזר JSON array עם 4 articles:
[{
  "title": "כותרת קצרה ומדויקת",
  "subtitle": "כותרת משנה",
  "content": "תוכן מפורט של הידיעה (2-3 פסקאות)",
  "is_breaking": true/false,
  "is_featured": false
}]

חדשות אמיתיות מ-7.1.2026 בלבד!`;

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

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -100%); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes slideUp {
          from { opacity: 1; transform: translate(-50%, 0); }
          to { opacity: 0; transform: translate(-50%, -100%); }
        }
      `}</style>
    </>
  );
}