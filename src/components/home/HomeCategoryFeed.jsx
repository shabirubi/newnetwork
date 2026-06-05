import React, { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Play, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

const CATEGORIES = [
  { id: "breaking", label: "חדשות עכשיו", color: "#E31E24" },
  { id: "security", label: "ביטחון ומדיניות", color: "#F97316" },
  { id: "economy", label: "כלכלה ועסקים", color: "#16A34A" },
  { id: "politics", label: "פוליטיקה", color: "#9333EA" },
  { id: "technology", label: "טכנולוגיה", color: "#2563EB" },
  { id: "sports", label: "ספורט", color: "#059669" },
  { id: "entertainment", label: "בידור ותרבות", color: "#EC4899" },
  { id: "world", label: "חדשות עולם", color: "#4F46E5" },
  { id: "health", label: "בריאות", color: "#0D9488" },
  { id: "israel", label: "חדשות ישראל", color: "#1D4ED8" },
  { id: "crime", label: "פלילים", color: "#DC2626" },
  { id: "education", label: "חינוך", color: "#0891B2" },
  { id: "culture", label: "תרבות", color: "#7C3AED" },
  { id: "environment", label: "סביבה", color: "#059669" },
  { id: "science", label: "מדע", color: "#6366F1" },
  { id: "military", label: "צבא וביטחון", color: "#78716C" },
  { id: "law", label: "משפט", color: "#A855F7" },
  { id: "local", label: "חדשות מקומיות", color: "#EA580C" },
  { id: "finance", label: "פיננסים", color: "#10B981" },
  { id: "music", label: "מוזיקה", color: "#DB2777" },
  { id: "horoscope", label: "אסטרולוגיה", color: "#8B5CF6" },
];

const isObjectId = (str) => /^[a-f0-9]{16,}$/i.test(str);

// Reel thumb with hover-play
function ReelThumb({ video, onOpen }) {
  const videoRef = useRef(null);

  return (
    <button
      onClick={onOpen}
      onMouseEnter={() => videoRef.current?.play().catch(() => {})}
      onMouseLeave={() => { if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; } }}
      className="flex-shrink-0 relative w-28 h-44 sm:w-32 sm:h-52 rounded-2xl overflow-hidden group cursor-pointer border border-gray-800 hover:border-[#E31E24]/60 transition-all"
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center opacity-60 group-hover:opacity-0 transition-opacity">
        <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <Play className="w-4 h-4 text-white fill-white" />
        </div>
      </div>
      <p className="absolute bottom-2 right-2 left-2 text-white text-[10px] font-bold line-clamp-2 leading-tight">
        {video.title}
      </p>
    </button>
  );
}

// Article card — compact
function ArticleCard({ article, catColor, catLabel }) {
  return (
    <Link
      to={createPageUrl(`Article?id=${article.id}`)}
      className="flex gap-3 p-3 bg-[#111] rounded-xl border border-gray-800 hover:border-gray-600 transition-all"
    >
      {article.image_url ? (
        <img src={article.image_url} alt={article.title} className="w-20 h-16 object-cover rounded-lg flex-shrink-0" />
      ) : article.video_url ? (
        <div className="w-20 h-16 bg-gray-900 rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-700">
          <Play className="w-5 h-5 text-gray-500" />
        </div>
      ) : null}
      <div className="flex-1 min-w-0">
        {article.is_breaking && (
          <span className="text-[9px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded mb-1 inline-block">🔴 דחוף</span>
        )}
        <h4 className="text-white text-sm font-bold leading-tight line-clamp-2">{article.title}</h4>
        {article.subtitle && <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{article.subtitle}</p>}
        {article.source && <p className="text-gray-600 text-[10px] mt-1">{article.source}</p>}
      </div>
    </Link>
  );
}

