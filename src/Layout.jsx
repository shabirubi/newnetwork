import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { 
  Menu, X, Radio, Newspaper, Shield, TrendingUp, 
  Vote, Cpu, Trophy, Clapperboard, Globe, Heart,
  Clock, ChevronLeft, Users, Moon, Sun, Home, Flame,
  Siren, AlertTriangle, MessageSquareWarning, Film
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NewsTicker from "./components/header/NewsTicker";
import ReportersModal from "./components/reporter/ReportersModal";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/a44ef2558_212.png";

const categories = [
  { id: "home", label: "בית", href: "Home", icon: Home },
  { id: "breaking", label: "עכשיו", href: "Category?cat=breaking", icon: Flame },
  { id: "security", label: "ביטחון", href: "Category?cat=security", icon: Shield },
  { id: "economy", label: "כלכלה", href: "Category?cat=economy", icon: TrendingUp },
  { id: "politics", label: "פוליטיקה", href: "Category?cat=politics", icon: Vote },
  { id: "technology", label: "טכנולוגיה", href: "Category?cat=technology", icon: Cpu },
  { id: "sports", label: "ספורט", href: "Category?cat=sports", icon: Trophy },
  { id: "entertainment", label: "בידור", href: "Category?cat=entertainment", icon: Clapperboard },
  { id: "world", label: "עולם", href: "Category?cat=world", icon: Globe },
  { id: "health", label: "בריאות", href: "Category?cat=health", icon: Heart },
  ];

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reportersModalOpen, setReportersModalOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved === null ? true : saved === 'true';
    }
    return true;
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

  // Apply dark mode on mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300" dir="rtl">
      <style>{`
        :root {
          --primary: #E31E24;
          --primary-dark: #B91C1C;
          --primary-light: #FEE2E2;
        }

        .sidebar-toggle-target {
          transform: translateX(100%);
        }

        .sidebar-toggle-target.sidebar-visible {
          transform: translateX(0);
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

        @keyframes slideRight {
          0% { transform: translateX(-100vw); }
          100% { transform: translateX(100vw); }
        }
      `}</style>

      {/* Animated Red Line */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-transparent overflow-hidden z-[60] pointer-events-none">
        <div className="absolute top-0 h-full w-32 bg-[#E31E24] animate-[slideRight_3s_ease-in-out_infinite]"></div>
      </div>

      {/* Breaking News Ticker */}
      <NewsTicker darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Reporters Modal */}
      <ReportersModal 
        isOpen={reportersModalOpen} 
        onClose={() => setReportersModalOpen(false)} 
      />

      {/* Right Sidebar with Icons - Hidden on Home page */}
      {currentPageName !== 'Home' && (
        <motion.div
          initial={false}
          animate={{ width: sidebarExpanded ? 280 : 70 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
          className="sidebar-toggle-target fixed right-0 top-0 bottom-0 bg-black/90 backdrop-blur-xl shadow-2xl z-40 overflow-y-auto border-l border-white/10 hidden sm:block transition-all duration-300"
          style={{
            transform: 'translateX(0)',
          }}
        >
        <div className="py-4 space-y-1">
          <Link
            to={createPageUrl("Live")}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = createPageUrl("Live");
            }}
            className="flex items-center gap-3 px-4 py-3 text-white bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 mx-2 rounded-lg transition-all shadow-lg shadow-red-500/20"
          >
            <Radio size={22} className="flex-shrink-0" />
            {sidebarExpanded && <span className="font-medium whitespace-nowrap">שידור חי</span>}
          </Link>

          <Link
            to={createPageUrl("Home")}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = createPageUrl("Home");
            }}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 mx-2 rounded-lg transition-all"
          >
            <Home size={22} className="flex-shrink-0" />
            {sidebarExpanded && <span className="font-medium whitespace-nowrap">דף הבית</span>}
          </Link>

          {/* Categories */}
          {categories.map((cat, idx) => {
            const rainbowColors = [
              'text-red-500',
              'text-orange-500', 
              'text-yellow-500',
              'text-green-500',
              'text-blue-500',
              'text-indigo-500',
              'text-purple-500',
              'text-pink-500',
              'text-rose-500',
              'text-cyan-500'
            ];
            return (
              <Link
                key={cat.id}
                to={createPageUrl(cat.href)}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = createPageUrl(cat.href);
                }}
                className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 mx-2 rounded-lg transition-all group"
              >
                <cat.icon size={22} className={`flex-shrink-0 ${rainbowColors[idx % rainbowColors.length]} group-hover:scale-110 transition-transform`} />
                {sidebarExpanded && <span className="font-medium whitespace-nowrap">{cat.label}</span>}
              </Link>
            );
          })}

          <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

          <Link
            to={createPageUrl("Schedule")}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = createPageUrl("Schedule");
            }}
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 mx-2 rounded-lg transition-all group"
          >
            <Clock size={22} className="flex-shrink-0 text-cyan-500 group-hover:scale-110 transition-transform" />
            {sidebarExpanded && <span className="font-medium whitespace-nowrap">לוח שידורים</span>}
          </Link>

          <Link
            to={createPageUrl("Reporters")}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = createPageUrl("Reporters");
            }}
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 mx-2 rounded-lg transition-all group"
          >
            <Users size={22} className="flex-shrink-0 text-emerald-500 group-hover:scale-110 transition-transform" />
            {sidebarExpanded && <span className="font-medium whitespace-nowrap">אנשי השטח</span>}
          </Link>

          <Link
            to={createPageUrl("Archive")}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = createPageUrl("Archive");
            }}
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 mx-2 rounded-lg transition-all group"
          >
            <Clock size={22} className="flex-shrink-0 text-amber-500 group-hover:scale-110 transition-transform" />
            {sidebarExpanded && <span className="font-medium whitespace-nowrap">ארכיון</span>}
          </Link>

          <Link
            to={createPageUrl("Movies")}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = createPageUrl("Movies");
            }}
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 mx-2 rounded-lg transition-all group"
          >
            <Film size={22} className="flex-shrink-0 text-fuchsia-500 group-hover:scale-110 transition-transform" />
            {sidebarExpanded && <span className="font-medium whitespace-nowrap">סרטים</span>}
          </Link>

          <Link
            to={createPageUrl("NewsLoader")}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = createPageUrl("NewsLoader");
            }}
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 mx-2 rounded-lg transition-all group"
          >
            <Globe size={22} className="flex-shrink-0 text-sky-500 group-hover:scale-110 transition-transform" />
            {sidebarExpanded && <span className="font-medium whitespace-nowrap">טעינת חדשות</span>}
          </Link>

          <Link
            to={createPageUrl("ChannelsManager")}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = createPageUrl("ChannelsManager");
            }}
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 mx-2 rounded-lg transition-all group"
          >
            <Radio size={22} className="flex-shrink-0 text-violet-500 group-hover:scale-110 transition-transform" />
            {sidebarExpanded && <span className="font-medium whitespace-nowrap">ניהול ערוצים</span>}
          </Link>

          <Link
            to={createPageUrl("ReporterQA")}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = createPageUrl("ReporterQA");
            }}
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 mx-2 rounded-lg transition-all group"
          >
            <MessageSquareWarning size={22} className="flex-shrink-0 text-lime-500 group-hover:scale-110 transition-transform" />
            {sidebarExpanded && <span className="font-medium whitespace-nowrap">שאלות ותשובות</span>}
          </Link>

          <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 mx-2 rounded-lg transition-all w-full"
          >
            {darkMode ? <Sun size={22} className="flex-shrink-0" /> : <Moon size={22} className="flex-shrink-0" />}
            {sidebarExpanded && <span className="font-medium whitespace-nowrap">{darkMode ? 'מצב יום' : 'מצב לילה'}</span>}
          </button>
          </div>
          </motion.div>
          )}

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
              <div className="sticky top-0 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <img 
                    src={LOGO_URL} 
                    alt="הרשת החדשה" 
                    className="h-12 w-auto"
                  />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-full bg-white/10 text-white active:scale-95 transition-transform"
                  >
                    <X size={22} />
                  </button>
                </div>
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
                  to={createPageUrl("Reporters")}
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
      <main className={`px-0 py-0 pb-16 sm:pb-6 transition-all duration-300 ${currentPageName !== 'Home' ? 'sm:pr-20' : ''}`}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-[100] safe-area-inset-bottom shadow-lg">
        <div className="grid grid-cols-4 gap-1 px-2 py-3">
          <Link
            to={createPageUrl("Home")}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = createPageUrl("Home");
            }}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl active:bg-gray-100 dark:active:bg-gray-700 transition-colors touch-manipulation relative z-[110]"
          >
            <Home size={28} className="text-gray-600 dark:text-gray-300 mb-1" strokeWidth={2.5} />
            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">בית</span>
          </Link>

          <Link
            to={createPageUrl("Live")}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl active:bg-gray-100 dark:active:bg-gray-700 transition-colors touch-manipulation"
          >
            <Radio size={28} className="text-[#E31E24] mb-1" strokeWidth={2.5} />
            <span className="text-[11px] font-bold text-[#E31E24]">חי</span>
          </Link>

          <Link
            to={createPageUrl("Category?cat=breaking")}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl active:bg-gray-100 dark:active:bg-gray-700 transition-colors touch-manipulation"
          >
            <Flame size={28} className="text-gray-600 dark:text-gray-300 mb-1" strokeWidth={2.5} />
            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">חמות</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl active:bg-gray-100 dark:active:bg-gray-700 transition-colors touch-manipulation"
          >
            <Menu size={28} className="text-gray-600 dark:text-gray-300 mb-1" strokeWidth={2.5} />
            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">עוד</span>
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