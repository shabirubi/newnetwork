import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Grid, List, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

const BACKGROUND_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/43de178a9_image.png";
const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

export default function VODContent() {
  const [selectedContent, setSelectedContent] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: vodContent = [] } = useQuery({
    queryKey: ['vod-content'],
    queryFn: () => base44.entities.VODContent.list('-order', 100),
    initialData: []
  });

  const categories = [
    { id: 'all', label: 'הכל' },
    { id: 'live', label: 'שידור חי' },
    { id: 'movies', label: 'סרטים' },
    { id: 'series', label: 'סדרות' },
    { id: 'news', label: 'חדשות' },
    { id: 'sports', label: 'ספורט' },
    { id: 'entertainment', label: 'בידור' }
  ];

  const filteredContent = vodContent.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url('${BACKGROUND_IMAGE}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Logo Header */}
        <header className="sticky top-0 z-40 backdrop-blur-md bg-black/40 border-b border-[#E31E24]/30">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to={createPageUrl("Home")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img 
                  src={LOGO_URL} 
                  alt="הרשת החדשה" 
                  className="h-14 w-auto"
                />
              </Link>
            </div>
          </div>
        </header>

        {/* Search and Filters */}
        <div className="bg-black/40 backdrop-blur-md border-b border-[#E31E24]/30 sticky top-20 z-30">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="חפשו תוכן..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/50 border border-[#E31E24]/30 rounded-lg pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E31E24] transition-colors"
              />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-[#E31E24] to-[#B91C1C] text-white shadow-lg'
                      : 'bg-black/50 text-gray-300 border border-gray-600 hover:border-[#E31E24]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 relative z-20">
          {filteredContent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-6xl mb-4">🎬</div>
              <h2 className="text-2xl font-bold text-white mb-2">אין תוכן זמין</h2>
              <p className="text-gray-400">נסו לחפש משהו אחר או בחרו קטגוריה שונה</p>
            </div>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {filteredContent.map((content, index) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedContent(content)}
                  className="group cursor-pointer"
                >
                  <div className="relative rounded-xl overflow-hidden bg-gray-900 shadow-2xl hover:shadow-3xl transition-all duration-300">
                    {/* Thumbnail */}
                    {content.thumbnail ? (
                      <img
                        src={content.thumbnail}
                        alt={content.title}
                        className="w-full aspect-video object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full aspect-video bg-gradient-to-br from-[#E31E24]/20 to-[#B91C1C]/20 flex items-center justify-center">
                        <span className="text-4xl">🎥</span>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#E31E24] rounded-full p-4 opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl"
                      >
                        <Play className="w-6 h-6 text-white fill-white" />
                      </motion.button>
                    </div>

                    {/* Badge */}
                    {content.is_live && (
                      <div className="absolute top-3 right-3 bg-[#E31E24] text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        ישיר
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="mt-3 space-y-1">
                    <h3 className="text-white font-bold line-clamp-2 group-hover:text-[#E31E24] transition-colors">
                      {content.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-1">
                      {content.strip_name || content.category}
                    </p>
                    {content.duration && (
                      <p className="text-gray-500 text-xs">{content.duration}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedContent(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedContent(null)}
                className="absolute -top-12 right-0 text-white hover:text-[#E31E24] transition-colors z-10"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Video Player */}
              <div className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-2xl">
                {selectedContent.stream_url ? (
                  <iframe
                    src={selectedContent.stream_url}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-[#E31E24] mx-auto mb-4" />
                      <p className="text-white">אין קישור זמין</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Content Details */}
              <div className="mt-6 space-y-3 max-h-48 overflow-y-auto">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {selectedContent.title}
                  </h2>
                  <p className="text-gray-300">
                    {selectedContent.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-800">
                  {selectedContent.genre && (
                    <span className="bg-[#E31E24]/20 text-[#E31E24] px-3 py-1 rounded-full text-sm">
                      {selectedContent.genre}
                    </span>
                  )}
                  {selectedContent.duration && (
                    <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                      {selectedContent.duration}
                    </span>
                  )}
                  {selectedContent.viewers && (
                    <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                      {selectedContent.viewers.toLocaleString()} צפיות
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}