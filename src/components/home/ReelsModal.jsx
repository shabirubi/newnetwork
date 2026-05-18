import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, MessageCircle, Share2, Volume2, VolumeX, ChevronUp, ChevronDown, Play } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// get or create a stable anonymous user ID
function getUserId() {
  let uid = localStorage.getItem("anon_uid");
  if (!uid) {
    uid = "u_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("anon_uid", uid);
  }
  return uid;
}

const CATEGORY_LABELS = {
  all: "הכל",
  breaking: "חדשות עכשיו",
  security: "ביטחון",
  economy: "כלכלה",
  politics: "פוליטיקה",
  technology: "טכנולוגיה",
  sports: "ספורט",
  entertainment: "בידור",
  world: "עולם",
  health: "בריאות",
  music: "מוזיקה",
  horoscope: "הורוסקופ",
  finance: "פיננסים",
};

function ReelItem({ video, isActive, onNext, onPrev }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const qc = useQueryClient();
  const userId = getUserId();

  // Fetch likes for this video
  const { data: likesData } = useQuery({
    queryKey: ["video-likes", video.id],
    queryFn: () => base44.entities.VideoLike.filter({ video_id: video.id }),
    staleTime: 10000,
    enabled: !!video.id,
  });

  const totalLikes = likesData?.length ?? (video.likes ?? 0);
  const myLike = likesData?.find(l => l.user_identifier === userId);
  const liked = !!myLike;

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (myLike) {
        await base44.entities.VideoLike.delete(myLike.id);
      } else {
        await base44.entities.VideoLike.create({
          video_id: video.id,
          video_url: video.video_url,
          user_identifier: userId,
          is_liked: true,
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["video-likes", video.id] }),
  });

  const handleLike = () => {
    if (!liked) setHeartAnim(true);
    likeMutation.mutate();
  };

  useEffect(() => {
    if (heartAnim) {
      const t = setTimeout(() => setHeartAnim(false), 700);
      return () => clearTimeout(t);
    }
  }, [heartAnim]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={video.video_url}
        loop
        muted={muted}
        playsInline
        className="w-full h-full object-contain"
        onClick={togglePlay}
      />

      {/* Play overlay */}
      <AnimatePresence>
        {!playing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-black/40 rounded-full p-5">
              <Play className="w-12 h-12 text-white fill-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category badge */}
      {video.category && (
        <div className="absolute top-4 right-4 bg-[#E31E24]/90 text-white text-xs font-bold px-3 py-1 rounded-full">
          {CATEGORY_LABELS[video.category] || video.category}
        </div>
      )}

      {/* Heart burst animation */}
      <AnimatePresence>
        {heartAnim && (
          <motion.div
            initial={{ scale: 0.5, opacity: 1, y: 0 }}
            animate={{ scale: 2.5, opacity: 0, y: -80 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <Heart className="w-20 h-20 text-red-500 fill-red-500 drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right side actions */}
      <div className="absolute left-3 bottom-24 flex flex-col items-center gap-5">
        <button onClick={() => setMuted(m => !m)} className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
            {muted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
          </div>
        </button>

        <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
          <motion.div
            whileTap={{ scale: 1.4 }}
            className="w-11 h-11 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Heart className={`w-6 h-6 transition-all ${liked ? 'text-red-500 fill-red-500 scale-110' : 'text-white'}`} />
          </motion.div>
          <span className={`text-xs font-bold transition-colors ${liked ? 'text-red-400' : 'text-white'}`}>
            {totalLikes}
          </span>
        </button>

        <button
          onClick={() => navigator.share?.({ title: video.title, url: window.location.href })}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-11 h-11 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Share2 className="w-5 h-5 text-white" />
          </div>
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-6 right-4 left-16 pointer-events-none">
        <p className="text-white font-bold text-base leading-snug drop-shadow-lg line-clamp-2">{video.title}</p>
        {video.description && (
          <p className="text-gray-300 text-sm mt-1 line-clamp-2 drop-shadow">{video.description}</p>
        )}
      </div>

      {/* Nav arrows (desktop) */}
      <button
        onClick={onPrev}
        className="absolute top-1/2 right-2 -translate-y-1/2 hidden sm:flex w-10 h-10 bg-black/40 rounded-full items-center justify-center"
      >
        <ChevronUp className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={onNext}
        className="absolute top-1/2 left-12 -translate-y-1/2 hidden sm:flex w-10 h-10 bg-black/40 rounded-full items-center justify-center"
      >
        <ChevronDown className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}

export default function ReelsModal({ isOpen, onClose }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const containerRef = useRef(null);
  const touchStartY = useRef(null);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["reels-videos"],
    queryFn: () => base44.entities.UserVideo.filter({ status: "ready" }, "-created_date", 100),
    enabled: isOpen,
    staleTime: 30 * 1000,
  });

  const filtered = selectedCategory === "all"
    ? videos
    : videos.filter(v => v.category === selectedCategory);

  const goNext = useCallback(() => setActiveIdx(i => Math.min(i + 1, filtered.length - 1)), [filtered.length]);
  const goPrev = useCallback(() => setActiveIdx(i => Math.max(i - 1, 0)), []);

  // Reset index when category changes
  useEffect(() => { setActiveIdx(0); }, [selectedCategory]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "ArrowDown") goNext();
      if (e.key === "ArrowUp") goPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, goNext, goPrev, onClose]);

  // Touch swipe
  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (dy > 50) goNext();
    else if (dy < -50) goPrev();
    touchStartY.current = null;
  };

  const categories = ["all", ...Object.keys(CATEGORY_LABELS).filter(k => k !== "all")];
  const usedCategories = ["all", ...new Set(videos.map(v => v.category).filter(Boolean))];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] bg-black flex flex-col"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm border-b border-gray-800 flex-shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white font-bold text-base">ריילס</span>
          <span className="text-gray-400 text-sm">({filtered.length} סרטונים)</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 px-3 py-2 overflow-x-auto bg-black/60 flex-shrink-0">
        {usedCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              selectedCategory === cat
                ? "bg-[#E31E24] text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Reels Feed */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-10 h-10 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="text-5xl mb-4">🎬</div>
            <p className="text-white font-bold text-xl mb-2">אין סרטונים עדיין</p>
            <p className="text-gray-400 text-sm">העלה ריילס מהעורך המתקדם</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ y: activeIdx === 0 ? 0 : 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <ReelItem
                video={filtered[activeIdx]}
                isActive={true}
                onNext={goNext}
                onPrev={goPrev}
              />
            </motion.div>
          </AnimatePresence>
        )}

        {/* Progress dots */}
        {filtered.length > 1 && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
            {filtered.slice(Math.max(0, activeIdx - 3), activeIdx + 4).map((_, i) => {
              const realIdx = Math.max(0, activeIdx - 3) + i;
              return (
                <button
                  key={realIdx}
                  onClick={() => setActiveIdx(realIdx)}
                  className={`rounded-full transition-all ${
                    realIdx === activeIdx ? "w-1.5 h-5 bg-white" : "w-1.5 h-1.5 bg-white/40"
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom counter */}
      {filtered.length > 0 && (
        <div className="text-center py-2 text-gray-500 text-xs bg-black flex-shrink-0">
          {activeIdx + 1} / {filtered.length}
        </div>
      )}
    </motion.div>
  );
}