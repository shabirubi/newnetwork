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
    <div className="bg-black dark:bg-gray-950 text-white py-2 overflow-hidden relative">
      <div className="flex items-center gap-1 sm:gap-3 px-2 lg:px-4">
        <span className="bg-[#E31E24] text-white px-2 sm:px-3 py-1 sm:py-1.5 font-bold text-[10px] sm:text-xs shrink-0 flex items-center gap-1 sm:gap-1.5 rounded">
          <Flame className="w-3 sm:w-3.5 h-3 sm:h-3.5 animate-pulse" />
          <span className="hidden xs:inline">חדשות חמות</span>
          <span className="xs:hidden">חם</span>
        </span>

        <Link 
          to={createPageUrl("Category?cat=breaking")}
          className="ticker-wrapper overflow-hidden flex-1 cursor-pointer hover:opacity-90 transition-opacity min-w-0"
        >
          <motion.div
            className="flex whitespace-nowrap text-[11px] sm:text-sm"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            {[...news, ...news].map((item, index) => (
              <span key={index} className="mx-4 sm:mx-8">• {item}</span>
            ))}
          </motion.div>
        </Link>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all"
          >
            {darkMode ? <Sun size={12} className="sm:w-3.5 sm:h-3.5" /> : <Moon size={12} className="sm:w-3.5 sm:h-3.5" />}
          </button>

          <div className="hidden sm:block">
            <ClockWidget />
          </div>
          <div className="hidden md:block">
            <WeatherWidget />
          </div>
          <ChannelSelector />

          <Link 
            to={createPageUrl("WarRoom")}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors"
          >
            <Siren size={13} className="animate-pulse" />
            חדר מלחמה
          </Link>

          <Link 
            to={createPageUrl("PublicReports")}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors"
          >
            <MessageSquareWarning size={13} />
            דיווח מפגע
          </Link>
        </div>
      </div>
    </div>
  );
}