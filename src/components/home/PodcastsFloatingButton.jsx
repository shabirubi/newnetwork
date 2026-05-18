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
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = React.useRef(null);

  React.useEffect(() => {
    if (audioRef.current && podcast) {
      audioRef.current.src = podcast.video_url;
      if (isPlaying) {
        audioRef.current.play().catch(err => console.error('Playback error:', err));
      }
    }
  }, [podcast, isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 1;
      setProgress((current / duration) * 100);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(100);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={(e) => console.error('Audio error:', e)}
      />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-white p-0"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </Button>
          <div className="flex-1">
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#1DB954] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
              <span>{formatTime(podcast.duration || 0)}</span>
            </div>
          </div>
        </div>
      </div>

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
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-4 z-[999] w-14 h-14 rounded-full bg-[#1DB954] hover:bg-[#1ed760] shadow-lg shadow-[#1DB954]/50 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Headphones className="w-6 h-6 text-white" />
      </motion.button>

      {/* Podcasts Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000]"
            onClick={() => {
              setIsOpen(false);
              setSelectedPodcast(null);
            }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-h-[80vh] bg-gradient-to-br from-[#121212] to-black rounded-3xl border-2 border-[#1DB954]/30 shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-br from-[#1DB954]/30 to-black p-4 border-b border-[#1DB954]/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center">
                    <Headphones className="w-5 h-5 text-white" />
                  </div>
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}