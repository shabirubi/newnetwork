import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Radio, Film, Newspaper, Cloud, Globe, Trophy, Tv, Users, Eye, Volume2, Music, ChevronUp } from "lucide-react";
import VODPlayer from "./VODPlayer";
import LivePlayer from "../news/LivePlayer";

const CATEGORIES = [
  { id: "channels", label: "תחנות שידור בישראל", icon: Tv },
  { id: "movies", label: "סרטים קלאסיים", icon: Film },
  { id: "news", label: "חדשות ואקטואליה", icon: Newspaper },
  { id: "forecast", label: "תחזית מזג אויר", icon: Cloud },
  { id: "current_affairs", label: "תוכניות אקטואליה", icon: Tv },
  { id: "ethnic", label: "תרבות ואתניות", icon: Users },
  { id: "sports", label: "ספורט ואתלטיקה", icon: Trophy },
  { id: "drama", label: "דרמה וסדרות", icon: Tv },
  { id: "series", label: "סדרות וריאליטי", icon: Tv },
  { id: "global", label: "ערוצים בינלאומיים", icon: Globe },
  { id: "documentaries", label: "דוקומנטרי ותעודה", icon: Film },
  { id: "kids", label: "ילדים ונוער", icon: Users },
  { id: "music", label: "מוזיקה וקליפים", icon: Music },
  { id: "lifestyle", label: "סגנון חיים ובריאות", icon: Tv },
  { id: "food", label: "אוכל ובישול", icon: Tv },
  { id: "tech", label: "טכנולוגיה וחדשנות", icon: Tv },
  { id: "history", label: "היסטוריה ותרבות", icon: Film },
  { id: "science", label: "מדע וטבע", icon: Globe },
  { id: "comedy", label: "קומדיה ובידור", icon: Tv },
  { id: "religion", label: "דת ורוחניות", icon: Tv }
];

