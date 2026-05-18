import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { ChevronDown, ChevronUp, Eye, Clock, TrendingUp } from "lucide-react";

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

function ArticleCard({ article, categoryColor }) {
  if (!article) return null;

  return (
    <Link to={createPageUrl(`Article?id=${article.id}`)} className="block">
      <Card className="bg-[#0a0a0a] border border-gray-800 overflow-hidden hover:border-[#0057B8]/50 transition-all hover:shadow-lg hover:shadow-[#0057B8]/20 group">
        <div className="flex gap-3 p-3">
          <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
            {article.image_url ? (
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-gray-700" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm mb-1 line-clamp-2 group-hover:text-[#0057B8] transition-colors">
              {article.title}
            </h3>
            {article.subtitle && (
              <p className="text-gray-400 text-xs mb-2 line-clamp-1">
                {article.subtitle}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(article.created_date).toLocaleDateString('he-IL')}
              </span>
              {article.views && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {article.views}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function CategorySection({ category, articles }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayArticles = articles.slice(0, isExpanded ? articles.length : 5);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            categoryColor={category.color}
          />
        ))}
      </div>
      {articles.length > 5 && (
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
              הצג עוד {articles.length - 5} כתבות
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
          <TrendingUp className="w-5 h-5 text-[#0057B8]" />
          <h2 className="text-white font-bold text-xl">כל הכתבות לפי קטגוריות</h2>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <Card key={j} className="bg-[#0a0a0a] border border-gray-800">
                      <Skeleton className="h-32" />
                      <div className="p-3 space-y-2">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </Card>
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