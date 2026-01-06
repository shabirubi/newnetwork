import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export default function NewsTicker() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBreakingNews();
    const interval = setInterval(loadBreakingNews, 120000); // Update every 2 minutes
    return () => clearInterval(interval);
  }, []);

  const loadBreakingNews = async () => {
    try {
      // Try to get from database first
      const dbNews = await base44.entities.NewsArticle.filter(
        { is_breaking: true },
        '-created_date',
        10
      );

      if (dbNews && dbNews.length > 0) {
        setNews(dbNews.map(item => item.title));
        setLoading(false);
        return;
      }

      // If no news in DB, fetch from live sources
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `תן לי 5 כותרות חדשות חמות מישראל מהיום (${new Date().toLocaleDateString('he-IL')}). 
        רק כותרות קצרות ומדויקות, ללא מספור, כל כותרת בשורה נפרדת.
        התמקד בחדשות אמיתיות ומעניינות מהיממה האחרונה: ביטחון, כלכלה, פוליטיקה, ספורט.
        החזר רק את הכותרות, ללא הסבר נוסף.`,
        add_context_from_internet: true
      });

      if (result) {
        const headlines = result.split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/^[-•*]\s*/, '').trim())
          .slice(0, 5);
        
        setNews(headlines);
      }
    } catch (error) {
      console.error('Error loading news:', error);
      // Fallback news
      setNews([
        "מעקב חי: התפתחויות בזירה הביטחונית",
        "הבורסה בתל אביב עם מגמה חיובית",
        "ישיבת ממשלה מיוחדת היום בירושלים",
        "תחזית מזג אוויר: גל חום בסוף השבוע"
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || news.length === 0) {
    return (
      <div className="bg-[#E31E24] dark:bg-[#B91C1C] text-white py-2 overflow-hidden">
        <div className="flex items-center">
          <span className="bg-black text-white px-4 py-1 font-bold text-sm shrink-0 mr-4 flex items-center gap-2">
            <Flame className="w-4 h-4" />
            טוען חדשות...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#E31E24] dark:bg-[#B91C1C] text-white py-2 overflow-hidden">
      <div className="flex items-center">
        <span className="bg-black text-white px-4 py-1 font-bold text-sm shrink-0 mr-4 flex items-center gap-2">
          <Flame className="w-4 h-4 animate-pulse" />
          חדשות חמות
        </span>
        <div className="ticker-wrapper overflow-hidden flex-1">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            {[...news, ...news].map((item, index) => (
              <span key={index} className="mx-8">• {item}</span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}