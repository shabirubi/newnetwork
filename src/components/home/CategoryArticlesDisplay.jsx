import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Eye, Clock, TrendingUp } from "lucide-react";

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
];

function CategoryArticleCard({ category, article }) {
  if (!article) {
    return (
      <Card className="bg-[#0a0a0a] border border-gray-800 overflow-hidden h-full">
        <CardContent className="p-0">
          <div className="aspect-video bg-gray-900 flex items-center justify-center">
            <span className="text-gray-600 text-sm">אין כתבות</span>
          </div>
          <div className="p-4">
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link to={createPageUrl(`Article?id=${article.id}`)} className="block h-full">
      <Card className="bg-[#0a0a0a] border border-gray-800 overflow-hidden hover:border-[#0057B8]/50 transition-all hover:shadow-lg hover:shadow-[#0057B8]/20 h-full group">
        <div className="relative aspect-video overflow-hidden">
          {article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
              <TrendingUp className="w-12 h-12 text-gray-700" />
            </div>
          )}
          <Badge
            className="absolute top-2 right-2 font-bold text-xs"
            style={{ backgroundColor: category.color, color: '#fff' }}
          >
            {category.label}
          </Badge>
          {article.is_breaking && (
            <Badge className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold animate-pulse">
              🔴 דחוף
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="text-white font-bold text-sm mb-2 line-clamp-2 group-hover:text-[#0057B8] transition-colors">
            {article.title}
          </h3>
          {article.subtitle && (
            <p className="text-gray-400 text-xs mb-3 line-clamp-2">
              {article.subtitle}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-500">
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
        </CardContent>
      </Card>
    </Link>
  );
}

export default function CategoryArticlesDisplay() {
  const { data: articles, isLoading } = useQuery({
    queryKey: ['all-category-articles'],
    queryFn: async () => {
      try {
        const allArticles = await base44.entities.NewsArticle.list('-created_date', 100);
        return allArticles || [];
      } catch (err) {
        console.error('Failed to fetch articles:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const getLatestArticleByCategory = (categoryId) => {
    if (!articles) return null;
    return articles.find(article => article.category === categoryId);
  };

  return (
    <div className="w-full px-2 sm:px-4 mb-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-6 rounded-full bg-[#E31E24]" />
          <TrendingUp className="w-5 h-5 text-[#0057B8]" />
          <h2 className="text-white font-bold text-lg">חדשות לפי קטגוריות</h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Card key={i} className="bg-[#0a0a0a] border border-gray-800 overflow-hidden">
                <Skeleton className="aspect-video" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {CATEGORIES.map((category) => (
              <CategoryArticleCard
                key={category.id}
                category={category}
                article={getLatestArticleByCategory(category.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}