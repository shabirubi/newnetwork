import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Flame, Siren, MessageSquareWarning, Moon, Sun } from "lucide-react";
import ClockWidget from "./ClockWidget";
import WeatherWidget from "./WeatherWidget";
import ChannelSelector from "./ChannelSelector";

export default function NewsTicker({ darkMode, setDarkMode }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    loadBreakingNews();
    
    // Refresh every 2 minutes
    const interval = setInterval(loadBreakingNews, 120000);
    
    // Listen for news updates from AutoNewsUpdater
    const handleNewsUpdate = () => {
      console.log('🔄 NewsTicker מתעדכן עם חדשות חדשות');
      loadBreakingNews();
    };
    window.addEventListener('newsUpdated', handleNewsUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('newsUpdated', handleNewsUpdate);
    };
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
      <div className="bg-black dark:bg-gray-950 text-white py-2 overflow-hidden relative">
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
    <div className="bg-black dark:bg-gray-950 text-white py-2 overflow-hidden relative z-40">
      <div className="flex items-center gap-1 sm:gap-3 px-2 lg:px-4">
        <span className="bg-[#E31E24] text-white px-2 sm:px-3 py-1 sm:py-1.5 font-bold text-[10px] sm:text-xs shrink-0 flex items-center gap-1 sm:gap-1.5 rounded relative z-10">
          <Flame className="w-3 sm:w-3.5 h-3 sm:h-3.5 animate-pulse" />
          <span className="hidden xs:inline">חדשות חמות</span>
          <span className="xs:hidden">חם</span>
        </span>

        <button 
          onClick={() => {
            window.location.href = createPageUrl("Category?cat=breaking");
          }}
          className="ticker-wrapper overflow-hidden flex-1 cursor-pointer hover:opacity-90 transition-opacity min-w-0 relative z-10"
        >
          <motion.div
            className="flex whitespace-nowrap text-[11px] sm:text-sm pointer-events-none"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            {[...news, ...news].map((item, index) => (
              <span key={index} className="mx-4 sm:mx-8">• {item}</span>
            ))}
          </motion.div>
        </button>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0 relative z-[60]">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDarkMode(!darkMode);
            }}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all touch-manipulation relative z-[70]"
          >
            {darkMode ? <Sun size={16} className="sm:w-5 sm:h-5" /> : <Moon size={16} className="sm:w-5 sm:h-5" />}
          </button>

          <div className="hidden sm:block">
            <ClockWidget />
          </div>
          <div className="hidden md:block">
            <WeatherWidget />
          </div>
          <div className="relative z-[70]">
            <ChannelSelector />
          </div>

          <button 
            onClick={() => {
              window.location.href = createPageUrl("WarRoom");
            }}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors"
          >
            <Siren size={13} className="animate-pulse" />
            חדר מלחמה
          </button>

          <button 
            onClick={() => {
              window.location.href = createPageUrl("PublicReports");
            }}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors"
          >
            <MessageSquareWarning size={13} />
            דיווח מפגע
          </button>
        </div>
      </div>
    </div>
  );
}