// One category block: reels strip + articles
function CategoryBlock({ category, videos, articles }) {
  const openReels = () => window.dispatchEvent(new Event('openReels'));

  if (videos.length === 0 && articles.length === 0) {
    return (
      <div className="mb-10 px-3" dir="rtl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-7 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }} />
          <h3 className="text-white font-bold text-lg">{category.label}</h3>
        </div>
        <div className="bg-[#111] rounded-xl border border-gray-800 p-6 text-center text-gray-500 text-sm">
          אין תוכן בקטגוריה זו עדיין. <Link to={createPageUrl("Category?cat=" + category.id)} className="text-[#0057B8] hover:underline">הוסף כתבה ←</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10" dir="rtl">
      {/* Category header */}
      <div className="flex items-center gap-2 mb-4 px-3">
        <div className="w-1.5 h-7 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }} />
        <h3 className="text-white font-bold text-lg">{category.label}</h3>
        {videos.length > 0 && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: category.color + '25', color: category.color }}>
            {videos.length} ריילס
          </span>
        )}
      </div>

      {/* Reels horizontal strip */}
      {videos.length > 0 && (
        <div
          className="flex gap-2.5 overflow-x-auto px-3 pb-3"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {videos.map(video => (
            <ReelThumb key={video.id} video={video} onOpen={openReels} />
          ))}
        </div>
      )}

      {/* Articles below */}
      {articles.length > 0 && (
        <div className="px-3 space-y-2 mt-2">
          {articles.slice(0, 3).map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              catColor={category.color}
              catLabel={category.label}
            />
          ))}
          {articles.length > 3 && (
            <Link
              to={createPageUrl(`Category?cat=${category.id}`)}
              className="block text-center py-2.5 text-sm font-bold rounded-xl border border-gray-800 hover:border-gray-600 transition-colors"
              style={{ color: category.color }}
            >
              הצג עוד {articles.length - 3} כתבות →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function HomeCategoryFeed() {
  // Get current user
  const [currentUser, setCurrentUser] = React.useState(null);
  React.useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  // Load all videos + articles once
  // Share the same cache as ReelsStrip — no double fetch
  const { data: allVideos = [] } = useQuery({
    queryKey: ["home-all-videos"],
    queryFn: () => base44.entities.UserVideo.list("-created_date", 50),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  // Share the same cache as pages/Home featured-articles
  const { data: allArticles = [] } = useQuery({
    queryKey: ["featured-articles"],
    queryFn: async () => {
      try { return await base44.entities.NewsArticle.list("-created_date", 50); }
      catch { return []; }
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const { data: customCatsDB = [] } = useQuery({
    queryKey: ["custom-categories-db"],
    queryFn: () => base44.entities.CustomCategory.list("-created_date", 20),
    staleTime: 30 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  });

  // Filter valid videos (no ObjectID titles, no audio, no podcasts)
  const cleanVideos = allVideos.filter(v => {
    const title = (v.title || "").trim();
    const url = (v.video_url || "").toLowerCase();
    const isAudio = [".mp3", ".m4a", ".wav", ".ogg", ".aac"].some(ext => url.includes(ext));
    return !isAudio && v.feed !== "podcasts" && title && !isObjectId(title);
  });

  // Show all articles (no filtering)
  const userArticles = allArticles;

  // Determine active categories — builtin + custom ones that have content
  const activeCategories = [];
  const seenIds = new Set();

  // built-in categories that have videos or articles (show even if empty for first 3)
  let displayedCount = 0;
  for (const cat of CATEGORIES) {
    const catVideos = cleanVideos.filter(v => v.category === cat.id);
    const catArticles = userArticles.filter(a => a.category === cat.id);
    // Show first 3 categories even if empty, others only if they have content
    if (catVideos.length > 0 || catArticles.length > 0 || displayedCount < 3) {
      activeCategories.push({ ...cat, videos: catVideos, articles: catArticles });
      seenIds.add(cat.id);
      if (catVideos.length > 0 || catArticles.length > 0) displayedCount++;
    }
  }

  // custom categories from DB that have content
  for (const dbCat of customCatsDB) {
    if (seenIds.has(dbCat.id)) continue;
    const catVideos = cleanVideos.filter(v => v.category === dbCat.id);
    const catArticles = userArticles.filter(a => (a.category === "custom" || a.category === dbCat.id) && (a.custom_category === dbCat.label || !a.custom_category));
    if (catVideos.length > 0 || catArticles.length > 0) {
      activeCategories.push({
        id: dbCat.id,
        label: dbCat.label,
        color: dbCat.color || "#6366F1",
        videos: catVideos,
        articles: catArticles,
      });
    }
  }

  return (
    <div className="w-full">
      {activeCategories.map(cat => (
        <CategoryBlock
          key={cat.id}
          category={cat}
          videos={cat.videos}
          articles={cat.articles}
        />
      ))}
    </div>
  );
}