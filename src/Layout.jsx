import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { 
  Menu, X, Radio, Newspaper, Shield, TrendingUp, 
  Vote, Cpu, Trophy, Clapperboard, Globe, Heart,
  Clock, ChevronLeft, Users, Moon, Sun, Home, Flame,
  Siren, AlertTriangle, MessageSquareWarning
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ClockWidget from "./components/header/ClockWidget";
import WeatherWidget from "./components/header/WeatherWidget";
import ChannelSelector from "./components/header/ChannelSelector";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/a44ef2558_212.png";

const categories = [
  { id: "home", label: "דף הבית", icon: Home, href: "Home" },
  { id: "breaking", label: "חדשות עכשיו", icon: Radio, href: "Category?cat=breaking" },
  { id: "security", label: "ביטחון ומדיניות", icon: Shield, href: "Category?cat=security" },
  { id: "economy", label: "כלכלה ועסקים", icon: TrendingUp, href: "Category?cat=economy" },
  { id: "politics", label: "פוליטיקה", icon: Vote, href: "Category?cat=politics" },
  { id: "technology", label: "טכנולוגיה", icon: Cpu, href: "Category?cat=technology" },
  { id: "sports", label: "ספורט", icon: Trophy, href: "Category?cat=sports" },
  { id: "entertainment", label: "בידור ודרמה", icon: Clapperboard, href: "Category?cat=entertainment" },
  { id: "world", label: "חדשות עולם", icon: Globe, href: "Category?cat=world" },
  { id: "health", label: "בריאות", icon: Heart, href: "Category?cat=health" },
];

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300" dir="rtl">
      <style>{`
        :root {
          --primary: #E31E24;
          --primary-dark: #B91C1C;
          --primary-light: #FEE2E2;
        }

        /* Hide scrollbars */
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        *::-webkit-scrollbar {
          display: none;
        }

        /* Mobile native feel */
        @media (max-width: 1024px) {
          body {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }
        }
      `}</style>

      {/* Top Bar with Clock and Weather */}
      <div className="bg-gray-900 dark:bg-black text-white py-1.5 px-2 lg:px-4 border-b border-gray-800 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-1.5 lg:gap-3">
              <img 
                src={LOGO_URL} 
                alt="הרשת החדשה" 
                className="h-16 lg:h-20 w-auto ml-3"
              />
              <ClockWidget />
              <WeatherWidget />
              <ChannelSelector />
            </div>
            <div className="flex items-center gap-1 lg:gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 dark:bg-gray-700 text-gray-200 active:scale-95 transition-transform"
              >
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            <Link 
              to={createPageUrl("WarRoom")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-full text-xs font-bold transition-colors"
            >
              <Siren size={14} className="animate-pulse" />
              חדר מלחמה
            </Link>
            <Link 
              to={createPageUrl("WarRoom")}
              className="flex sm:hidden items-center justify-center w-8 h-8 bg-red-600 active:bg-red-700 rounded-full transition-colors"
            >
              <Siren size={14} className="animate-pulse" />
            </Link>
            <Link 
              to={createPageUrl("PublicReports")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 rounded-full text-xs font-bold transition-colors"
            >
              <MessageSquareWarning size={14} />
              דיווח מפגע
            </Link>
            <Link 
              to={createPageUrl("PublicReports")}
              className="flex sm:hidden items-center justify-center w-8 h-8 bg-orange-500 active:bg-orange-600 rounded-full transition-colors"
            >
              <MessageSquareWarning size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Breaking News Ticker */}
      <div className="bg-[#E31E24] dark:bg-[#B91C1C] text-white py-2 overflow-hidden hidden sm:block">
        <div className="flex items-center">
          <span className="bg-black text-white px-4 py-1 font-bold text-sm shrink-0 mr-4">
            חדשות חמות
          </span>
          <div className="ticker-wrapper overflow-hidden flex-1">
            <motion.div
              className="flex whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
              <span className="mx-8">• פיגוע נסכל בגבול הצפון - צה"ל מדווח על ניטרול מחבלים</span>
              <span className="mx-8">• הבורסה בתל אביב פותחת במגמה חיובית</span>
              <span className="mx-8">• ראש הממשלה ייפגש היום עם נשיא ארה"ב</span>
              <span className="mx-8">• מזג אוויר: גל חום כבד צפוי בסוף השבוע</span>
              <span className="mx-8">• פיגוע נסכל בגבול הצפון - צה"ל מדווח על ניטרול מחבלים</span>
              <span className="mx-8">• הבורסה בתל אביב פותחת במגמה חיובית</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300 border-b border-gray-200 dark:border-gray-700 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center justify-center gap-1 py-3">
            <Link
              to={createPageUrl("Live")}
              className="flex items-center gap-1.5 px-3 py-2 text-white bg-[#E31E24] hover:bg-[#B91C1C] rounded-lg transition-all text-xs font-bold"
            >
              <Radio size={16} />
              שידור חי
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={createPageUrl(cat.href)}
                className="flex items-center gap-1.5 px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-[#E31E24] dark:hover:text-[#E31E24] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all text-xs font-medium"
              >
                <cat.icon size={16} />
                {cat.label}
              </Link>
              ))}
              <Link
                to={createPageUrl("Schedule")}
                className="flex items-center gap-1.5 px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-[#E31E24] dark:hover:text-[#E31E24] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all text-xs font-medium"
              >
                <Clock size={16} />
                לוח שידורים
              </Link>
              <Link
                to={createPageUrl("Home")}
                className="flex items-center gap-1.5 px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-[#E31E24] dark:hover:text-[#E31E24] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all text-xs font-medium"
              >
                <Users size={16} />
                אנשי השטח
              </Link>
              <Link
                to={createPageUrl("NewsLoader")}
                className="flex items-center gap-1.5 px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-[#E31E24] dark:hover:text-[#E31E24] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all text-xs font-medium"
              >
                <Globe size={16} />
                טעינת חדשות
              </Link>
              <Link
                to={createPageUrl("ChannelsManager")}
                className="flex items-center gap-1.5 px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-[#E31E24] dark:hover:text-[#E31E24] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all text-xs font-medium"
              >
                <Radio size={16} />
                ניהול ערוצים
              </Link>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-1.5 px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-[#E31E24] dark:hover:text-[#E31E24] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all text-xs font-medium"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              </nav>
        </div>
      </header>

      {/* Native Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] lg:hidden"
          >
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="sticky top-0 bg-gradient-to-br from-[#E31E24] to-red-600 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <img 
                    src={LOGO_URL} 
                    alt="הרשת החדשה" 
                    className="h-16 w-auto"
                  />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-full bg-white/20 text-white active:scale-95 transition-transform"
                  >
                    <X size={24} />
                  </button>
                </div>
                <p className="text-white/90 text-sm">תפריט ראשי</p>
              </div>

              {/* Live Button */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <Link
                  to={createPageUrl("Live")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-[#E31E24] text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
                >
                  <Radio size={20} />
                  שידור חי
                </Link>
              </div>

              {/* Menu Items */}
              <div className="p-4 space-y-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={createPageUrl(cat.href)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 text-gray-700 dark:text-gray-200 rounded-2xl active:bg-gray-100 dark:active:bg-gray-700 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <cat.icon size={20} />
                    </div>
                    <span className="flex-1 font-medium">{cat.label}</span>
                    <ChevronLeft size={18} className="text-gray-400" />
                  </Link>
                ))}

                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                <Link
                  to={createPageUrl("Schedule")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-4 text-gray-700 dark:text-gray-200 rounded-2xl active:bg-gray-100 dark:active:bg-gray-700 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <span className="flex-1 font-medium">לוח שידורים</span>
                  <ChevronLeft size={18} className="text-gray-400" />
                </Link>

                <Link
                  to={createPageUrl("Home")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-4 text-gray-700 dark:text-gray-200 rounded-2xl active:bg-gray-100 dark:active:bg-gray-700 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <span className="flex-1 font-medium">אנשי השטח</span>
                  <ChevronLeft size={18} className="text-gray-400" />
                </Link>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-0 sm:px-4 py-0 sm:py-6 pb-16 sm:pb-24 lg:pb-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 safe-area-inset-bottom">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          <Link
            to={createPageUrl("Home")}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl active:bg-gray-100 dark:active:bg-gray-700 transition-colors"
          >
            <Home size={22} className="text-gray-600 dark:text-gray-300 mb-1" />
            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">דף הבית</span>
          </Link>

          <Link
            to={createPageUrl("Live")}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl active:bg-gray-100 dark:active:bg-gray-700 transition-colors"
          >
            <Radio size={22} className="text-[#E31E24] mb-1" />
            <span className="text-[10px] font-medium text-[#E31E24]">שידור חי</span>
          </Link>

          <Link
            to={createPageUrl("Category?cat=breaking")}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl active:bg-gray-100 dark:active:bg-gray-700 transition-colors"
          >
            <Flame size={22} className="text-gray-600 dark:text-gray-300 mb-1" />
            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">חמות</span>
          </Link>

          <Link
            to={createPageUrl("Schedule")}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl active:bg-gray-100 dark:active:bg-gray-700 transition-colors"
          >
            <Clock size={22} className="text-gray-600 dark:text-gray-300 mb-1" />
            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">לוח</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl active:bg-gray-100 dark:active:bg-gray-700 transition-colors"
          >
            <Menu size={22} className="text-gray-600 dark:text-gray-300 mb-1" />
            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">עוד</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img 
                src={LOGO_URL} 
                alt="הרשת החדשה" 
                className="h-16 w-auto mb-4"
              />
              <p className="text-gray-400 text-sm">
                ערוץ חדשות דיגיטלי מבוסס AI עם בקרה אנושית, המייצר תוכן דיגיטלי במהירות ובאיכות.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">קטגוריות</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to={createPageUrl("Category?cat=security")} className="hover:text-[#E31E24]">ביטחון ומדיניות</Link></li>
                <li><Link to={createPageUrl("Category?cat=economy")} className="hover:text-[#E31E24]">כלכלה ועסקים</Link></li>
                <li><Link to={createPageUrl("Category?cat=politics")} className="hover:text-[#E31E24]">פוליטיקה</Link></li>
                <li><Link to={createPageUrl("Category?cat=technology")} className="hover:text-[#E31E24]">טכנולוגיה</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">עוד</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to={createPageUrl("Category?cat=sports")} className="hover:text-[#E31E24]">ספורט</Link></li>
                <li><Link to={createPageUrl("Category?cat=entertainment")} className="hover:text-[#E31E24]">בידור ודרמה</Link></li>
                <li><Link to={createPageUrl("Category?cat=world")} className="hover:text-[#E31E24]">חדשות עולם</Link></li>
                <li><Link to={createPageUrl("Category?cat=health")} className="hover:text-[#E31E24]">בריאות</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">התחברו אלינו</h4>
              <p className="text-gray-400 text-sm mb-4">
                הצטרפו למהפכה התקשורתית פורצת הדרך
              </p>
              <Link 
                to={createPageUrl("Live")}
                className="inline-flex items-center gap-2 bg-[#E31E24] text-white px-6 py-3 rounded-full hover:bg-[#B91C1C] transition-all"
              >
                <Radio size={18} />
                צפו בשידור חי
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2024 הרשת החדשה. כל הזכויות שמורות.
          </div>
        </div>
      </footer>
    </div>
  );
}