import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, MessageCircle, Share2, Volume2, VolumeX, ChevronUp, ChevronDown, Play } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";

// get or create a stable anonymous user ID
function getUserId() {
  let uid = localStorage.getItem("anon_uid");
  if (!uid) {
    uid = "u_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("anon_uid", uid);
  }
  return uid;
}

// Heart confetti effect
function fireHeartConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
  };

  function fire(particleRatio, opts) {
    confetti(
      Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio),
        shapes: ["heart"],
        colors: ["#ff0000", "#ff4d4d", "#ff9999", "#e60000"],
      })
    );
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 40, startVelocity: 45 });
  fire(0.35, { spread: 50, startVelocity: 35 });
  fire(0.1, { spread: 60, startVelocity: 25, decay: 0.92 });
  fire(0.1, { spread: 70, startVelocity: 15, decay: 0.85 });
}

const BUILTIN_LABELS = {
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
  custom: "מותאם",
  crime: "פלילים",
  israel: "ישראל",
  military: "צבא",
  education: "חינוך",
  culture: "תרבות",
  environment: "סביבה",
  science: "מדע",
  local: "מקומי",
  law: "משפט",
  vod: "VOD",
};

function ReelItem({ video, isActive, onNext, onPrev, customCatMap = {}, builtinLabels = BUILTIN_LABELS }) {
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
    if (!liked) {
      setHeartAnim(true);
      fireHeartConfetti();
    }
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
      videoRef.current.play().then(() => setPlaying(true)).catch(() => { setPlaying(false); });
      // Save to view history
      const history = JSON.parse(localStorage.getItem("view_history") || "[]");
      const newEntry = {
        videoId: video.id,
        videoUrl: video.video_url,
        title: video.title,
        thumbnail: video.thumbnail_url,
        watchedAt: new Date().toISOString(),
      };
      // Remove if exists, add to top
      const filtered = history.filter(h => h.videoId !== video.id);
      const updated = [newEntry, ...filtered].slice(0, 50);
      localStorage.setItem("view_history", JSON.stringify(updated));
    } else {
      try { videoRef.current.pause(); } catch(e) {}
      setPlaying(false);
    }
  }, [isActive, video.id, video.video_url, video.title, video.thumbnail_url]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      try { videoRef.current.pause(); } catch(e) {}
      setPlaying(false);
    } else {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => {});
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
          {builtinLabels[video.category] || customCatMap[video.category] || video.category}
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
      <div className="absolute bottom-20 right-4 left-16 pointer-events-none z-10">
        <p className="text-white font-bold text-lg leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-3 bg-black/30 rounded-lg px-2 py-1">{video.title}</p>
        {video.description && (
          <p className="text-gray-200 text-sm mt-1 line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] bg-black/20 rounded px-2">{video.description}</p>
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
  const [categoryIdx, setCategoryIdx] = useState(0);
  const [reelIndices, setReelIndices] = useState({});
  const containerRef = useRef(null);
  const touchStartY = useRef(null);

  const queryClient = useQueryClient();

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["reels-videos"],
    queryFn: () => base44.entities.UserVideo.list("-created_date", 100),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: customCategories = [] } = useQuery({
    queryKey: ["custom-categories"],
    queryFn: () => base44.entities.CustomCategory.list('-created_date', 20),
    enabled: isOpen,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const customCatMap = Object.fromEntries(customCategories.map(c => [c.id, c.label]));

  useEffect(() => {
    const handler = () => queryClient.invalidateQueries({ queryKey: ["reels-videos"] });
    window.addEventListener("videoUploaded", handler);
    return () => window.removeEventListener("videoUploaded", handler);
  }, [queryClient]);

  // הצג את כל הסרטונים — להוציא פודקאסטים, אודיו וכפולים (לפי URL וגם לפי כותרת)
  const videoOnly = (() => {
    const seenUrls = new Set();
    const seenTitles = new Set();
    return videos.filter(v => {
      const url = (v.video_url || "").toLowerCase();
      const title = (v.title || "").trim();
      const isAudio = url.includes(".mp3") || url.includes(".m4a") || url.includes(".wav") || url.includes(".ogg") || url.includes(".aac");
      if (isAudio || v.feed === "podcasts") return false;
      if (!title || /^[a-f0-9]{16,}$/i.test(title) || /^[a-f0-9_\-]{16,}$/i.test(title)) return false; // הסר ID כותרת
      if (seenUrls.has(url)) return false;
      if (seenTitles.has(title)) return false;
      seenUrls.add(url);
      seenTitles.add(title);
      return true;
    });
  })();

  // קטגוריות ייחודיות מהסרטונים
  const usedCategories = ["all", ...new Set(videoOnly.map(v => v.category).filter(Boolean))];
  
  // פונקציה לקבלת שם קטגוריה
  const getCatLabel = (cat) => BUILTIN_LABELS[cat] || customCatMap[cat] || cat;

  // בנית מפת קטגוריה → ריילסים
  const categorizedReels = usedCategories.reduce((acc, cat) => {
    const reels = cat === "all" 
      ? videoOnly 
      : videoOnly.filter(v => v.category === cat);
    acc[cat] = reels;
    return acc;
  }, {});

  const currentCat = usedCategories[categoryIdx] || "all";
  const currentReels = categorizedReels[currentCat] || [];
  const currentReelIdx = reelIndices[currentCat] || 0;
  const currentReel = currentReels[currentReelIdx];

  // ניווט בין קטגוריות
  const goNextCategory = useCallback(() => {
    setCategoryIdx(i => Math.min(i + 1, usedCategories.length - 1));
    setReelIndices({});
  }, [usedCategories.length]);

  const goPrevCategory = useCallback(() => {
    setCategoryIdx(i => Math.max(i - 1, 0));
    setReelIndices({});
  }, []);

  // ניווט בתוך קטגוריה
  const goNextReel = useCallback(() => {
    setReelIndices(prev => ({
      ...prev,
      [currentCat]: Math.min((prev[currentCat] || 0) + 1, currentReels.length - 1)
    }));
  }, [currentCat, currentReels.length]);

  const goPrevReel = useCallback(() => {
    setReelIndices(prev => ({
      ...prev,
      [currentCat]: Math.max((prev[currentCat] || 0) - 1, 0)
    }));
  }, [currentCat]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "ArrowDown") goNextReel();
      if (e.key === "ArrowUp") goPrevReel();
      if (e.key === "ArrowLeft") goNextCategory();
      if (e.key === "ArrowRight") goPrevCategory();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, goNextReel, goPrevReel, goNextCategory, goPrevCategory, onClose]);

  // Touch swipe
  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (dy > 50) goNextReel();
    else if (dy < -50) goPrevReel();
    touchStartY.current = null;
  };

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
          <span className="text-gray-400 text-sm">({currentReels.length} סרטונים)</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Categories Stories-Style Horizontal Scroll */}
      <div className="flex gap-4 px-3 py-3 overflow-x-auto bg-black flex-shrink-0" style={{scrollbarWidth:'none'}}>
        {usedCategories.map((cat, idx) => {
          const catReels = cat === "all" ? videoOnly : videoOnly.filter(v => v.category === cat);
          const catReel = catReels[0];
          const isActive = categoryIdx === idx;
          const catLabel = BUILTIN_LABELS[cat] || customCatMap[cat] || cat;
          const catCount = catReels.length;
          const catEmoji = cat === "all" ? "🎬" : cat === "breaking" ? "🔴" : cat === "sports" ? "⚽" : cat === "politics" ? "🏛️" : cat === "technology" ? "💻" : cat === "security" ? "🛡️" : cat === "economy" ? "📈" : cat === "entertainment" ? "🎭" : cat === "world" ? "🌍" : cat === "health" ? "❤️" : cat === "science" ? "🔬" : cat === "crime" ? "🔍" : "📰";
          return (
            <button
              key={cat}
              onClick={() => { setCategoryIdx(idx); setReelIndices({}); }}
              className="flex-shrink-0 flex flex-col items-center gap-1.5"
            >
              <div
                style={{ border: isActive ? '3px solid #E31E24' : '3px solid #444', boxShadow: isActive ? '0 0 0 2px rgba(227,30,36,0.5)' : 'none' }}
                className="w-16 h-16 rounded-full overflow-hidden relative transition-all"
              >
                {catReel?.video_url ? (
                  <video
                    src={catReel.video_url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-2xl ${isActive ? 'bg-[#E31E24]/40' : 'bg-gray-800'}`}>
                    {catEmoji}
                  </div>
                )}
                {/* count badge */}
                {catCount > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-[9px] text-center text-white font-bold py-0.5">
                    {catCount}
                  </div>
                )}
              </div>
              <span className={`text-[10px] font-bold max-w-[64px] truncate ${isActive ? 'text-[#E31E24]' : 'text-gray-300'}`}>
                {catLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reels Container */}
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
        ) : currentReels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="text-5xl mb-4">🎬</div>
            <p className="text-white font-bold text-xl mb-2">אין סרטוני ריילס בקטגוריה זו</p>
            <p className="text-gray-400 text-sm mb-6">בחר קטגוריה אחרת או העלה סרטון</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentCat}-${currentReelIdx}-${currentReel?.id}`}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <ReelItem
                video={currentReel}
                isActive={true}
                onNext={goNextReel}
                onPrev={goPrevReel}
                customCatMap={customCatMap}
                builtinLabels={BUILTIN_LABELS}
              />
            </motion.div>
          </AnimatePresence>
        )}

        {/* Progress dots - אנכי */}
        {currentReels.length > 1 && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1">
            {currentReels.slice(Math.max(0, currentReelIdx - 3), currentReelIdx + 4).map((_, i) => {
              const realIdx = Math.max(0, currentReelIdx - 3) + i;
              return (
                <button
                  key={realIdx}
                  onClick={() => setReelIndices(prev => ({ ...prev, [currentCat]: realIdx }))}
                  className={`rounded-full transition-all ${
                    realIdx === currentReelIdx ? "w-1.5 h-5 bg-white" : "w-1.5 h-1.5 bg-white/40"
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom counter */}
      {currentReels.length > 0 && (
        <div className="text-center py-2 text-gray-500 text-xs bg-black flex-shrink-0">
          {currentReelIdx + 1} / {currentReels.length} • {getCatLabel(currentCat)}
        </div>
      )}
    </motion.div>
  );
}