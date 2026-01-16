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
         transition={{ duration: 0.3, ease: "easeOut" }}
         className="fixed inset-0 z-[105] bg-black/50 backdrop-blur-2xl flex items-center justify-center p-4"
         onClick={(e) => {
           if (e.target === e.currentTarget && !selectedContent) {
             onClose();
           }
         }}
       >
         <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 20 }}
           transition={{ duration: 0.3, ease: "easeOut" }}
           className="relative w-full h-full max-w-6xl max-h-[90vh] bg-black rounded-3xl shadow-2xl flex flex-col overflow-hidden"
           onClick={(e) => e.stopPropagation()}
         >
        <style>{`
          @keyframes tickerScroll {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .news-ticker {
            animation: tickerScroll 40s linear infinite;
          }
          .news-ticker:hover {
            animation-play-state: paused;
          }
        `}</style>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[120] p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-2xl"
        >
          <X className="w-6 h-6" />
        </button>



        {/* Content Wrapper with Scrolling */}
         <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
           {/* Desktop Categories */}
           <nav className="hidden lg:sticky lg:top-0 lg:z-40 lg:block flex-shrink-0 bg-gradient-to-b from-black/90 via-black/80 to-black/50 backdrop-blur-lg border-b border-red-600/20 overflow-x-auto">
             <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex gap-1.5 sm:gap-2">
               {CATEGORIES.map((cat) => {
                 const Icon = cat.icon;
                 return (
                   <button
                     key={cat.id}
                     onClick={() => setActiveCategory(cat.id)}
                     className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap text-xs sm:text-sm transition-all ${
                       activeCategory === cat.id
                         ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
                         : 'bg-gray-900/50 border border-red-900/30 text-red-500 hover:bg-red-900/30'
                     }`}
                   >
                     <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                     <span>{cat.label}</span>
                   </button>
                 );
               })}
             </div>
           </nav>

           {/* Mobile Categories */}
           <div className="lg:hidden flex-shrink-0 bg-gradient-to-b from-black/90 via-black/80 to-black/50 backdrop-blur-lg border-b border-red-600/20 p-2">
             <div className="flex gap-2 overflow-x-auto pb-2">
               {CATEGORIES.map((cat) => {
                 const Icon = cat.icon;
                 return (
                   <button
                     key={cat.id}
                     onClick={() => setActiveCategory(cat.id)}
                     className={`flex items-center gap-1 px-3 py-2 rounded-full whitespace-nowrap text-xs transition-all flex-shrink-0 ${
                       activeCategory === cat.id
                         ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
                         : 'bg-gray-900/50 border border-red-900/30 text-red-500 hover:bg-red-900/30'
                     }`}
                   >
                     <Icon className="w-3 h-3" />
                     <span className="hidden xs:inline">{cat.label}</span>
                   </button>
                 );
               })}
             </div>
           </div>

           {/* Main Studio Player */}
           {showMainPlayer && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="relative flex-shrink-0"
             >
               <div 
                 className="relative h-[30vh] sm:h-[40vh] bg-cover bg-center"
                 style={{
                   backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('${STUDIO_BG}')`
                 }}
               >
                 {/* Watermark Logo */}
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 0.3 }}
                   className="absolute top-4 left-4 z-10"
                 >
                   <img 
                     src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png"
                     alt="Logo"
                     className="w-16 h-16 sm:w-24 sm:h-24 drop-shadow-2xl"
                   />
                 </motion.div>

                 {/* Studio Overlay */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                   <motion.div
                     animate={{ 
                       scale: [1, 1.05, 1],
                       rotate: [0, 5, 0, -5, 0]
                     }}
                     transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                     className="relative mb-6"
                   >
                     <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-red-600 via-blue-600 to-red-600 opacity-60 rounded-full"></div>
                     <img 
                       src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png"
                       alt="Logo"
                       className="relative w-32 h-32 sm:w-48 sm:h-48 drop-shadow-2xl"
                     />
                   </motion.div>
                   <h2 className="text-2xl sm:text-4xl font-bold mb-2 text-center">אולפן הרשת החדשה</h2>
                   <p className="text-sm sm:text-lg text-red-300 mb-4 text-center">שידור חי עם פאנל הכתבים שלנו</p>
                   <div className="flex gap-3 mt-4">
                     <motion.button
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       className="bg-red-600 hover:bg-red-700 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg flex items-center gap-2"
                     >
                       <Play className="w-5 h-5" fill="white" />
                       צפה בשידור
                     </motion.button>
                     <motion.button
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       className="bg-white/10 backdrop-blur hover:bg-white/20 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg flex items-center gap-2"
                     >
                       <Music className="w-5 h-5" />
                       מוזיקה
                     </motion.button>
                   </div>
                 </div>

                 {/* Live Indicator */}
                 <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 rounded-full flex items-center gap-2 animate-pulse">
                   <span className="w-2 h-2 bg-white rounded-full"></span>
                   <span className="text-sm font-bold">ON AIR</span>
                 </div>

                 {/* Viewer Count */}
                 <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur text-white px-4 py-2 rounded-full flex items-center gap-2">
                   <Eye className="w-4 h-4" />
                   <span className="text-sm font-bold">3,456 צופים</span>
                 </div>
               </div>
             </motion.div>
           )}

           {/* Mobile TikTok-Style Content */}
           <main className="lg:hidden flex-1 overflow-y-scroll snap-y snap-mandatory">
          {isLoading ? (
            <div className="h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
            </div>
          ) : Object.keys(groupedByStrip).length === 0 ? (
            <div className="h-screen flex items-center justify-center">
              <div className="text-center">
                <Film className="w-16 h-16 text-red-600 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">אין תוכן זמין</h3>
                <p className="text-base text-gray-500">נסה קטגוריה אחרת</p>
              </div>
            </div>
          ) : (
            Object.entries(groupedByStrip).flatMap(([stripName, items]) => 
              items.map((item) => (
                <motion.div
                  key={item.id}
                  className="h-screen snap-start relative flex items-center justify-center bg-gradient-to-b from-gray-900 to-black"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                >
                  {/* Background */}
                  {item.thumbnail && (
                    <div className="absolute inset-0">
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover opacity-40" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="relative z-10 w-full px-6 pb-32">
                    {/* Category Badge */}
                    <div className="mb-4">
                      {item.is_live && (
                        <div className="inline-flex items-center gap-2 bg-red-600 text-white text-sm px-3 py-1.5 rounded-full mb-3">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                          LIVE
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-white text-3xl font-bold mb-3 leading-tight">{item.title}</h3>

                    {/* Description */}
                    {item.description && (
                      <p className="text-white/80 text-base mb-4 line-clamp-3">{item.description}</p>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-white/70 text-sm mb-6">
                      {item.duration && <span>{item.duration}</span>}
                      {item.genre && <span>• {item.genre}</span>}
                      {item.viewers > 0 && <span>• {item.viewers} צופים</span>}
                    </div>

                    {/* Play Button */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedContent(item)}
                      className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 shadow-2xl"
                    >
                      <Play className="w-6 h-6" fill="white" />
                      צפה עכשיו
                    </motion.button>
                  </div>

                  {/* Side Actions */}
                  <div className="absolute left-4 bottom-40 flex flex-col gap-6 z-10">
                    <button className="flex flex-col items-center gap-1 text-white">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Eye className="w-6 h-6" />
                      </div>
                      <span className="text-xs">{item.viewers || 0}</span>
                    </button>
                  </div>
                </motion.div>
              ))
            )
          )}
          </main>

          {/* Desktop Content - Original Grid */}
          <main className="hidden lg:block flex-1 overflow-y-auto w-full px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
            </div>
          ) : Object.keys(groupedByStrip).length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Film className="w-12 h-12 sm:w-16 sm:h-16 text-red-600 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-400 mb-2">אין תוכן זמין</h3>
              <p className="text-sm sm:text-base text-gray-500">נסה קטגוריה אחרת או חזור מאוחר יותר</p>
            </motion.div>
          ) : (
            Object.entries(groupedByStrip).map(([stripName, items]) => (
              <motion.section
                key={stripName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 sm:space-y-3"
              >
                <h2 className="text-base sm:text-xl font-bold border-l-4 border-red-600 pl-2 sm:pl-3">
                  {stripName}
                </h2>
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-red-900 scrollbar-track-gray-900">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedContent(item)}
                      className="min-w-[160px] sm:min-w-[200px] max-w-[180px] sm:max-w-[240px] bg-gray-900/50 rounded-lg overflow-hidden border border-red-900/30 cursor-pointer hover:border-red-600 transition-all group"
                    >
                      <div
                        className="h-24 sm:h-32 bg-cover bg-center relative"
                        style={{
                          backgroundImage: item.thumbnail
                            ? `url('${item.thumbnail}')`
                            : 'linear-gradient(135deg, #550000, #000000)'
                        }}
                      >
                        {item.is_live && (
                          <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-red-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1 animate-pulse">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></span>
                            LIVE
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="white" />
                        </div>
                      </div>
                      <div className="p-2 sm:p-3">
                        <h3 className="font-bold text-xs sm:text-sm mb-1 line-clamp-2">{item.title}</h3>
                        <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-1">
                          {[
                            item.duration,
                            item.genre,
                            item.viewers ? `${item.viewers} צופים` : null
                          ].filter(Boolean).join(' • ')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ))
          )}
          </main>

          {/* Player Modal */}
          <AnimatePresence>
            {selectedContent && (
              <VODPlayer
                content={selectedContent}
                onClose={() => setSelectedContent(null)}
              />
            )}
          </AnimatePresence>
          </div>
          </motion.div>
          </motion.div>
          </AnimatePresence>
          );
          }