export default function VODModal({ isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState("channels");
  const [selectedContent, setSelectedContent] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMainPlayer, setShowMainPlayer] = useState(true);
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const { data: channels = [] } = useQuery({
    queryKey: ['channels'],
    queryFn: () => base44.entities.NewsChannel.filter({ is_active: true }, 'name'),
    initialData: [],
    enabled: isOpen && activeCategory === 'channels'
  });

  const { data: content = [], isLoading } = useQuery({
    queryKey: ['vod-content', activeCategory],
    queryFn: () => {
      if (activeCategory === 'channels') {
        return channels.map(ch => ({
          id: ch.id,
          title: ch.name,
          description: ch.description || '',
          stream_url: ch.stream_url,
          is_live: true,
          thumbnail: `https://images.unsplash.com/photo-1587739920494-8281e212fc14?w=400&h=225&fit=crop`,
          strip_name: 'תחנות שידור ישראליות'
        }));
      }
      return base44.entities.VODContent.filter({ category: activeCategory }, 'order');
    },
    initialData: [],
    enabled: isOpen
  });

  const { data: breakingNews = [] } = useQuery({
    queryKey: ['breaking-news-vod'],
    queryFn: () => base44.entities.NewsArticle.filter({ is_breaking: true }, '-created_date', 10),
    initialData: [],
    enabled: isOpen,
    refetchInterval: 30000
  });

  const groupedByStrip = content.reduce((acc, item) => {
    const stripName = item.strip_name || "תוכן מומלץ";
    if (!acc[stripName]) {
      acc[stripName] = [];
    }
    acc[stripName].push(item);
    return acc;
  }, {});

  if (!isOpen) return null;

  const STUDIO_BG = "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&q=80";

  return (
    <AnimatePresence>
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         className="fixed inset-0 z-[105] bg-gradient-to-br from-gray-950 via-black to-gray-950"
       >
        {/* Back Button - Left Side */}
        <motion.button
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-50 bg-gradient-to-br from-black via-red-900 to-black hover:from-red-900 hover:via-black hover:to-red-900 text-white px-4 py-6 rounded-2xl font-bold shadow-2xl border-2 border-red-600/50 transition-all"
        >
          <div className="flex flex-col items-center gap-2">
            <ChevronUp className="w-6 h-6 rotate-90" />
            <span className="text-xs whitespace-nowrap writing-mode-vertical">חזרה לאתר</span>
          </div>
        </motion.button>

        {/* Main Layout */}
        <div className="flex h-screen w-screen">
          {/* Sidebar - Desktop Only */}
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="hidden lg:flex flex-col w-72 bg-gradient-to-b from-gray-900/98 via-black/98 to-gray-900/98 backdrop-blur-xl border-l border-red-900/30 p-6 shadow-2xl"
          >
            {/* Logo */}
            <div className="mb-6">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png"
                alt="הרשת החדשה"
                className="w-24 h-24 mx-auto drop-shadow-2xl"
              />
              <motion.h2 
                className="text-4xl font-bold text-center mt-4 bg-gradient-to-l from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  filter: [
                    'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))',
                    'drop-shadow(0 0 20px rgba(239, 68, 68, 0.8))',
                    'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ backgroundSize: '200% 200%' }}
              >
                VOD
              </motion.h2>
            </div>



            {/* Categories */}
            <nav className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-red-900 scrollbar-track-gray-900">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <motion.button
                    key={cat.id}
                    whileHover={{ x: 8 }}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-right ${
                      activeCategory === cat.id
                        ? 'bg-gradient-to-l from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{cat.label}</span>
                  </motion.button>
                );
              })}
            </nav>
          </motion.aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Mobile Header with Back Button */}
            <div className="lg:hidden sticky top-0 z-40 bg-gradient-to-b from-black via-gray-900 to-transparent backdrop-blur-xl border-b border-red-900/30 p-3">
              <div className="flex items-center justify-between mb-3">
                <motion.h1 
                  className="text-2xl font-bold bg-gradient-to-l from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    filter: [
                      'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))',
                      'drop-shadow(0 0 15px rgba(239, 68, 68, 0.8))',
                      'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  VOD
                </motion.h1>

              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm flex-shrink-0 transition-all ${
                        activeCategory === cat.id
                          ? 'bg-gradient-to-l from-red-600 to-red-700 text-white shadow-lg'
                          : 'bg-gray-800/50 text-gray-400 border border-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden xs:inline">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hero Section with Full Screen Player */}
            {!isFullscreen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-[75vh] flex-shrink-0 bg-gradient-to-br from-gray-950 via-black to-gray-950 p-4 lg:p-6"
              >
                {/* Player Frame */}
                <div className="relative h-full rounded-2xl overflow-hidden border-4 border-red-600/50 shadow-2xl shadow-red-600/30 group cursor-pointer">
                  {/* Top Bar with Logo */}
                  <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/90 to-transparent p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png"
                        alt="הרשת החדשה"
                        className="w-12 h-12 lg:w-16 lg:h-16 drop-shadow-2xl"
                      />
                      <div>
                        <h3 className="text-white font-bold text-sm lg:text-lg">הרשת החדשה</h3>
                        <p className="text-red-500 text-xs lg:text-sm font-bold">VOD - שידור חי</p>
                      </div>
                    </div>
                    <div className="bg-red-600 px-3 py-1 lg:px-4 lg:py-2 rounded-full flex items-center gap-2 animate-pulse">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                      <span className="text-white text-xs lg:text-sm font-bold">LIVE</span>
                    </div>
                  </div>

                  {/* Play Button Overlay */}
                  <div 
                    onClick={() => setIsFullscreen(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-red-600 rounded-full p-8 shadow-2xl"
                    >
                      <Play className="w-16 h-16 text-white" fill="white" />
                    </motion.div>
                  </div>

                  {/* Video Player */}
                  <iframe 
                    src="https://www.mako.co.il/AjaxPage?jspName=embedHTML5video.jsp&galleryChannelId=3bf5c3a8e967f510VgnVCM2000002a0c10acRCRD&videoChannelId=8bf955222beab610VgnVCM100000700a10acRCRD&vcmid=1e2258089b67f510VgnVCM2000002a0c10acRCRD"
                    className="w-full h-full pointer-events-none"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay"
                  />

                  {/* Bottom Bar with Branding */}
                  <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 to-transparent p-3 lg:p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Radio className="w-4 h-4 lg:w-5 lg:h-5 text-red-500 animate-pulse" />
                      <span className="text-white text-xs lg:text-sm font-bold">משודר בחסות הרשת החדשה</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Fullscreen Player */}
            {isFullscreen && activeCategory === "channels" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-[200] bg-black"
              >
                {/* Top Bar with Logo */}
                <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/95 to-transparent p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png"
                      alt="הרשת החדשה"
                      className="w-16 h-16 lg:w-20 lg:h-20 drop-shadow-2xl"
                    />
                    <div>
                      <h3 className="text-white font-bold text-xl lg:text-2xl">הרשת החדשה</h3>
                      <p className="text-red-500 text-sm lg:text-base font-bold">VOD - שידור חי</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-red-600 px-5 py-3 rounded-full flex items-center gap-2 animate-pulse">
                      <span className="w-3 h-3 bg-white rounded-full"></span>
                      <span className="text-white text-base font-bold">LIVE</span>
                    </div>
                    <button
                      onClick={() => setIsFullscreen(false)}
                      className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>

                {/* Video Player */}
                <iframe 
                  src="https://www.mako.co.il/AjaxPage?jspName=embedHTML5video.jsp&galleryChannelId=3bf5c3a8e967f510VgnVCM2000002a0c10acRCRD&videoChannelId=8bf955222beab610VgnVCM100000700a10acRCRD&vcmid=1e2258089b67f510VgnVCM2000002a0c10acRCRD"
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay"
                />

                {/* Bottom Bar with Branding */}
                <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/95 to-transparent p-6">
                  <div className="flex items-center justify-center gap-3">
                    <Radio className="w-6 h-6 text-red-500 animate-pulse" />
                    <span className="text-white text-lg font-bold">משודר בחסות הרשת החדשה</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* No Israeli TV Channels - Only Main Player */}
            <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg">השתמש בנגן למעלה לצפייה</p>
              </div>
            </main>
          </div>
        </div>

        {/* Player Modal */}
        <AnimatePresence>
          {selectedContent && (
            <VODPlayer
              content={selectedContent}
              onClose={() => setSelectedContent(null)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}