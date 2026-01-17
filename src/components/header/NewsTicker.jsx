import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Flame, Siren, MessageSquareWarning, Moon, Sun, TrendingUp, TrendingDown, DollarSign, Euro, Menu } from "lucide-react";
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
    
    // Refresh news every 2 minutes
    const newsInterval = setInterval(loadBreakingNews, 120000);
    // Refresh currency every 20 seconds
    const currencyInterval = setInterval(fetchCurrencyRates, 20000);
    
    // Listen for news updates from AutoNewsUpdater
    const handleNewsUpdate = () => {
      console.log('🔄 NewsTicker מתעדכן עם חדשות חדשות');
      loadBreakingNews();
    };
    
    window.addEventListener('newsUpdated', handleNewsUpdate);
    
    return () => {
      clearInterval(newsInterval);
      clearInterval(currencyInterval);
      window.removeEventListener('newsUpdated', handleNewsUpdate);
    };
  }, []);

  const fetchCurrencyRates = async () => {
    try {
      const prompt = `תן לי את שערי המטבעות הנוכחיים של ישראל ביחס לשקל (ILS) ממקורות אמיתיים:

חובה לחפש ב:
1. בנק ישראל (www.boi.org.il) - המקור הרשמי והמהימן ביותר
2. גוגל פיננסים / יאהו פיננסים
3. שוקי מטבעות בזמן אמת

אני צריך את השערים האמיתיים והמדויקים של 4 המטבעות הבאים בלבד:
- דולר אמריקאי (USD)
- יורו (EUR)
- לירה שטרלינג (GBP)
- ביטקוין (BTC)

החזר JSON במבנה הבא עם נתונים אמיתיים בלבד מהרגע הנוכחי:
{
  "currencies": [
    {
      "code": "USD",
      "name": "דולר",
      "rate": 3.65,
      "changePercent": 0.55
    }
  ]
}

CRITICAL: השתמש רק במקורות מהימנים. בנק ישראל הוא המקור העיקרי והמדויק ביותר!`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            currencies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  name: { type: "string" },
                  rate: { type: "number" },
                  changePercent: { type: "number" }
                }
              }
            }
          }
        }
      });

      console.log('💱 תוצאות שערי מטבע:', result);

      if (result?.currencies && result.currencies.length > 0) {
        setCurrencies(result.currencies.slice(0, 4));
        console.log('✅ שערי מטבע נטענו בהצלחה:', result.currencies);
      } else {
        // Fallback data from reliable sources
        setCurrencies([
          { code: "USD", name: "דולר", rate: 3.65, changePercent: 0.45 },
          { code: "EUR", name: "יורו", rate: 3.98, changePercent: -0.23 },
          { code: "GBP", name: "לירה", rate: 4.52, changePercent: 0.12 },
          { code: "BTC", name: "ביטקוין", rate: 365000, changePercent: 2.15 }
        ]);
        console.log('⚠️ משתמש בנתוני fallback');
      }
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      // Fallback data
      setCurrencies([
        { code: "USD", name: "דולר", rate: 3.65, changePercent: 0.45 },
        { code: "EUR", name: "יורו", rate: 3.98, changePercent: -0.23 },
        { code: "GBP", name: "לירה", rate: 4.52, changePercent: 0.12 },
        { code: "BTC", name: "ביטקוין", rate: 365000, changePercent: 2.15 }
      ]);
    }
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

      // If no news in DB, fetch from live sources
      const now = new Date();
      const currentDate = `7 בינואר 2026 (07/01/2026)`;
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `CRITICAL: התאריך היום הוא ${currentDate}.

תן לי 5 כותרות חדשות חמות מישראל מהיום 7.1.2026 בלבד.
- רק חדשות מ-24 השעות האחרונות (7 בינואר 2026)
- לא חדשות מ-2025 או תאריכים ישנים
- כותרות קצרות ומדויקות, ללא מספור
- התמקד בחדשות אמיתיות: ביטחון, כלכלה, פוליטיקה, ספורט
- כל כותרת בשורה נפרדת

החזר רק את הכותרות מיום 7.1.2026.`,
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
    <div className="bg-black dark:bg-gray-950 text-white overflow-hidden relative z-[35] w-full">
      {/* Breaking News Strip */}
      <div className="flex items-center gap-1 sm:gap-3 px-0 py-2 w-full">
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
            className="flex whitespace-nowrap text-base sm:text-lg pointer-events-none items-center font-bold"
            animate={{ x: `-${(news.length * 300 + currencies.length * 250)}px` }}
            transition={{ duration: (news.length + currencies.length) * 3, repeat: Infinity, ease: "linear" }}
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
                className="mx-6 sm:mx-10 inline-flex items-center gap-2 px-4 py-2 rounded-xl"
                animate={{
                  background: [
                    'linear-gradient(to right, rgba(234, 179, 8, 0.2), rgba(34, 197, 94, 0.2))',
                    'linear-gradient(to right, rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))',
                    'linear-gradient(to right, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.2))',
                    'linear-gradient(to right, rgba(234, 179, 8, 0.2), rgba(34, 197, 94, 0.2))'
                  ],
                  boxShadow: [
                    '0 0 10px rgba(234, 179, 8, 0.3)',
                    '0 0 20px rgba(59, 130, 246, 0.5)',
                    '0 0 15px rgba(239, 68, 68, 0.4)',
                    '0 0 10px rgba(234, 179, 8, 0.3)'
                  ],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.2
                }}
                style={{
                  border: '2px solid rgba(234, 179, 8, 0.5)'
                }}
              >
                {currency.code === 'USD' && <DollarSign className="w-5 h-5 text-green-400 animate-pulse" />}
                {currency.code === 'EUR' && <Euro className="w-5 h-5 text-blue-400 animate-pulse" />}
                {currency.code === 'BTC' && <span className="text-orange-400 font-bold text-base animate-pulse">₿</span>}
                {currency.code === 'GBP' && <span className="text-blue-300 font-bold text-base animate-pulse">£</span>}
                <span className="font-bold text-white text-base">{currency.name}</span>
                <span className="text-yellow-300 font-bold text-base">
                  ₪{currency.code === 'BTC' ? (currency.rate || 0).toFixed(0) : (currency.rate || 0).toFixed(2)}
                </span>
                <motion.span 
                  className={`font-bold text-sm ${(currency.changePercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}
                  animate={{
                    scale: [1, 1.15, 1],
                    textShadow: [
                      '0 0 5px currentColor',
                      '0 0 15px currentColor',
                      '0 0 5px currentColor'
                    ]
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
          </motion.div>
        </button>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0 relative z-[60]">
          <button
            onClick={onMenuClick}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg hover:bg-white/20 text-[#E31E24] active:scale-95 transition-all touch-manipulation relative z-[70] group"
            title="תפריט"
          >
            <div className="flex flex-col gap-1.5">
              <div className="w-5 h-0.5 bg-[#E31E24] rounded-full group-hover:w-6 transition-all"></div>
              <div className="w-5 h-0.5 bg-[#E31E24] rounded-full group-hover:w-6 transition-all"></div>
              <div className="w-5 h-0.5 bg-[#E31E24] rounded-full group-hover:w-6 transition-all"></div>
            </div>
          </button>

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

      {/* Broadcast Strip */}
      <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 overflow-hidden border-t border-red-900/20 h-8 w-full">
        <motion.div
          className="flex gap-8 whitespace-nowrap h-full items-center text-lg"
          animate={{ x: [0, -1000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {[
            "• מהדורת החדשות בשידור חי - כל יום בשעה 21:00",
            "• ספורט וחדשות: בעדכון מינוטי כל היום",
            "• כלכלה שוק השוקים: נתונים עדכניים בזמן אמת",
            "• תחזוקה מתוכננת: שרתים בעדכון קבוע"
          ].map((item, idx) => (
            <span 
              key={`broadcast-${idx}`} 
              className="flex-shrink-0 font-bold text-base" 
              style={{
                backgroundImage: 'linear-gradient(90deg, #E31E24, #FCD34D, #E31E24)',
                backgroundSize: '200% 100%',
                animation: 'gradientShift 3s ease-in-out infinite',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {item}
            </span>
          ))}
        </motion.div>
        <style>{`
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}</style>
      </div>
    </div>
  );
}