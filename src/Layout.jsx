import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { 
  Menu, X, Radio, Newspaper, Shield, TrendingUp, 
  Vote, Cpu, Trophy, Clapperboard, Globe, Heart,
  Clock, ChevronLeft, Users, Moon, Sun, Home, Flame,
  Siren, AlertTriangle, MessageSquareWarning, Film, Tv, User, MessageCircle, Sparkles,
  LogOut, LogIn, Loader2, Mic, Music
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
import PodcastUploadModal from "./components/home/PodcastUploadModal";

import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import UserProfileModal from "./components/user/UserProfileModal";

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
    return null;
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
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [reelsOpen, setReelsOpen] = useState(false);
  const [podcastModalOpen, setPodcastModalOpen] = useState(false);



  useEffect(() => {
    const handler = () => setReelsOpen(true);
    window.addEventListener('openReels', handler);
    return () => window.removeEventListener('openReels', handler);
  }, []);

  // בדיקת משתמש מחובר
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

  // בדיקת מצב סגירה - מבוטל לביצועים

  // דפים ללא Layout
  const noLayoutPages = ['VODContent', 'ReporterStudio', 'BroadcastStudio', 'VideoEditor', 'VideoCreator', 'ToMovieeStudio', 'AdminPanel'];
  if (noLayoutPages.includes(currentPageName)) {
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
        body { 
          background-color: ${darkMode ? '#0d1117' : '#f0f4f8'} !important; 
          color: ${darkMode ? '#e8edf5' : '#111827'} !important;
          overscroll-behavior-y: none;
        }

        /* Hide scrollbars - native mobile feel */
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        *::-webkit-scrollbar {
          display: none;
        }

        /* Native mobile interactions */
        * {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        
        /* Prevent pull-to-refresh */
        body {
          overscroll-behavior-y: contain;
        }

        /* Safe area for notched devices */
        .safe-area-top {
          padding-top: env(safe-area-inset-top);
        }
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }

      `}</style>

      {/* Native Mobile Header */}
      <div className="bg-gradient-to-b from-[#000000] to-[#0a0a0a] safe-area-top sticky top-0 z-[1000] shadow-2xl">
        <div className="px-3 py-2.5 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#0057B8] to-[#E31E24] flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
              <video
                src="https://media.base44.com/videos/public/695b39080025f4d38a586978/8e449bcbb_shavit1313.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-col">
              <h1 className="text-sm font-bold text-white leading-tight">הרשת החדשה</h1>
              <p className="text-[9px] text-gray-400">חדשות 24/7</p>
            </div>
          </div>

          {/* Breaking News Ticker */}
          <div className="flex-1 mx-2 overflow-hidden">
            <TypewriterDate />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            {/* Reels */}
            <button onClick={() => setReelsOpen(true)}
              className="p-2 bg-gradient-to-br from-red-600 to-red-700 rounded-full active:scale-90 transition-transform">
              <Radio className="w-4 h-4 text-white" />
            </button>

            {/* Video Creator */}
            <Link to={createPageUrl("VideoCreator")}
              className="p-2 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full active:scale-90 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </Link>

            {/* Podcast Upload */}
            <button onClick={() => setPodcastModalOpen(true)}
              className="p-2 bg-[#1DB954] rounded-full active:scale-90 transition-transform">
              <Music className="w-4 h-4 text-white" />
            </button>

            {/* Dark Mode */}
            <button onClick={() => setDarkMode(v => !v)}
              className="p-2 bg-white/10 rounded-full active:scale-90 transition-transform">
              {darkMode ? <Moon className="w-4 h-4 text-blue-300" /> : <Sun className="w-4 h-4 text-yellow-400" />}
            </button>
            
            {/* Profile */}
            {authLoading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : user ? (
              <Link to={createPageUrl("UserProfile")} className="active:scale-90 transition-transform">
                {user.profile_image ? (
                  <img src={user.profile_image} alt="" className="w-8 h-8 rounded-full object-cover border border-white/20" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                )}
              </Link>
            ) : (
              <button onClick={handleLogin} className="p-2 bg-blue-600 rounded-full active:scale-90">
                <LogIn className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>











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

      {/* Podcast Upload Modal */}
      <AnimatePresence>
        {podcastModalOpen && (
          <PodcastUploadModal
            isOpen={podcastModalOpen}
            onClose={() => setPodcastModalOpen(false)}
            onUploaded={() => setPodcastModalOpen(false)}
          />
        )}
      </AnimatePresence>



      {/* Sidebars - lazy loaded */}
      <React.Suspense fallback={null}>
        <RightSidebarUpdates />
      </React.Suspense>



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
                    className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#E31E24]/20 active:bg-[#E31E24]/40 transition-all border border-transparent hover:border-[#E31E24]/30 w-full"
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
                    className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#E31E24]/20 active:bg-[#E31E24]/40 transition-all border border-transparent hover:border-[#E31E24]/30"
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
                    className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#E31E24]/20 active:bg-[#E31E24]/40 transition-all border border-transparent hover:border-[#E31E24]/30"
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
                    className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#E31E24]/20 active:bg-[#E31E24]/40 transition-all border border-transparent hover:border-[#E31E24]/30"
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
                transition={{ duration: 0.3 }}
                className="absolute right-0 top-0 bottom-0 w-64 bg-black/90 backdrop-blur-xl border-l border-[#0057B8]/30 shadow-2xl overflow-y-auto"
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
                      className="p-2 rounded-full bg-[#E31E24]/20 hover:bg-[#E31E24]/40 text-white transition-all"
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
                    className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-[#E31E24] to-[#B91C1C] text-white rounded-2xl font-bold shadow-lg"
                  >
                    <Radio size={20} />
                    שידור חי
                  </Link>
                </div>

                {/* Auth Section */}
                {user && (
                  <div className="p-4 border-b border-[#E31E24]/30">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-2xl border border-green-500/30 mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
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
                  className="flex items-center gap-4 px-4 py-4 text-gray-200 rounded-2xl hover:bg-[#E31E24]/20 active:bg-[#E31E24]/40 transition-all border border-transparent hover:border-[#E31E24]/30"
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



      {/* Main Content - Mobile First */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Native Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0a] to-[#000000] safe-area-bottom z-[1000] border-t border-white/10">
        <div className="grid grid-cols-4 gap-1 px-1 py-2">
          <Link
            to={createPageUrl("Home")}
            className="flex flex-col items-center justify-center py-2 active:scale-90 transition-transform"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center mb-0.5">
              <Home size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[9px] font-bold text-white">בית</span>
          </Link>

          <button
            onClick={() => setReelsOpen(true)}
            className="flex flex-col items-center justify-center py-2 active:scale-90 transition-transform"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center mb-0.5">
              <Radio size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[9px] font-bold text-white">ריילס</span>
          </button>

          <Link
            to={createPageUrl("VideoCreator")}
            className="flex flex-col items-center justify-center py-2 active:scale-90 transition-transform"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center mb-0.5">
              <Sparkles size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[9px] font-bold text-white">AI</span>
          </Link>

          <button
            onClick={() => setCategoriesSidebarOpen(true)}
            className="flex flex-col items-center justify-center py-2 active:scale-90 transition-transform"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center mb-0.5">
              <Menu size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[9px] font-bold text-white">תפריט</span>
          </button>
        </div>
      </nav>

      {/* Compact Footer */}
      <footer className="bg-[#0a0a0a] border-t border-white/10 py-6 mt-8">
        <div className="px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0057B8] to-[#E31E24] flex items-center justify-center">
              <span className="text-white font-bold text-xs">ר</span>
            </div>
            <span className="text-white font-bold text-sm">הרשת החדשה</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-[10px] text-gray-500 mb-3">
            <Link to={createPageUrl("Terms")} className="hover:text-white">תקנון</Link>
            <span>•</span>
            <Link to={createPageUrl("Accessibility")} className="hover:text-white">נגישות</Link>
            <span>•</span>
            <a href="mailto:privacy@hareshet.co.il" className="hover:text-white">צור קשר</a>
          </div>
          <p className="text-gray-600 text-[9px]">© 2024 הרשת החדשה</p>
        </div>
      </footer>
    </div>
  );
}