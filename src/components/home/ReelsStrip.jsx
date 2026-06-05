import React, { useRef, useState } from "react";
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

function ReelThumb({ video, onClick, customCatMap }) {
  const videoRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => {
        setHovered(true);
        const v = videoRef.current;
        if (v) v.play().catch(() => {});
      }}
      onMouseLeave={() => {
        setHovered(false);
        const v = videoRef.current;
        if (v) { v.pause(); v.currentTime = 0; }
      }}
      className="flex-shrink-0 relative w-24 h-36 sm:w-28 sm:h-44 rounded-xl overflow-hidden group cursor-pointer"
    >
      <video
        ref={videoRef}
        src={video.video_url}
        muted
        playsInline
        loop
        preload="metadata"
        className="w-full h-full object-cover"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Play icon */}
      {!hovered && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
        </div>
      )}

      {/* Title */}
      <p className="absolute bottom-2 right-2 left-2 text-white text-[10px] font-bold line-clamp-2 leading-tight">
        {video.title}
      </p>

      {/* Category badge */}
      {video.category && (
        <div className="absolute top-2 right-2 bg-[#E31E24]/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
          {BUILTIN_LABELS[video.category] || customCatMap?.[video.category] || video.category}
        </div>
      )}
    </button>
  );
}

export default function ReelsStrip() {
  const [reelsOpen, setReelsOpen] = useState(false);

  const { data: videos = [] } = useQuery({
    queryKey: ["home-all-videos"],
    queryFn: () => base44.entities.UserVideo.list("-created_date", 200),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const { data: customCats = [] } = useQuery({
    queryKey: ["custom-categories-db"],
    queryFn: () => base44.entities.CustomCategory.list("-created_date", 50),
    staleTime: 10 * 60 * 1000,
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
      if (!title || /^[a-f0-9]{16,}$/i.test(title) || /^[a-f0-9_\-]{16,}$/i.test(title)) return false; // הסר ID כותרת
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
          {reels.map(video => (
            <ReelThumb
              key={video.id}
              video={video}
              onClick={() => setReelsOpen(true)}
              customCatMap={customCatMap}
            />
          ))}
        </div>
      </div>

      {reelsOpen && (
        <ReelsModal isOpen={reelsOpen} onClose={() => setReelsOpen(false)} />
      )}
    </>
  );
}