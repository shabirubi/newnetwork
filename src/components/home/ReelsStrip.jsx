import React, { useRef, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Play, Radio } from "lucide-react";
import ReelsModal from "./ReelsModal";

const BUILTIN_LABELS = {
  all: "הכל", breaking: "חדשות עכשיו", security: "ביטחון", economy: "כלכלה",
  politics: "פוליטיקה", technology: "טכנולוגיה", sports: "ספורט", entertainment: "בידור",
  world: "עולם", health: "בריאות", music: "מוזיקה", horoscope: "הורוסקופ",
  finance: "פיננסים", crime: "פלילים", israel: "ישראל", military: "צבא",
  education: "חינוך", culture: "תרבות", environment: "סביבה", science: "מדע",
  local: "מקומי", law: "משפט", vod: "VOD",
};

function ReelThumb({ video, onClick, customCatMap, loadThumbnail = true }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  
  // Lazy load thumbnail generation
  useEffect(() => {
    if (loadThumbnail) {
      const timer = setTimeout(() => setShouldLoad(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loadThumbnail]);

  // Generate thumbnail from video frame when shouldLoad is true
  useEffect(() => {
    if (!shouldLoad) return;
    const v = videoRef.current;
    const canvas = canvasRef.current;
    if (!v || !canvas) return;

    const generateThumbnail = () => {
      if (v.readyState >= 2) {
        try {
          v.currentTime = 0.5;
        } catch (e) {}
      }
    };

    const onCanPlay = () => {
      try {
        v.currentTime = 0.5;
      } catch (e) {}
    };

    const onSeeked = () => {
      try {
        canvas.width = v.videoWidth || 320;
        canvas.height = v.videoHeight || 568;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setThumbnailUrl(dataUrl);
      } catch (e) {
        console.error('Thumbnail generation failed:', e);
      }
    };

    v.addEventListener('loadedmetadata', generateThumbnail);
    v.addEventListener('canplay', onCanPlay);
    v.addEventListener('seeked', onSeeked);
    
    // Fallback: try after 2 seconds
    const timeout = setTimeout(generateThumbnail, 2000);

    return () => {
      v.removeEventListener('loadedmetadata', generateThumbnail);
      v.removeEventListener('canplay', onCanPlay);
      v.removeEventListener('seeked', onSeeked);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => {
          setHovered(true);
          const v = videoRef.current;
          if (v && thumbnailUrl && !videoError) {
            v.play().catch(() => {});
          }
        }}
        onMouseLeave={() => {
          setHovered(false);
          const v = videoRef.current;
          if (v) { v.pause(); v.currentTime = 0; }
        }}
        className="flex-shrink-0 relative w-24 h-36 sm:w-28 sm:h-44 rounded-xl overflow-hidden group cursor-pointer bg-gray-900"
      >
        {/* Hidden canvas for thumbnail generation */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Thumbnail image */}
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={video.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )}
        
        {/* Video element */}
        <video
          ref={videoRef}
          src={video.video_url}
          muted
          playsInline
          preload="metadata"
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover ${thumbnailUrl ? 'opacity-0' : 'opacity-100'}`}
          onError={() => {
            setVideoError(true);
          }}
        />
        
        {/* Fallback gradient if video fails to load */}
        {videoError && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#E31E24]/30 to-[#0057B8]/30 flex items-center justify-center">
            <Play className="w-12 h-12 text-white/40" />
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Play icon */}
        {!hovered && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
        )}
        
        {/* Title */}
        <p className="absolute bottom-2 right-2 left-2 text-white text-[10px] font-bold line-clamp-2 leading-tight drop-shadow-lg">
          {video.title}
        </p>

        {/* Category badge */}
        {video.category && (
          <div className="absolute top-2 right-2 bg-[#E31E24]/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
            {BUILTIN_LABELS[video.category] || customCatMap?.[video.category] || video.category}
          </div>
        )}
      </button>
    </div>
  );
}

export default function ReelsStrip() {
  const [reelsOpen, setReelsOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);

  // Load only 12 videos initially for better performance
  const { data: videos = [] } = useQuery({
    queryKey: ["home-all-videos"],
    queryFn: () => base44.entities.UserVideo.list("-created_date", 50),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const { data: customCats = [] } = useQuery({
    queryKey: ["custom-categories-db"],
    queryFn: () => base44.entities.CustomCategory.list("-created_date", 30),
    staleTime: 15 * 60 * 1000,
  });
  const customCatMap = Object.fromEntries(customCats.map(c => [c.id, c.label]));

  const reels = (() => {
    const seenUrls = new Set();
    const seenTitles = new Set();
    return videos.filter(v => {
      const url = (v.video_url || "").toLowerCase();
      const title = (v.title || "").trim();
      const isAudio = url.includes(".mp3") || url.includes(".m4a") || url.includes(".wav") || url.includes(".ogg") || url.includes(".aac");
      if (isAudio || v.feed === "podcasts") return false;
      if (!title || /^[a-f0-9]{16,}$/i.test(title) || /^[a-f0-9_\-]{16,}$/i.test(title)) return false;
      if (seenUrls.has(url)) return false;
      if (seenTitles.has(title)) return false;
      seenUrls.add(url);
      seenTitles.add(title);
      return true;
    });
  })();

  if (reels.length === 0) return null;

  return (
    <>
      <div className="px-3 sm:px-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#E31E24]" />
            <span className="text-white font-bold text-base">ריילס</span>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>
          <button
            onClick={() => setReelsOpen(true)}
            className="text-[#E31E24] text-sm font-bold hover:underline"
          >
            הכל ←
          </button>
        </div>

        {/* Horizontal scroll strip */}
        <div
          className="flex gap-2.5 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {reels.slice(0, visibleCount).map((video, index) => (
            <ReelThumb
              key={video.id}
              video={video}
              onClick={() => setReelsOpen(true)}
              customCatMap={customCatMap}
              loadThumbnail={index < 4}
            />
          ))}
          {visibleCount < reels.length && (
            <button
              onClick={() => setVisibleCount(prev => prev + 8)}
              className="flex-shrink-0 w-24 h-36 sm:w-28 sm:h-44 rounded-xl bg-gray-800/50 border border-gray-700 flex items-center justify-center text-gray-400 text-xs font-bold hover:bg-gray-700/50 transition-colors"
            >
              עוד ({reels.length - visibleCount})
            </button>
          )}
        </div>
      </div>

      {reelsOpen && (
        <ReelsModal isOpen={reelsOpen} onClose={() => setReelsOpen(false)} />
      )}
    </>
  );
}