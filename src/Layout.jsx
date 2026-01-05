import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { 
  Menu, X, Radio, Newspaper, Shield, TrendingUp, 
  Vote, Cpu, Trophy, Clapperboard, Globe, Heart,
  Clock, ChevronLeft, Users, Moon, Sun, Home,
  Siren, AlertTriangle, MessageSquareWarning
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ClockWidget from "./components/header/ClockWidget";
import WeatherWidget from "./components/header/WeatherWidget";

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
      `}</style>

      {/* Top Bar with Clock and Weather */}
      <div className="bg-gray-900 dark:bg-black text-white py-2 px-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ClockWidget />
            <WeatherWidget />
          </div>
          <div className="flex items-center gap-2">
            <Link 
              to={createPageUrl("WarRoom")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-full text-xs font-bold transition-colors"
            >
              <Siren size={14} className="animate-pulse" />
              חדר מלחמה
            </Link>
            <Link 
              to={createPageUrl("PublicReports")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 rounded-full text-xs font-bold transition-colors"
            >
              <MessageSquareWarning size={14} />
              דיווח מפגע
            </Link>
          </div>
        </div>
      </div>

      {/* Breaking News Ticker */}
      <div className="bg-[#E31E24] dark:bg-[#B91C1C] text-white py-2 overflow-hidden">
        <div className="flex items-center">
          <span className="bg-white text-[#E31E24] px-4 py-1 font-bold text-sm shrink-0 mr-4">
            חדשות חמות
          </span>
          <div className="ticker-wrapper overflow-hidden flex-1">
            <motion.div
              className="flex whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
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
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center gap-1 py-3">
            <img 
              src={LOGO_URL} 
              alt="הרשת החדשה" 
              className="h-16 w-auto ml-3"
            />
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
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-1.5 px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-[#E31E24] dark:hover:text-[#E31E24] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all text-xs font-medium"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-[#E31E24] transition-colors"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-[#E31E24] transition-colors"
            >
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 z-[9999] lg:hidden"
          >
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-800 shadow-xl overflow-y-auto">
              <div className="p-6">
                <img 
                  src={LOGO_URL} 
                  alt="הרשת החדשה" 
                  className="h-20 w-auto mb-8"
                />
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={createPageUrl(cat.href)}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:text-[#E31E24] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      >
                      <cat.icon size={20} />
                      {cat.label}
                      <ChevronLeft size={16} className="mr-auto" />
                      </Link>
                      ))}
                      <Link
                      to={createPageUrl("Schedule")}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:text-[#E31E24] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      >
                      <Clock size={20} />
                      לוח שידורים
                      <ChevronLeft size={16} className="mr-auto" />
                      </Link>
                </div>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>

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