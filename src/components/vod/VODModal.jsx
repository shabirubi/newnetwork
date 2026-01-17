import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Radio, Film, Newspaper, Cloud, Globe, Trophy, Tv, Users, Eye, Volume2, Music, ChevronUp } from "lucide-react";
import VODPlayer from "./VODPlayer";
import LivePlayer from "../news/LivePlayer";

const CATEGORIES = [
  { id: "live", label: "עולם התוכן של הרשת החדשה", icon: Radio },
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
  const [activeCategory, setActiveCategory] = useState("live");
  const [selectedContent, setSelectedContent] = useState(null);
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

            {/* Back to News Button */}
            <motion.button
              whileHover={{ scale: 1.02, x: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="mb-6 w-full bg-gradient-to-l from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all"
            >
              <ChevronUp className="w-5 h-5 rotate-90" />
              <span>חזרה לאתר החדשות</span>
            </motion.button>

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
                <button
                  onClick={onClose}
                  className="bg-gradient-to-l from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 text-sm shadow-lg"
                >
                  <ChevronUp className="w-4 h-4 rotate-90" />
                  חזרה
                </button>
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

            {/* Hero Section with Background Player */}
            {activeCategory === "live" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-[50vh] lg:h-[60vh] flex-shrink-0"
              >
                {/* Background Video Player */}
                <div className="absolute inset-0 overflow-hidden">
                  <iframe 
                    src="https://www.mako.co.il/AjaxPage?jspName=embedHTML5video.jsp&galleryChannelId=3bf5c3a8e967f510VgnVCM2000002a0c10acRCRD&videoChannelId=8bf955222beab610VgnVCM100000700a10acRCRD&vcmid=1e2258089b67f510VgnVCM2000002a0c10acRCRD"
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay"
                  />
                </div>
              </motion.div>
            )}

            {/* Content Grid */}
            <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent"></div>
                </div>
              ) : Object.keys(groupedByStrip).length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-64"
                >
                  <Film className="w-20 h-20 text-red-600/50 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-400 mb-2">אין תוכן זמין</h3>
                  <p className="text-gray-500">נסה קטגוריה אחרת</p>
                </motion.div>
              ) : (
                <div className="space-y-10">
                  {Object.entries(groupedByStrip).map(([stripName, items]) => (
                    <motion.section
                      key={stripName}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-800 rounded-full"></span>
                        {stripName}
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {items.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.05, y: -8 }}
                            onClick={() => setSelectedContent(item)}
                            className="group relative bg-gradient-to-b from-gray-900 to-black rounded-2xl overflow-hidden cursor-pointer border border-gray-800 hover:border-red-600 transition-all shadow-lg hover:shadow-red-600/20"
                          >
                            <div className="aspect-[2/3] relative overflow-hidden">
                              {item.thumbnail ? (
                                <img 
                                  src={item.thumbnail} 
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                              
                              {item.is_live && (
                                <div className="absolute top-3 right-3 bg-red-600 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold animate-pulse">
                                  <span className="w-2 h-2 bg-white rounded-full"></span>
                                  LIVE
                                </div>
                              )}

                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-red-600 rounded-full p-4 shadow-2xl">
                                  <Play className="w-8 h-8 text-white" fill="white" />
                                </div>
                              </div>

                              <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">{item.title}</h3>
                                {item.duration && (
                                  <p className="text-gray-300 text-xs">{item.duration}</p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.section>
                  ))}
                </div>
              )}
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