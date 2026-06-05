import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { 
  Menu, X, Radio, Newspaper, Shield, TrendingUp, 
  Vote, Cpu, Trophy, Clapperboard, Globe, Heart,
  Clock, ChevronLeft, Users, Moon, Sun, Home, Flame,
  Siren, AlertTriangle, MessageSquareWarning, Film, Tv, User, MessageCircle, Sparkles,
  LogOut, LogIn, Loader2, Mic
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import NewsTicker from "./components/header/NewsTicker";
import ReportersTickerStrip from "./components/header/ReportersTickerStrip";
import VideosCategoriesStrip from "./components/header/VideosCategoriesStrip";
import ReportersModal from "./components/reporter/ReportersModal";
import AIAnnouncer from "./components/news/AIAnnouncer";
import RightSidebarUpdates from "./components/sidebar/RightSidebarUpdates";
import LeftSidebarCategories from "./components/sidebar/LeftSidebarCategories";
import RightSidebarCategories from "./components/sidebar/RightSidebarCategories";
import KanArchiveModal from "./components/home/KanArchiveModal";
import TalkingAvatar from "./components/avatar/TalkingAvatar";
import DIDLiveChat from "./components/avatar/DIDLiveChat";
import AdminLoginModal from "./components/admin/AdminLoginModal";
import ReelsModal from "./components/home/ReelsModal";

import AccessibilityFloatingButton from "./components/accessibility/AccessibilityFloatingButton";
import InstallAppButton from "./components/shared/InstallAppButton";
import PodcastsFloatingButton from "./components/home/PodcastsFloatingButton";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import UserProfileModal from "./components/user/UserProfileModal";

const LOGO_URL = "https://media.base44.com/videos/public/695b39080025f4d38a586978/be7e061f7_shavit1313.mp4";
const LogoVideo = ({ className }) => (
  <video
    src={LOGO_URL}
    autoPlay
    loop
    muted
    playsInline
    preload="none"
    className={className}
  />
);

// Vertical Carousel Breaking News Component
function TypewriterDate() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const queryClient = useQueryClient();
  // Reuse shared cache — no extra DB call
  const allArticles = queryClient.getQueryData(['featured-articles']) || [];
  const news = allArticles.filter(a => a.is_breaking).slice(0, 5);

  React.useEffect(() => {
    if (news.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(i => (i + 1) % news.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [news.length]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  if (news.length === 0) {
    return (
      <div className="text-sm font-bold text-white">פתיחה רשמית: 7 למרץ 2026</div>
    );
  }

  return (
    <div className="overflow-hidden h-7 flex items-center w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ y: 28, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -28, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex items-center gap-2 whitespace-nowrap w-full"
        >
          <span className="text-red-500 text-xs">🔴</span>
          <span className="text-sm font-bold text-white truncate">{news[currentIndex]?.title}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

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
  { id: "crime", label: "פלילים", icon: AlertTriangle, href: "Category?cat=crime" },
  { id: "education", label: "חינוך", icon: Users, href: "Category?cat=education" },
  { id: "culture", label: "תרבות", icon: Clapperboard, href: "Category?cat=culture" },
  { id: "environment", label: "סביבה", icon: Globe, href: "Category?cat=environment" },
  { id: "science", label: "מדע", icon: Cpu, href: "Category?cat=science" },
  { id: "israel", label: "חדשות ישראל", icon: Newspaper, href: "Category?cat=israel" },
  { id: "military", label: "צבא וביטחון", icon: Shield, href: "Category?cat=military" },
  { id: "law", label: "משפט ופלילים", icon: AlertTriangle, href: "Category?cat=law" },
  { id: "local", label: "חדשות מקומיות", icon: Home, href: "Category?cat=local" },
  ];

  const additionalPages = [
    { id: "archive", label: "ארכיון", icon: Clock, href: "Archive" },
    { id: "design", label: "AI Design", icon: Sparkles, href: "AIDesignStudio" },
    { id: "avatar", label: "Avatar Studio", icon: Users, href: "AvatarStudio" }
    ];

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesSidebarOpen, setCategoriesSidebarOpen] = useState(false);
  const [reportersModalOpen, setReportersModalOpen] = useState(false);
  const [kanArchiveOpen, setKanArchiveOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved === null ? true : saved === 'true';
    }
    return true;
  });
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [didChatOpen, setDidChatOpen] = useState(false);
  const [menuSidebarOpen, setMenuSidebarOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState(null);

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [reelsOpen, setReelsOpen] = useState(false);


  // הפעל אנימציית לוגו - מבוטל לביצועים
  const [logoFloat, setLogoFloat] = useState(false);
  const triggerLogoFloat = () => {
    setLogoFloat(true);
    setTimeout(() => setLogoFloat(false), 1200);
  };

  useEffect(() => {
    const handleUserAction = () => triggerLogoFloat();
    window.addEventListener('click', handleUserAction);
    return () => window.removeEventListener('click', handleUserAction);
  }, []);

  useEffect(() => {
    const handler = () => setReelsOpen(true);
    window.addEventListener('openReels', handler);
    return () => window.removeEventListener('openReels', handler);
  }, []);

  // בדיקת מצב האתר — פעם אחת בלבד עם caching ארוך
  useEffect(() => {
    const cached = localStorage.getItem('site_settings');
    if (cached) {
      try { setSiteSettings(JSON.parse(cached)); return; }
      catch(e) {}
    }
    let cancelled = false;
    base44.entities.SiteSettings.list('-created_date', 1)
      .then(settings => { 
        if (!cancelled && settings?.[0]) {
          setSiteSettings(settings[0]);
          localStorage.setItem('site_settings', JSON.stringify(settings[0]));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // בדיקת משתמש מחובר — מוקדם יותר
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (err) {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  // חיפוש כתבות - מבוטל לביצועים

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light-mode');
      document.documentElement.style.colorScheme = 'dark';
      document.body.style.backgroundColor = '#121212';
      document.body.style.color = '#ffffff';
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light-mode');
      document.documentElement.style.colorScheme = 'light';
      document.body.style.backgroundColor = '#f5f5f5';
      document.body.style.color = '#111111';
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
      const savedColor = localStorage.getItem('themeColor') || '#0080FF';
      document.documentElement.style.setProperty('--primary', savedColor);
      document.documentElement.style.setProperty('--accent', savedColor);
    }, []);

  // Apply dark mode on mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
    
    // Cleanup video elements on unmount to prevent removeChild errors
    return () => {
      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        try {
          video.pause();
          video.src = '';
          video.load();
        } catch (e) {
          // Ignore cleanup errors
        }
      });
    };
  }, []);





  const handleLogout = async () => {
    try {
      await base44.auth.logout();
      setUser(null);
      localStorage.removeItem('user_email');
      toast.success('התנתקת בהצלחה');
    } catch (err) {
      toast.error('שגיאה בהתנתקות');
    }
  };

  const handleLogin = async () => {
    await base44.auth.redirectToLogin(createPageUrl('Home'));
  };

  // בדיקת מצב סגירה
  if (siteSettings?.is_closed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0057B8]/20 to-black flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-2xl w-full bg-black/80 backdrop-blur-xl rounded-3xl border-2 border-[#0057B8]/50 shadow-2xl shadow-[#0057B8]/30 p-8 text-center">
          <LogoVideo className="h-20 w-20 mx-auto mb-6 drop-shadow-2xl object-contain rounded-full" />
          <h1 className="text-4xl font-bold text-white mb-4">
            {siteSettings.closure_title}
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            {siteSettings.closure_message}
          </p>
          {siteSettings.estimated_reopen && (
            <div className="text-[#0057B8] text-lg font-bold">
              זמן פתיחה משוער: {siteSettings.estimated_reopen}
            </div>
          )}
        </div>
      </div>
    );
  }

  // דפים ללא Layout
  if (currentPageName === 'VODContent' || currentPageName === 'ReporterStudio' || currentPageName === 'BroadcastStudio' || currentPageName === 'VideoEditor' || currentPageName === 'VideoCreator' || currentPageName === 'ToMovieeStudio' || currentPageName === 'AdminPanel') {
    return children;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col overflow-x-hidden ${darkMode ? 'bg-[#0d1117]' : 'bg-[#f0f4f8]'}`} dir="rtl">
      <style>{`
        :root {
          --primary: #1565C0;
          --primary-dark: #0d47a1;
          --primary-light: #1976D2;
          --accent: #E87722;
          --accent-dark: #c25e00;
        }
        body { background-color: ${darkMode ? '#0d1117' : '#f0f4f8'} !important; color: ${darkMode ? '#e8edf5' : '#111827'} !important; }

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

        @keyframes colorShift {
          0%, 100% { 
            background: linear-gradient(to right, #1565C0, #E87722, #1565C0);
            box-shadow: 0 0 40px #1565C0;
          }
          50% { 
            background: linear-gradient(to right, #E87722, #1565C0, #E87722);
            box-shadow: 0 0 40px #E87722;
          }
        }

        @keyframes rainbow {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
      `}</style>



      {/* Logo Header */}
      <div className="bg-[#000000] py-2 shadow-xl relative overflow-visible">
        <div className="max-w-7xl mx-auto px-3 flex items-center justify-between gap-2 relative z-[200]">
          
          {/* Logo — always visible */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-[#0057B8] to-[#E31E24] flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white font-bold text-lg">ר</span>
            </div>
            <div className="flex-col text-right hidden sm:flex">
              <h1 className="text-base sm:text-xl font-bold text-white">הרשת החדשה</h1>
            </div>
          </div>

          {/* Breaking News Vertical Carousel */}
          <div className="flex-1 hidden md:flex items-center gap-2 bg-black/40 border border-red-700/30 rounded-lg px-3 py-1 min-w-0 max-w-sm">
            <span className="text-red-500 text-xs font-bold shrink-0">🔴 חדש</span>
            <div className="flex-1 min-w-0">
              <TypewriterDate />
            </div>
          </div>



          {/* Action buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Categories */}
            <button onClick={() => setCategoriesSidebarOpen(true)}
              className="flex items-center gap-1 px-2 py-1.5 bg-black/60 backdrop-blur-xl rounded-lg border border-gray-600 transition-all hover:scale-105 text-[11px]">
              <Menu className="w-4 h-4 text-white" />
              <span className="text-white font-bold hidden sm:inline">קטגוריות</span>
            </button>

            {/* Dark/Light toggle */}
            <button onClick={() => setDarkMode(v => !v)}
              className="flex items-center gap-1 px-2 py-1.5 bg-black/60 backdrop-blur-xl rounded-lg border border-gray-600 transition-all hover:scale-105 text-[11px]"
              aria-label="Toggle dark mode">
              {darkMode ? <Moon className="w-4 h-4 text-blue-300" /> : <Sun className="w-4 h-4 text-yellow-400" />}
              <span className="text-white font-bold hidden sm:inline">{darkMode ? 'לילה' : 'יום'}</span>
            </button>

            {/* Admin */}
            <button onClick={() => window.open(createPageUrl("AdminPanel"), "_blank")}
              className="flex items-center gap-1 px-2 py-1.5 bg-black/60 backdrop-blur-xl rounded-lg border border-gray-600 transition-all hover:scale-105 text-[11px]">
              <Shield className="w-4 h-4 text-white" />
              <span className="text-white font-bold">Admin</span>
            </button>

            {/* Auth */}
            {authLoading ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-black/60 rounded-2xl">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
            ) : user ? (
              <>
                <Link to={createPageUrl("UserProfile")} className="flex items-center transition-all cursor-pointer active:scale-95 relative">
                  {user.profile_image ? (
                    <img src={user.profile_image} alt={user.full_name} className="w-9 h-9 rounded-full object-contain bg-black shadow-lg" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                      {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </div>
                  )}
                </Link>
                <button onClick={handleLogout}
                  className="flex items-center gap-1 px-2 py-1 bg-red-600/20 hover:bg-red-600/40 backdrop-blur-xl rounded-lg shadow-lg border border-red-500/30 transition-all hover:scale-105 text-[11px]">
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-300 font-bold hidden sm:inline">התנתק</span>
                </button>
              </>
            ) : (
              <button onClick={handleLogin}
                className="flex items-center gap-1 px-2 py-1 backdrop-blur-xl rounded-lg shadow-lg transition-all hover:scale-105 text-[11px] relative overflow-hidden"
                style={{ background: 'linear-gradient(90deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)', backgroundSize: '200% 100%', animation: 'rainbow 8s linear infinite', border: '2px solid rgba(255,255,255,0.3)' }}>
                <LogIn className="w-3.5 h-3.5 text-white" />
                <span className="text-white font-bold hidden sm:inline">התחבר</span>
              </button>
            )}

            {/* Reels — desktop */}
            <button onClick={() => setReelsOpen(true)}
              className="hidden sm:flex items-center gap-1 px-2 py-1 bg-[#E87722]/80 hover:bg-[#E87722] backdrop-blur-xl rounded-lg border border-orange-500/50 transition-all hover:scale-105 animate-pulse text-[11px]">
              <Radio className="w-4 h-4 text-white" />
              <span className="text-white font-bold">ריילס</span>
            </button>
          </div>
        </div>
      </div>







      {/* Videos Categories Strip - lazy loaded */}
      <React.Suspense fallback={<div className="h-[72px] bg-black/40" />}>
        <VideosCategoriesStrip />
      </React.Suspense>

      {/* News Ticker - lazy loaded */}
      <React.Suspense fallback={<div className="h-20 bg-black/40" />}>
        <NewsTicker darkMode={darkMode} setDarkMode={setDarkMode} onMenuClick={() => setMobileMenuOpen(true)} />
      </React.Suspense>



      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        initialUser={user}
      />

      {/* Reels Modal */}
      <AnimatePresence>
        {reelsOpen && <ReelsModal isOpen={reelsOpen} onClose={() => setReelsOpen(false)} />}
      </AnimatePresence>

      {/* Floating Buttons - lazy loaded */}
      <React.Suspense fallback={null}>
        <AccessibilityFloatingButton />
        <InstallAppButton />
        <PodcastsFloatingButton />
      </React.Suspense>

      {/* Sidebars - lazy loaded */}
      <React.Suspense fallback={null}>
        <RightSidebarUpdates />
      </React.Suspense>

      {/* Logo Float Animation - disabled for performance */}
      <AnimatePresence>
        {logoFloat && (
          <motion.div
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{ opacity: [0, 1, 1, 0.8, 0], scale: [0.1, 1.5, 2.5, 3.5, 5], y: [0, -20, -50, -90, -140] }}
            transition={{ duration: 1.4, ease: "easeOut", times: [0, 0.2, 0.5, 0.75, 1] }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[99998] pointer-events-none"
          >
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-[#0057B8] to-[#E31E24] shadow-2xl shadow-red-500/50 border-2 border-red-500/40 flex items-center justify-center">
              <span className="text-white font-bold text-6xl">ר</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Menu Sidebar */}
      <AnimatePresence>
        {menuSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999]"
            >
              <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setMenuSidebarOpen(false)}
              />
              <motion.nav 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute right-0 top-0 bottom-0 w-80 bg-black/90 backdrop-blur-xl border-l border-[#E31E24]/30 shadow-2xl shadow-[#E31E24]/20 overflow-y-auto"
              >
                <div className="sticky top-0 bg-gradient-to-br from-black via-[#0057B8]/30 to-black p-4 shadow-lg shadow-[#0057B8]/20 border-b-2 border-[#0057B8]/50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-white font-bold text-xl">תפריט ראשי</h2>
                    <button
                      onClick={() => setMenuSidebarOpen(false)}
                      className="p-2 rounded-full bg-[#0057B8]/30 hover:bg-[#0057B8]/50 text-white active:scale-95 transition-all shadow-[0_0_15px_#0080FF]"
                    >
                      <X size={22} />
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <button
                    onClick={() => {
                      setReportersModalOpen(true);
                      setMenuSidebarOpen(false);
                    }}
                    className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#0057B8]/30 active:bg-[#0057B8]/50 transition-all border border-transparent hover:border-[#0057B8]/50 hover:shadow-[0_0_20px_#0080FF] w-full"
                  >
                    <div className="w-10 h-10 rounded-xl bg-black/40 border-2 border-[#0057B8]/50 flex items-center justify-center shadow-[0_0_15px_#0080FF]">
                      <Users size={20} className="text-[#0057B8]" />
                    </div>
                    <span className="flex-1 font-medium text-right">כתבים</span>
                    <ChevronLeft size={18} className="text-[#0057B8]" />
                  </button>

                  <Link
                    to={createPageUrl("VODContent")}
                    onClick={() => setMenuSidebarOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#E31E24]/20 active:bg-[#E31E24]/40 transition-all border border-transparent hover:border-[#E31E24]/30"
                  >
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-[#E31E24]/20 flex items-center justify-center">
                      <Tv size={20} className="text-[#E31E24]" />
                    </div>
                    <span className="flex-1 font-medium">VOD</span>
                    <ChevronLeft size={18} className="text-[#E31E24]" />
                  </Link>

                  <button
                    onClick={() => {
                      setDidChatOpen(true);
                      setMenuSidebarOpen(false);
                    }}
                    className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#E31E24]/20 active:bg-[#E31E24]/40 transition-all border border-transparent hover:border-[#E31E24]/30 w-full animate-pulse"
                  >
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-green-500/20 flex items-center justify-center">
                      <MessageCircle size={20} className="text-green-500" />
                    </div>
                    <span className="flex-1 font-medium text-green-300">צ'אט חי</span>
                    <ChevronLeft size={18} className="text-green-500" />
                  </button>

                  <button
                    onClick={() => {
                      setCategoriesSidebarOpen(true);
                      setMenuSidebarOpen(false);
                    }}
                    className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#E31E24]/20 active:bg-[#E31E24]/40 transition-all border border-transparent hover:border-[#E31E24]/30 w-full"
                  >
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-[#E31E24]/20 flex items-center justify-center">
                      <Newspaper size={20} className="text-[#E31E24]" />
                    </div>
                    <span className="flex-1 font-medium">קטגוריות</span>
                    <ChevronLeft size={18} className="text-[#E31E24]" />
                  </button>

                  <Link
                    to={createPageUrl("Live")}
                    onClick={() => setMenuSidebarOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#E31E24]/20 active:bg-[#E31E24]/40 transition-all border border-transparent hover:border-[#E31E24]/30 animate-pulse"
                  >
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-[#E31E24]/20 flex items-center justify-center">
                      <Radio size={20} className="text-[#E31E24]" />
                    </div>
                    <span className="flex-1 font-medium text-[#E31E24]">שידור חי</span>
                    <ChevronLeft size={18} className="text-[#E31E24]" />
                  </Link>

                  <Link
                    to={createPageUrl("AIDesignStudio")}
                    onClick={() => setMenuSidebarOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#E31E24]/20 active:bg-[#E31E24]/40 transition-all border border-transparent hover:border-[#E31E24]/30"
                  >
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-purple-500/20 flex items-center justify-center">
                      <Sparkles size={20} className="text-purple-500" />
                    </div>
                    <span className="flex-1 font-medium">AI Design</span>
                    <ChevronLeft size={18} className="text-[#E31E24]" />
                  </Link>

                  <Link
                    to={createPageUrl("VideoCreator")}
                    onClick={() => setMenuSidebarOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#E31E24]/20 active:bg-[#E31E24]/40 transition-all border border-transparent hover:border-[#E31E24]/30 animate-pulse"
                  >
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-purple-500/20 flex items-center justify-center">
                      <Sparkles size={20} className="text-purple-500" />
                    </div>
                    <span className="flex-1 font-medium text-purple-300">יוצר סרטונים AI</span>
                    <ChevronLeft size={18} className="text-purple-500" />
                  </Link>

                  {user?.role === 'admin' && (
                    <a
                      href={createPageUrl("AdminPanel")}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuSidebarOpen(false)}
                      className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#E31E24]/20 active:bg-[#E31E24]/40 transition-all border border-transparent hover:border-[#E31E24]/30"
                    >
                      <div className="w-10 h-10 rounded-xl bg-black/40 border border-purple-500/20 flex items-center justify-center">
                        <Shield size={20} className="text-purple-500" />
                      </div>
                      <span className="flex-1 font-medium">ניהול האתר</span>
                      <ChevronLeft size={18} className="text-[#E31E24]" />
                    </a>
                  )}

                  <a
                    href={createPageUrl("VideoCreator")}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuSidebarOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#E31E24]/20 active:bg-[#E31E24]/40 transition-all border border-transparent hover:border-[#E31E24]/30 animate-pulse"
                  >
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-green-500/20 flex items-center justify-center">
                      <Sparkles size={20} className="text-green-500" />
                    </div>
                    <span className="flex-1 font-medium text-green-300">יוצר AI</span>
                    <ChevronLeft size={18} className="text-green-500" />
                  </a>

                  <Link
                    to={createPageUrl("VideoEditor")}
                    onClick={() => setMenuSidebarOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#E31E24]/20 active:bg-[#E31E24]/40 transition-all border border-transparent hover:border-[#E31E24]/30"
                  >
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-[#E31E24]/20 flex items-center justify-center">
                      <Film size={20} className="text-[#E31E24]" />
                    </div>
                    <span className="flex-1 font-medium">עורך מתקדם</span>
                    <ChevronLeft size={18} className="text-[#E31E24]" />
                  </Link>

                  <a
                    href={createPageUrl("LumaStudio")}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuSidebarOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#E31E24]/20 active:bg-[#E31E24]/40 transition-all border border-transparent hover:border-[#E31E24]/30"
                  >
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-[#E31E24]/20 flex items-center justify-center">
                      <Clapperboard size={20} className="text-[#E31E24]" />
                    </div>
                    <span className="flex-1 font-medium">Luma AI</span>
                    <ChevronLeft size={18} className="text-[#E31E24]" />
                  </a>

                  <a
                    href={createPageUrl("ToMovieeStudio")}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuSidebarOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#E31E24]/20 active:bg-[#E31E24]/40 transition-all border border-transparent hover:border-[#E31E24]/30"
                  >
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-purple-500/20 flex items-center justify-center">
                      <Film size={20} className="text-purple-500" />
                    </div>
                    <span className="flex-1 font-medium">ToMoviee</span>
                    <ChevronLeft size={18} className="text-purple-500" />
                  </a>

                  <Link
                    to={createPageUrl("AIDesignStudio")}
                    onClick={() => setMenuSidebarOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#E31E24]/20 active:bg-[#E31E24]/40 transition-all border border-transparent hover:border-[#E31E24]/30"
                  >
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-pink-500/20 flex items-center justify-center">
                      <Sparkles size={20} className="text-pink-500" />
                    </div>
                    <span className="flex-1 font-medium">AI Design</span>
                    <ChevronLeft size={18} className="text-pink-500" />
                  </Link>
                </div>
              </motion.nav>
            </motion.div>
          )}
      </AnimatePresence>

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
                className="absolute right-0 top-0 bottom-0 w-64 bg-black/90 backdrop-blur-xl border-l border-[#0057B8]/30 shadow-2xl shadow-[#0057B8]/20 overflow-y-auto"
              >
                <div className="sticky top-0 bg-gradient-to-br from-black via-[#0057B8]/20 to-black p-4 shadow-lg border-b border-[#0057B8]/30">
                  <div className="flex items-center justify-between">
                    <h2 className="text-white font-bold">קטגוריות</h2>
                    <button
                      onClick={() => setCategoriesSidebarOpen(false)}
                      className="p-2 rounded-full bg-[#0057B8]/20 hover:bg-[#0057B8]/40 text-white active:scale-95 transition-all"
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
                      className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#0057B8]/20 active:bg-[#0057B8]/40 transition-all border border-transparent hover:border-[#0057B8]/30"
                    >
                      <div className="w-10 h-10 rounded-xl bg-black/40 border border-[#0057B8]/20 flex items-center justify-center">
                        <cat.icon size={20} className="text-[#0057B8]" />
                      </div>
                      <span className="flex-1 font-medium">{cat.label}</span>
                      <ChevronLeft size={18} className="text-[#0057B8]" />
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
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#0057B8] to-[#E31E24] flex items-center justify-center">
                      <span className="text-white font-bold text-lg">ר</span>
                    </div>
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

                {/* Auth Section */}
                {user && (
                  <div className="p-4 border-b border-[#E31E24]/30">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-2xl border border-green-500/30 mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                      <div className="flex-1">
                        <p className="text-green-300 font-bold text-sm">{user.full_name || user.email}</p>
                        <p className="text-green-200/70 text-xs">מחובר</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-2xl font-bold transition-all border border-red-500/30"
                    >
                      <LogOut size={18} />
                      התנתק
                    </button>
                  </div>
                )}

                {!user && (
                  <div className="p-4 border-b border-[#E31E24]/30">
                    <button
                      onClick={() => {
                        handleLogin();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all border border-blue-500/30"
                    >
                      <LogIn size={18} />
                      התחבר
                    </button>
                  </div>
                )}

                {/* Menu Items */}
                <div className="p-4 space-y-1">

                <Link
                  to={createPageUrl("VideoCreator")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#E31E24]/20 active:bg-[#E31E24]/40 transition-all border border-transparent hover:border-[#E31E24]/30 animate-pulse"
                >
                  <div className="w-10 h-10 rounded-xl bg-black/40 border border-purple-500/20 flex items-center justify-center">
                    <Sparkles size={20} className="text-purple-500" />
                  </div>
                  <span className="flex-1 font-medium text-purple-300">יוצר סרטונים AI</span>
                  <ChevronLeft size={18} className="text-purple-500" />
                </Link>

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
              {/* Left Sidebar - lazy */}
              <React.Suspense fallback={null}>
                <LeftSidebarCategories />
              </React.Suspense>

              {/* Main Content */}
              <main className="flex-1 px-0 sm:px-4 py-0 sm:py-6 pb-16 sm:pb-24 lg:pb-6 max-w-7xl mx-auto">
                {children}
              </main>

              {/* Right Sidebar - lazy */}
              <React.Suspense fallback={null}>
                <RightSidebarCategories />
              </React.Suspense>
            </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-gray-700 z-[9999] safe-area-inset-bottom shadow-lg">
        <div className="grid grid-cols-5 gap-1 px-2 py-3">
          <Link
            to={createPageUrl("Home")}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl active:bg-gray-700/30 transition-colors touch-manipulation relative z-[110]"
            >
            <Home size={24} className="text-gray-300 mb-1" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-gray-300">בית</span>
          </Link>

          <button
            onClick={() => setReelsOpen(true)}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl active:bg-gray-700/30 transition-colors touch-manipulation"
          >
            <Radio size={24} className="text-red-400 mb-1" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-red-400">ריילס</span>
          </button>

          <div className="relative flex flex-col items-center">
            <Link
              to={createPageUrl("VideoCreator")}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl active:bg-gray-700/30 transition-colors touch-manipulation"
            >
              <Sparkles size={24} className="text-gray-300 mb-1" strokeWidth={2.5} />
              <span className="text-[10px] font-bold text-gray-300">AI</span>
            </Link>
          </div>

          <button
            onClick={() => setCategoriesSidebarOpen(true)}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl active:bg-gray-700/30 transition-colors touch-manipulation"
          >
            <Menu size={24} className="text-gray-300 mb-1" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-gray-300">תפריט</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#060c18] via-[#0d2a5e]/40 to-[#060c18] border-t-2 border-[#1565C0]/50 shadow-[0_-10px_50px_rgba(21,101,192,0.3)] text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="h-16 w-16 mb-4 rounded-full bg-gradient-to-br from-[#0057B8] to-[#E31E24] flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">ר</span>
              </div>
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
                className="inline-flex items-center gap-2 bg-[#E87722] text-white px-6 py-3 rounded-full hover:bg-[#c25e00] transition-all"
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