import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Radio, Film, Newspaper, Cloud, Globe, Trophy, Tv, Users, Eye, ChevronUp, Music } from "lucide-react";
import VODPlayer from "../components/vod/VODPlayer";

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

export default function VOD() {
  const [activeCategory, setActiveCategory] = useState("live");
  const [selectedContent, setSelectedContent] = useState(null);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const { data: channels = [] } = useQuery({
    queryKey: ['channels'],
    queryFn: () => base44.entities.NewsChannel.filter({ is_active: true }, 'name'),
    initialData: [],
    enabled: activeCategory === 'channels'
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
    initialData: []
  });

  // קיבוץ לפי strip_name
  const groupedByStrip = content.reduce((acc, item) => {
    const stripName = item.strip_name || "תוכן מומלץ";
    if (!acc[stripName]) {
      acc[stripName] = [];
    }
    acc[stripName].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-gradient-to-r from-black/95 via-red-950/40 to-black/95 backdrop-blur-md border-b border-red-900/30"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
              <Play className="w-6 h-6 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-red-500">עולם התוכן של הרשת החדשה</h1>
              <p className="text-xs text-gray-400">{content.length} פריטים זמינים</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Categories */}
      <nav className="sticky top-[73px] z-30 bg-black/80 backdrop-blur-md border-b border-red-900/20 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
                    : 'bg-gray-900/50 border border-red-900/30 text-red-500 hover:bg-red-900/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content Strips */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
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
            <Film className="w-16 h-16 text-red-600 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">אין תוכן זמין</h3>
            <p className="text-gray-500">נסה קטגוריה אחרת או חזור מאוחר יותר</p>
          </motion.div>
        ) : (
          Object.entries(groupedByStrip).map(([stripName, items]) => (
            <motion.section
              key={stripName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <h2 className="text-xl font-bold border-l-4 border-red-600 pl-3">
                {stripName}
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-red-900 scrollbar-track-gray-900">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedContent(item)}
                    className="min-w-[200px] max-w-[240px] bg-gray-900/50 rounded-lg overflow-hidden border border-red-900/30 cursor-pointer hover:border-red-600 transition-all group"
                  >
                    <div
                      className="h-32 bg-cover bg-center relative"
                      style={{
                        backgroundImage: item.thumbnail
                          ? `url('${item.thumbnail}')`
                          : 'linear-gradient(135deg, #550000, #000000)'
                      }}
                    >
                      {item.is_live && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                          <span className="w-2 h-2 bg-white rounded-full"></span>
                          LIVE
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Play className="w-10 h-10 text-white" fill="white" />
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-sm mb-1 line-clamp-2">{item.title}</h3>
                      <p className="text-xs text-gray-400">
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
  );
}