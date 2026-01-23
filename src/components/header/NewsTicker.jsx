import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Flame, Siren, MessageSquareWarning, Moon, Sun, TrendingUp, TrendingDown, DollarSign, Euro, Menu, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ClockWidget from "./ClockWidget";
import WeatherWidget from "./WeatherWidget";
import ChannelSelector from "./ChannelSelector";


export default function NewsTicker({ darkMode, setDarkMode, onMenuClick }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    loadBreakingNews();
    fetchCurrencyRates();
    
    // Refresh news every 5 minutes
    const newsInterval = setInterval(loadBreakingNews, 300000);
    
    // Listen for news updates from AutoNewsUpdater
    const handleNewsUpdate = () => {
      console.log('🔄 NewsTicker מתעדכן עם חדשות חדשות');
      loadBreakingNews();
    };
    
    window.addEventListener('newsUpdated', handleNewsUpdate);
    
    return () => {
      clearInterval(newsInterval);
      window.removeEventListener('newsUpdated', handleNewsUpdate);
    };
  }, []);

  const fetchCurrencyRates = async () => {
    // Static currency data to save API credits
    setCurrencies([
      { code: "USD", name: "דולר", rate: 3.65, changePercent: 0.45 },
      { code: "EUR", name: "יורו", rate: 3.98, changePercent: -0.23 },
      { code: "GBP", name: "לירה", rate: 4.52, changePercent: 0.12 },
      { code: "BTC", name: "ביטקוין", rate: 365000, changePercent: 2.15 }
    ]);
  };

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

      // Fallback news only
      setNews([
        "מעקב חי: התפתחויות בזירה הביטחונית",
        "הבורסה בתל אביב עם מגמה חיובית",
        "ישיבת ממשלה מיוחדת היום בירושלים",
        "תחזית מזג אוויר: גל חום בסוף השבוע"
      ]);
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
      <div className="bg-gradient-to-br from-black/80 via-[#E31E24]/60 to-black/80 backdrop-blur-sm border-b-2 border-[#E31E24]/40 text-white py-2 overflow-hidden relative">
        <div className="flex items-center">
          <span className="bg-black/40 text-white px-4 py-1 font-bold text-sm shrink-0 mr-4 flex items-center gap-2">
            <Flame className="w-4 h-4" />
            טוען חדשות...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-black/80 via-[#E31E24]/60 to-black/80 backdrop-blur-sm border-b-2 border-[#E31E24]/40 text-white overflow-hidden relative z-[35] w-full">
      {/* Breaking News Strip */}
      <div className="flex items-center gap-1 sm:gap-3 px-0 py-2 w-full">
        {/* Menu Button - Right Side */}
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg hover:bg-white/20 text-[#E31E24] active:scale-95 transition-all touch-manipulation relative z-[70] group shrink-0"
          title="תפריט"
        >
          <div className="flex flex-col gap-1.5">
            <div className="w-5 h-0.5 bg-[#E31E24] rounded-full group-hover:w-6 transition-all"></div>
            <div className="w-5 h-0.5 bg-[#E31E24] rounded-full group-hover:w-6 transition-all"></div>
            <div className="w-5 h-0.5 bg-[#E31E24] rounded-full group-hover:w-6 transition-all"></div>
          </div>
        </button>

        {/* Broadcast Strip */}
        <div className="overflow-hidden w-40 sm:w-56 md:w-80 shrink-0">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
            <span className="font-bold text-sm sm:text-base md:text-lg text-white">
              מהדורת החדשות בשידור חי - כל יום בשעה 21:00 • עדכוני חדשות 24/7 • הרשת החדשה • 
            </span>
            <span className="font-bold text-sm sm:text-base md:text-lg text-white">
              מהדורת החדשות בשידור חי - כל יום בשעה 21:00 • עדכוני חדשות 24/7 • הרשת החדשה • 
            </span>
          </motion.div>
        </div>

        <button 
          onClick={() => {
            window.location.href = createPageUrl("Category?cat=breaking");
          }}
          className="ticker-wrapper overflow-hidden flex-1 cursor-pointer hover:opacity-90 transition-opacity min-w-0 relative z-10"
        >
          <TickerContent news={news} currencies={currencies} />
        </button>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0 relative z-[60]">
          {/* Currency Strip next to other buttons */}
          {currencies.length > 0 && (
            <div className="flex items-center gap-1 sm:gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-red-900/30">
              {currencies.slice(0, 2).map((currency, idx) => (
                <motion.div
                  key={`sidebar-currency-${idx}`}
                  className="flex items-center gap-1"
                  animate={{
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: idx * 0.3
                  }}
                >
                  {currency.code === 'USD' && <DollarSign className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#E31E24]" />}
                  {currency.code === 'EUR' && <Euro className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#E31E24]" />}
                  {currency.code === 'BTC' && <span className="text-[#E31E24] font-bold text-[10px] sm:text-xs">₿</span>}
                  {currency.code === 'GBP' && <span className="text-[#E31E24] font-bold text-[10px] sm:text-xs">£</span>}
                  <span className="text-white font-bold text-[10px] sm:text-xs hidden xs:inline">{currency.name}</span>
                  <span className="text-red-400 font-bold text-[10px] sm:text-xs">
                    ₪{currency.code === 'BTC' ? (currency.rate || 0).toFixed(0) : (currency.rate || 0).toFixed(2)}
                  </span>
                  <span className={`font-bold text-[9px] sm:text-[10px] ${(currency.changePercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(currency.changePercent || 0) >= 0 ? '▲' : '▼'}{Math.abs(currency.changePercent || 0).toFixed(2)}%
                  </span>
                </motion.div>
              ))}
            </div>
          )}

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

function TickerContent({ news, currencies }) {
  const { data: articles = [] } = useQuery({
    queryKey: ['breaking-news-ticker'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return [];
        return base44.entities.NewsArticle.list('-created_date', 10);
      } catch {
        return [];
      }
    },
    refetchInterval: 120000,
    initialData: []
  });

  const updates = articles.map(article => ({
    title: article.title,
    id: article.id,
    time: new Date(article.created_date).toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }));

  return (
    <motion.div
      className="flex whitespace-nowrap text-base sm:text-lg pointer-events-none items-center font-bold"
      animate={{ x: `-${(news.length * 300 + currencies.length * 250 + updates.length * 350)}px` }}
      transition={{ duration: (news.length + currencies.length + updates.length) * 3, repeat: Infinity, ease: "linear" }}
    >
      {[...news, ...news].map((item, index) => {
        const colors = ['text-[#E31E24]', 'text-yellow-400', 'text-white', 'text-blue-400', 'text-red-400'];
        const colorClass = colors[index % colors.length];
        return (
          <span 
            key={`news-${index}`} 
            className={`mx-6 sm:mx-10 ${colorClass} font-bold`}
          >
            • {item}
          </span>
        );
      })}
      {currencies.length > 0 && [...currencies, ...currencies].map((currency, index) => (
        <motion.span 
          key={`currency-${index}`} 
          className="mx-6 sm:mx-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-sm"
          animate={{
            background: [
              'linear-gradient(to right, rgba(0, 0, 0, 0.6), rgba(227, 31, 36, 0.4))',
              'linear-gradient(to right, rgba(227, 31, 36, 0.5), rgba(0, 0, 0, 0.7))',
              'linear-gradient(to right, rgba(0, 0, 0, 0.6), rgba(227, 31, 36, 0.4))'
            ],
            boxShadow: [
              '0 0 10px rgba(227, 31, 36, 0.3)',
              '0 0 20px rgba(227, 31, 36, 0.5)',
              '0 0 10px rgba(227, 31, 36, 0.3)'
            ],
            scale: [1, 1.03, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.2
          }}
          style={{
            border: '1px solid rgba(227, 31, 36, 0.4)'
          }}
        >
          {currency.code === 'USD' && <DollarSign className="w-4 h-4 text-[#E31E24] animate-pulse" />}
          {currency.code === 'EUR' && <Euro className="w-4 h-4 text-[#E31E24] animate-pulse" />}
          {currency.code === 'BTC' && <span className="text-[#E31E24] font-bold text-sm animate-pulse">₿</span>}
          {currency.code === 'GBP' && <span className="text-[#E31E24] font-bold text-sm animate-pulse">£</span>}
          <span className="font-bold text-white text-sm">{currency.name}</span>
          <span className="text-red-400 font-bold text-sm">
            ₪{currency.code === 'BTC' ? (currency.rate || 0).toFixed(0) : (currency.rate || 0).toFixed(2)}
          </span>
          <motion.span 
            className={`font-bold text-xs ${(currency.changePercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}
            animate={{
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {(currency.changePercent || 0) >= 0 ? '▲' : '▼'}{Math.abs(currency.changePercent || 0).toFixed(2)}%
          </motion.span>
        </motion.span>
      ))}
      {[...updates, ...updates].map((update, idx) => (
        <span 
          key={`update-${idx}`}
          className="mx-6 sm:mx-10 flex items-center gap-2 text-sm"
        >
          <span className="text-[#E31E24] font-bold">•</span>
          <span className="text-white font-medium">{update.title}</span>
          <span className="text-gray-400 text-xs flex items-center gap-1">
            <Clock size={12} />
            {update.time}
          </span>
        </span>
      ))}
    </motion.div>
  );
}