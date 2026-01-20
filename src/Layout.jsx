import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { 
  Menu, X, Radio, Newspaper, Shield, TrendingUp, 
  Vote, Cpu, Trophy, Clapperboard, Globe, Heart,
  Clock, ChevronLeft, Users, Moon, Sun, Home, Flame,
  Siren, AlertTriangle, MessageSquareWarning, Film, Tv, User, MessageCircle, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NewsTicker from "./components/header/NewsTicker";
import ReportersTickerStrip from "./components/header/ReportersTickerStrip";
import ReportersModal from "./components/reporter/ReportersModal";
import AIAnnouncer from "./components/news/AIAnnouncer";
import RightSidebarUpdates from "./components/sidebar/RightSidebarUpdates";
import LeftSidebarCategories from "./components/sidebar/LeftSidebarCategories";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

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

  const additionalPages = [
  { id: "archive", label: "ארכיון", icon: Clock, href: "Archive" }
  ];

export default function Layout({ children, currentPageName }) {
  // דף VODContent - ללא Layout
  if (currentPageName === 'VODContent') {
    return children;
  }
        const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
        const [categoriesSidebarOpen, setCategoriesSidebarOpen] = useState(false);
        const [reportersModalOpen, setReportersModalOpen] = useState(false);
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
    <div className="min-h-screen bg-black transition-colors duration-300 flex flex-col overflow-x-hidden" dir="rtl">
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

        @keyframes slideRight {
          0% { transform: translateX(-100vw); }
          100% { transform: translateX(100vw); }
        }
      `}</style>

      {/* Animated Red Line */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-transparent overflow-hidden z-[35] pointer-events-none">
        <div className="absolute top-0 h-full w-32 bg-[#E31E24] animate-[slideRight_3s_ease-in-out_infinite]"></div>
      </div>

      {/* Logo Header */}
      <div className="bg-black/80 backdrop-blur-xl border-b border-white/10 py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <motion.img 
              src={LOGO_URL} 
              alt="הרשת החדשה" 
              className="h-14 sm:h-16 w-auto drop-shadow-2xl"
              animate={{ 
                scale: [1, 1.05, 1],
                filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)']
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-bold text-white">הרשת החדשה</h1>
              <motion.p 
                className="text-xs sm:text-sm text-white/70"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                מיד מתחילים...
              </motion.p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReportersModalOpen(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-black/60 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-white/20 transition-all hover:scale-105 hover:bg-black/70 text-xs sm:text-sm"
            >
              <Users className="w-4 h-4 text-white" />
              <span className="text-white font-bold hidden sm:inline">כתבים</span>
            </button>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openReporterChat'))}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-black/60 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-white/20 transition-all hover:scale-105 hover:bg-black/70 text-xs sm:text-sm"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span className="text-white font-bold hidden sm:inline">צ'אט</span>
            </button>

            <Link 
              to={createPageUrl("VODContent")}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-black/60 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-white/20 transition-all hover:scale-105 hover:bg-black/70 text-xs sm:text-sm"
            >
              <Tv className="w-4 h-4 text-white" />
              <span className="text-white font-bold hidden sm:inline">VOD</span>
            </Link>

            <button
              onClick={() => setCategoriesSidebarOpen(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-black/60 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-white/20 transition-all hover:scale-105 hover:bg-black/70 text-xs sm:text-sm"
            >
              <Newspaper className="w-4 h-4 text-white" />
              <span className="text-white font-bold hidden sm:inline">קטגוריות</span>
            </button>

            <Link 
              to={createPageUrl("Live")}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-[#E31E24] to-[#B91C1C] backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-white/20 transition-all hover:scale-105 animate-pulse text-xs sm:text-sm"
            >
              <Radio className="w-4 h-4 text-white" />
              <span className="text-white font-bold hidden sm:inline">שידור חי</span>
            </Link>

            <Link 
              to={createPageUrl("UserProfile")}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-black/60 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-white/20 transition-all hover:scale-105 hover:bg-black/70 text-xs sm:text-sm"
            >
              <User className="w-4 h-4 text-white" />
              <span className="text-white font-bold hidden sm:inline">פרופיל</span>
            </Link>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openAvatarCreator'))}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-black/60 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-[#E31E24]/50 transition-all hover:scale-105 hover:bg-[#E31E24]/30 text-xs sm:text-sm"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white font-bold hidden sm:inline">דמויות</span>
            </button>
          </div>
        </div>
      </div>

      {/* Breaking News Ticker */}
      <NewsTicker darkMode={darkMode} setDarkMode={setDarkMode} onMenuClick={() => setCategoriesSidebarOpen(true)} />

      {/* Reporters Ticker Strip */}
      <ReportersTickerStrip />



      {/* Reporters Modal */}
      <ReportersModal 
        isOpen={reportersModalOpen} 
        onClose={() => setReportersModalOpen(false)} 
      />

      {/* AI Announcer */}
      <AIAnnouncer />



      {/* Categories Sidebar */}
      <AnimatePresence>
        {categoriesSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999]"
            >
              <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setCategoriesSidebarOpen(false)}
              />
              <motion.nav 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute right-0 top-0 bottom-0 w-64 bg-black/90 backdrop-blur-xl border-l border-[#E31E24]/30 shadow-2xl shadow-[#E31E24]/20 overflow-y-auto"
              >
                <div className="sticky top-0 bg-gradient-to-br from-black via-[#E31E24]/20 to-black p-4 shadow-lg border-b border-[#E31E24]/30">
                  <div className="flex items-center justify-between">
                    <h2 className="text-white font-bold">קטגוריות</h2>
                    <button
                      onClick={() => setCategoriesSidebarOpen(false)}
                      className="p-2 rounded-full bg-[#E31E24]/20 hover:bg-[#E31E24]/40 text-white active:scale-95 transition-all"
                    >
                      <X size={22} />
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={createPageUrl(cat.href)}
                      onClick={() => setCategoriesSidebarOpen(false)}
                      className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#E31E24]/20 active:bg-[#E31E24]/40 transition-all border border-transparent hover:border-[#E31E24]/30"
                    >
                      <div className="w-10 h-10 rounded-xl bg-black/40 border border-[#E31E24]/20 flex items-center justify-center">
                        <cat.icon size={20} className="text-[#E31E24]" />
                      </div>
                      <span className="flex-1 font-medium">{cat.label}</span>
                      <ChevronLeft size={18} className="text-[#E31E24]" />
                    </Link>
                  ))}
                </div>
              </motion.nav>
            </motion.div>
          )}
      </AnimatePresence>

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
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.nav 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-black/90 backdrop-blur-xl border-l border-[#E31E24]/30 shadow-2xl shadow-[#E31E24]/20 overflow-y-auto"
              >
                {/* Drawer Header */}
                <div className="sticky top-0 bg-gradient-to-br from-black via-[#E31E24]/20 to-black p-4 shadow-lg border-b border-[#E31E24]/30">
                  <div className="flex items-center justify-between">
                    <img 
                      src={LOGO_URL} 
                      alt="הרשת החדשה" 
                      className="h-12 w-auto"
                    />
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-full bg-[#E31E24]/20 hover:bg-[#E31E24]/40 text-white active:scale-95 transition-all"
                    >
                      <X size={22} />
                    </button>
                  </div>
                </div>

                {/* Live Button */}
                <div className="p-4 border-b border-[#E31E24]/30">
                  <Link
                    to={createPageUrl("Live")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-[#E31E24] to-[#B91C1C] text-white rounded-2xl font-bold shadow-lg shadow-[#E31E24]/30 active:scale-95 transition-transform"
                  >
                    <Radio size={20} />
                    שידור חי
                  </Link>
                </div>

                {/* Menu Items */}
                <div className="p-4 space-y-1">

                <Link
                  to={createPageUrl("Schedule")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#E31E24]/20 active:bg-[#E31E24]/40 transition-all border border-transparent hover:border-[#E31E24]/30"
                >
                  <div className="w-10 h-10 rounded-xl bg-black/40 border border-[#E31E24]/20 flex items-center justify-center">
                    <Clock size={20} className="text-[#E31E24]" />
                  </div>
                  <span className="flex-1 font-medium">לוח שידורים</span>
                  <ChevronLeft size={18} className="text-[#E31E24]" />
                </Link>

                <Link
                  to={createPageUrl("Reporters")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#E31E24]/20 active:bg-[#E31E24]/40 transition-all border border-transparent hover:border-[#E31E24]/30"
                >
                  <div className="w-10 h-10 rounded-xl bg-black/40 border border-[#E31E24]/20 flex items-center justify-center">
                    <Users size={20} className="text-[#E31E24]" />
                  </div>
                  <span className="flex-1 font-medium">אנשי השטח</span>
                  <ChevronLeft size={18} className="text-[#E31E24]" />
                </Link>


                </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content with Sidebars */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <LeftSidebarCategories />

        {/* Main Content */}
        <main className="flex-1 px-0 sm:px-4 py-0 sm:py-6 pb-16 sm:pb-24 lg:pb-6 max-w-7xl mx-auto">
          {children}
        </main>

        {/* Right Sidebar */}
        <RightSidebarUpdates />
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-br from-black/90 via-[#E31E24]/20 to-black/90 backdrop-blur-xl border-t border-[#E31E24]/30 z-50 safe-area-inset-bottom shadow-lg">
        <div className="grid grid-cols-4 gap-1 px-2 py-3">
          <Link
            to={createPageUrl("Home")}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = createPageUrl("Home");
            }}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl active:bg-[#E31E24]/20 transition-colors touch-manipulation relative z-[110]"
            >
            <Home size={28} className="text-gray-300 mb-1" strokeWidth={2.5} />
            <span className="text-[11px] font-bold text-gray-300">בית</span>
          </Link>

          <Link
            to={createPageUrl("Live")}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl active:bg-[#E31E24]/20 transition-colors touch-manipulation"
          >
            <Radio size={28} className="text-[#E31E24] mb-1" strokeWidth={2.5} />
            <span className="text-[11px] font-bold text-[#E31E24]">חי</span>
          </Link>

          <Link
            to={createPageUrl("Category?cat=breaking")}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl active:bg-[#E31E24]/20 transition-colors touch-manipulation"
          >
            <Flame size={28} className="text-gray-300 mb-1" strokeWidth={2.5} />
            <span className="text-[11px] font-bold text-gray-300">חמות</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl active:bg-[#E31E24]/20 transition-colors touch-manipulation"
          >
            <Menu size={28} className="text-gray-300 mb-1" strokeWidth={2.5} />
            <span className="text-[11px] font-bold text-gray-300">עוד</span>
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
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
              <Link to={createPageUrl("Terms")} className="text-gray-400 hover:text-[#E31E24] transition-colors text-sm">
                תקנון שימוש
              </Link>
              <span className="text-gray-600 hidden sm:inline">•</span>
              <Link to={createPageUrl("Accessibility")} className="text-gray-400 hover:text-[#E31E24] transition-colors text-sm">
                הצהרת נגישות
              </Link>
              <span className="text-gray-600 hidden sm:inline">•</span>
              <a href="mailto:privacy@hareshet.co.il" className="text-gray-400 hover:text-[#E31E24] transition-colors text-sm">
                צור קשר
              </a>
            </div>
            <div className="text-center text-gray-500 text-sm">
              © 2024 הרשת החדשה. כל הזכויות שמורות.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}