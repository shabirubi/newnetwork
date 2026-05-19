import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Headphones, X, Play, Pause } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const categoryColors = {
  breaking: "bg-red-500",
  security: "bg-blue-600",
  economy: "bg-green-600",
  politics: "bg-purple-600",
  technology: "bg-cyan-600",
  sports: "bg-orange-500",
  entertainment: "bg-pink-600",
  world: "bg-indigo-600",
  health: "bg-teal-600",
  music: "bg-yellow-600",
  horoscope: "bg-violet-600",
  finance: "bg-emerald-600",
  crime: "bg-red-700",
  israel: "bg-blue-700",
  military: "bg-slate-600",
  education: "bg-amber-600",
  culture: "bg-rose-600",
  environment: "bg-green-700",
  science: "bg-sky-600",
  local: "bg-zinc-600",
  law: "bg-stone-600",
  vod: "bg-gray-600"
};

const categoryLabels = {
  breaking: "חדשות דחופות",
  security: "ביטחון",
  economy: "כלכלה",
  politics: "פוליטיקה",
  technology: "טכנולוגיה",
  sports: "ספורט",
  entertainment: "בידור",
  world: "עולם",
  health: "בריאות",
  music: "מוזיקה",
  horoscope: "אסטרולוגיה",
  finance: "פיננסים",
  crime: "פלילים",
  israel: "ישראל",
  military: "צבא",
  education: "חינוך",
  culture: "תרבות",
  environment: "סביבה",
  science: "מדע",
  local: "מקומי",
  law: "משפט",
  vod: "VOD"
};

function PodcastPlayer({ podcast, onClose }) {
  return (
    <div className="bg-gradient-to-br from-[#1DB954]/20 to-black rounded-2xl p-4 border border-[#1DB954]/30">
      <div className="flex items-center gap-4 mb-4">
        <img 
          src={podcast.thumbnail_url} 
          alt={podcast.title}
          className="w-20 h-20 rounded-xl object-cover shadow-lg"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm mb-1 truncate">{podcast.title}</h3>
          <p className="text-gray-400 text-xs mb-2 line-clamp-2">{podcast.description}</p>
          <Badge className={categoryColors[podcast.category] || "bg-gray-600"}>
            {categoryLabels[podcast.category] || podcast.category}
          </Badge>
        </div>
      </div>

      {/* Spotify Embedded Player */}
      <iframe
        src={podcast.video_url}
        width="100%"
        height="351"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-xl overflow-hidden"
        title={podcast.title}
      />

      <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
        <span>{podcast.views || 0} צפיות</span>
        <span>{podcast.likes || 0} לייקים</span>
      </div>
    </div>
  );
}

export default function PodcastsFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState(null);

  const { data: podcasts, isLoading } = useQuery({
    queryKey: ['podcasts'],
    queryFn: async () => {
      try {
        const allVideos = await base44.entities.UserVideo.list('-created_date', 50);
        return allVideos.filter(v => v.feed === 'podcasts' || v.category === 'podcasts') || [];
      } catch (err) {
        console.error('Failed to fetch podcasts:', err);
        return [];
      }
    }
  });

  return (
    <>
      {/* Floating Button - Spotify Official Logo - Opens Upload Modal */}
      <motion.button
        onClick={() => {
          window.dispatchEvent(new CustomEvent('openUploadPodcast'));
        }}
        className="fixed bottom-48 left-4 z-[999] w-14 h-14 rounded-full bg-[#1DB954] hover:bg-[#1ed760] shadow-lg shadow-[#1DB954]/50 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="העלה פודקאסט"
      >
        {/* Spotify Official Logo - Three curved sound waves */}
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14.5c-.28.28-.7.28-1 .14-3.05-1.87-6.88-2.3-11.34-1.44-.42.07-.77-.21-.84-.63-.07-.42.21-.77.63-.84 4.83-.93 9.03-.42 12.43 1.68.35.21.42.7.14 1.09zm1.12-2.94c-.35.56-1.05.7-1.61.35-3.78-2.31-9.52-2.94-13.93-1.61-.63.21-1.33-.14-1.54-.77-.21-.63.14-1.33.77-1.54 5.11-1.54 11.48-.84 15.89 1.89.56.35.77 1.05.42 1.68zm.21-3.08c-4.55-2.73-12.04-2.94-16.38-1.61-.77.21-1.61-.21-1.82-.98-.21-.77.21-1.61.98-1.82 5.04-1.54 13.37-1.26 18.62 1.89.7.42.91 1.33.49 2.03-.42.63-1.33.84-1.89.49z"/>
        </svg>
      </motion.button>

      {/* Podcasts Side Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000]"
              onClick={() => {
                setIsOpen(false);
                setSelectedPodcast(null);
              }}
            />
            
            {/* Side Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[90vw] md:w-[400px] bg-gradient-to-b from-[#121212] to-black border-l-2 border-[#1DB954]/30 shadow-2xl shadow-[#1DB954]/20 z-[10001] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-br from-[#1DB954]/30 to-black p-5 border-b border-[#1DB954]/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Spotify Official Logo */}
                  <svg className="w-9 h-9" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14.5c-.28.28-.7.28-1 .14-3.05-1.87-6.88-2.3-11.34-1.44-.42.07-.77-.21-.84-.63-.07-.42.21-.77.63-.84 4.83-.93 9.03-.42 12.43 1.68.35.21.42.7.14 1.09zm1.12-2.94c-.35.56-1.05.7-1.61.35-3.78-2.31-9.52-2.94-13.93-1.61-.63.21-1.33-.14-1.54-.77-.21-.63.14-1.33.77-1.54 5.11-1.54 11.48-.84 15.89 1.89.56.35.77 1.05.42 1.68zm.21-3.08c-4.55-2.73-12.04-2.94-16.38-1.61-.77.21-1.61-.21-1.82-.98-.21-.77.21-1.61.98-1.82 5.04-1.54 13.37-1.26 18.62 1.89.7.42.91 1.33.49 2.03-.42.63-1.33.84-1.89.49z"/>
                  </svg>
                  <div>
                    <h2 className="text-white font-bold text-lg">פודקאסטים</h2>
                    <p className="text-gray-400 text-xs">הרשת החדשה</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedPodcast(null);
                  }}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : selectedPodcast ? (
                  <PodcastPlayer 
                    podcast={selectedPodcast} 
                    onClose={() => setSelectedPodcast(null)}
                  />
                ) : podcasts && podcasts.length > 0 ? (
                  <div className="grid gap-3">
                    {podcasts.map((podcast) => (
                      <motion.div
                        key={podcast.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedPodcast(podcast)}
                        className="bg-white/5 hover:bg-white/10 rounded-xl p-3 border border-white/10 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={podcast.thumbnail_url} 
                            alt={podcast.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white text-sm mb-1 truncate">{podcast.title}</h3>
                            <p className="text-gray-400 text-xs mb-2 line-clamp-1">{podcast.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge className={categoryColors[podcast.category] || "bg-gray-600"}>
                                {categoryLabels[podcast.category] || podcast.category}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {Math.floor((podcast.duration || 0) / 60)} דק'
                              </span>
                            </div>
                          </div>
                          <Play className="w-5 h-5 text-[#1DB954] flex-shrink-0" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Headphones className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>אין פודקאסטים זמינים כרגע</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}