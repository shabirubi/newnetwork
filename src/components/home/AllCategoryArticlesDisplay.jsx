import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { ChevronDown, ChevronUp, Eye, Clock } from "lucide-react";

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

function CategoryArticleCard({ article, category }) {
  if (!article) return null;

  const displayImages = article.extra_images || [];
  const displayVideos = article.extra_videos || [];

  return (
    <div className="bg-[#0d0d0d] rounded-2xl overflow-hidden border border-gray-800 hover:border-[#0057B8]/50 transition-all">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Media Gallery */}
        <div className="relative h-64 lg:h-auto overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
          {article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-600">ללא תמונה</span>
            </div>
          )}
          <Badge
            className="absolute top-3 right-3 font-bold text-xs"
            style={{ backgroundColor: category.color, color: '#fff' }}
          >
            {category.label}
          </Badge>
          {article.is_breaking && (
            <Badge className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold animate-pulse">
              🔴 דחוף
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col p-5 gap-3">
          <h3 className="text-white text-xl font-bold leading-tight line-clamp-2">
            {article.title}
          </h3>
          {article.subtitle && (
            <p className="text-gray-300 text-sm">{article.subtitle}</p>
          )}
          {article.content && (
            <p className="text-gray-400 text-xs leading-relaxed line-clamp-3" style={{ whiteSpace: 'pre-wrap' }}>
              {article.content}
            </p>
          )}
          <div className="mt-auto pt-2 flex items-center gap-3">
            <Link
              to={createPageUrl(`Article?id=${article.id}`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0057B8] hover:bg-[#1a6fd4] text-white text-xs font-bold rounded-xl transition-colors"
            >
              קרא עוד →
            </Link>
            <span className="text-gray-600 text-xs">
              {displayImages.length + (article.image_url ? 1 : 0)} תמונות · {displayVideos.length + (article.video_url ? 1 : 0)} סרטונים
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategorySection({ category, articles }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayArticles = articles.slice(0, isExpanded ? articles.length : 3);

  if (articles.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 rounded-full" style={{ backgroundColor: category.color }} />
        <h3 className="text-white font-bold text-lg">{category.label}</h3>
        <Badge className="text-xs" style={{ backgroundColor: category.color, color: '#fff' }}>
          {articles.length} כתבות
        </Badge>
      </div>
      <div className="space-y-4">
        {displayArticles.map((article) => (
          <CategoryArticleCard
            key={article.id}
            article={article}
            category={category}
          />
        ))}
      </div>
      {articles.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex items-center gap-2 mx-auto px-6 py-3 bg-[#0057B8]/20 hover:bg-[#0057B8]/30 rounded-full text-[#0057B8] font-bold transition-all"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              צמצם כתבות
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              הצג עוד {articles.length - 3} כתבות
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default function AllCategoryArticlesDisplay() {
  const { data: articles, isLoading } = useQuery({
    queryKey: ['all-category-articles-full'],
    queryFn: async () => {
      try {
        const allArticles = await base44.entities.NewsArticle.list('-created_date', 500);
        return allArticles || [];
      } catch (err) {
        console.error('Failed to fetch articles:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const getArticlesByCategory = (categoryId) => {
    if (!articles) return [];
    return articles.filter(article => article.category === categoryId);
  };

  return (
    <div className="w-full px-2 sm:px-4 mb-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-6 rounded-full bg-[#E31E24]" />
          <h2 className="text-white font-bold text-xl">כל הכתבות לפי קטגוריות</h2>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-64 w-full rounded-2xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {CATEGORIES.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                articles={getArticlesByCategory(category.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}