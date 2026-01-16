import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Radio, Film, Newspaper, Cloud, Globe, Trophy, Tv, Users, Eye } from "lucide-react";
import VODPlayer from "./VODPlayer";

const CATEGORIES = [
  { id: "live", label: "שידורים חיים", icon: Radio },
  { id: "movies", label: "סרטים", icon: Film },
  { id: "news", label: "חדשות", icon: Newspaper },
  { id: "forecast", label: "תחזית", icon: Cloud },
  { id: "current_affairs", label: "אקטואליה", icon: Tv },
  { id: "ethnic", label: "תרבות ואתניות", icon: Users },
  { id: "sports", label: "ספורט", icon: Trophy },
  { id: "drama", label: "דרמה", icon: Tv },
  { id: "series", label: "סדרות", icon: Tv },
  { id: "global", label: "ערוצים גלובליים", icon: Globe }
];

export default function VODModal({ isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState("live");
  const [selectedContent, setSelectedContent] = useState(null);

  const { data: content = [], isLoading } = useQuery({
    queryKey: ['vod-content', activeCategory],
    queryFn: () => base44.entities.VODContent.filter({ category: activeCategory }, 'order'),
    initialData: [],
    enabled: isOpen
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black"
        onClick={(e) => {
          if (e.target === e.currentTarget && !selectedContent) {
            onClose();
          }
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="fixed top-4 left-4 z-[110] p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-2xl"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-[105] bg-gradient-to-r from-black via-red-950/40 to-black backdrop-blur-md border-b border-red-900/30"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-red-500">VOD LIVE</h1>
                <p className="text-[10px] sm:text-xs text-gray-400">תוכן בידור וחדשות 24/7</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{content.length} פריטים</span>
              <span className="sm:hidden">{content.length}</span>
            </div>
          </div>
        </motion.header>

        {/* Categories - Mobile Optimized */}
        <nav className="sticky top-[57px] sm:top-[73px] z-[104] bg-black/90 backdrop-blur-md border-b border-red-900/20 overflow-x-auto">
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
                  <span className="hidden sm:inline">{cat.label}</span>
                  <span className="sm:hidden">{cat.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content - Mobile Optimized */}
        <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8 pb-20">
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
      </motion.div>
    </AnimatePresence>
  );
}