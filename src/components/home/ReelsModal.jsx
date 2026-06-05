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
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
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

  // Fetch comments
  const { data: commentsData = [] } = useQuery({
    queryKey: ["video-comments", video.id],
    queryFn: () => base44.entities.VideoComment.filter({ video_id: video.id, is_approved: true }),
    staleTime: 5000,
    enabled: !!video.id,
  });

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

  const commentMutation = useMutation({
    mutationFn: async (content) => {
      return await base44.entities.VideoComment.create({
        video_id: video.id,
        user_name: "אורח",
        user_email: userId,
        content,
        is_approved: true,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["video-comments", video.id] });
      setCommentText("");
    },
  });

  const handleAddComment = () => {
    if (commentText.trim()) {
      commentMutation.mutate(commentText.trim());
    }
  };

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
      {/* Thumbnail background - removed to show full video */}
      
      <video
        ref={videoRef}
        src={video.video_url}
        loop
        muted={muted}
        playsInline
        controls
        poster={video.thumbnail_url}
        preload="metadata"
        className="w-full h-full object-cover relative z-10"
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

      {/* Category badge - moved to top-left, more transparent */}
      {video.category && (
        <div className="absolute top-16 left-4 bg-[#E31E24]/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full z-20">
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

      {/* Right side actions - compact */}
      <div className="absolute left-3 bottom-32 flex flex-col items-center gap-4 z-20">
        <button onClick={() => setMuted(m => !m)} className="flex flex-col items-center gap-1">
          <div className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
            {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
          </div>
        </button>

        <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
          <motion.div
            whileTap={{ scale: 1.4 }}
            className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Heart className={`w-5 h-5 transition-all ${liked ? 'text-red-500 fill-red-500 scale-110' : 'text-white'}`} />
          </motion.div>
          <span className={`text-[10px] font-bold transition-colors ${liked ? 'text-red-400' : 'text-white'}`}>
            {totalLikes}
          </span>
        </button>

        <button
          onClick={() => setShowComments(true)}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <span className="text-[10px] font-bold text-white">
            {commentsData?.length || 0}
          </span>
        </button>

        <button
          onClick={() => navigator.share?.({ title: video.title, url: window.location.href })}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Share2 className="w-4 h-4 text-white" />
          </div>
        </button>
      </div>

      {/* Bottom info - moved up and more compact */}
      <div className="absolute bottom-28 right-4 left-16 pointer-events-none z-10">
        <p className="text-white font-bold text-sm leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-2 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1">{video.title}</p>
      </div>

      {/* Comments Modal */}
      {showComments && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-end justify-center">
          <div className="bg-[#181818] w-full max-w-md rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">תגובות ({commentsData?.length || 0})</h3>
              <button onClick={() => setShowComments(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Comments List */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {commentsData?.length === 0 ? (
                <p className="text-gray-400 text-center py-4">אין תגובות עדיין. היה הראשון!</p>
              ) : (
                commentsData.map((comment, idx) => (
                  <div key={idx} className="bg-black/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                        {comment.user_name?.charAt(0) || 'A'}
                      </div>
                      <span className="text-white font-bold text-sm">{comment.user_name}</span>
                    </div>
                    <p className="text-gray-200 text-sm">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment */}
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="כתוב תגובה..."
                className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#0057B8]"
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim() || commentMutation.isPending}
                className="bg-[#0057B8] hover:bg-[#0066cc] disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-bold transition-colors"
              >
                {commentMutation.isPending ? "שולח..." : "שלח"}
              </button>
            </div>
          </div>
        </div>
      )}

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
    queryFn: () => base44.entities.UserVideo.list("-created_date", 30),
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
      {/* Header - compact */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/90 to-transparent flex-shrink-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white font-bold text-sm">ריילס</span>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Categories Stories-Style - overlay on top */}
      <div className="absolute top-12 left-0 right-0 flex gap-3 px-3 py-2 overflow-x-auto z-30" style={{scrollbarWidth:'none'}}>
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
              className="flex-shrink-0 flex flex-col items-center gap-1"
            >
              <div
                style={{ border: isActive ? '2px solid #E31E24' : '2px solid rgba(255,255,255,0.3)', boxShadow: isActive ? '0 0 8px rgba(227,30,36,0.6)' : 'none' }}
                className="w-12 h-12 rounded-full overflow-hidden relative transition-all"
              >
                {catReel?.video_url ? (
                  <video
                    src={catReel.video_url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                    poster={catReel.thumbnail_url || ''}
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-xl ${isActive ? 'bg-[#E31E24]/40' : 'bg-black/40'}`}>
                    {catEmoji}
                  </div>
                )}
              </div>
              <span className={`text-[9px] font-bold max-w-[56px] truncate ${isActive ? 'text-white' : 'text-gray-400'}`}>
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

        {/* Progress dots - אנכי, מוסתר חלקית */}
        {currentReels.length > 1 && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-60 hover:opacity-100 transition-opacity">
            {currentReels.slice(Math.max(0, currentReelIdx - 3), currentReelIdx + 4).map((_, i) => {
              const realIdx = Math.max(0, currentReelIdx - 3) + i;
              return (
                <button
                  key={realIdx}
                  onClick={() => setReelIndices(prev => ({ ...prev, [currentCat]: realIdx }))}
                  className={`rounded-full transition-all ${
                    realIdx === currentReelIdx ? "w-1 h-4 bg-white" : "w-1 h-1 bg-white/30"
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