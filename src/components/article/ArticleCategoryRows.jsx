import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { ChevronLeft } from "lucide-react";
import moment from "moment";

const CATEGORIES = [
  { id: "breaking", label: "חדשות חמות" },
  { id: "security", label: "ביטחון ומדיניות" },
  { id: "economy", label: "כלכלה ועסקים" },
  { id: "politics", label: "פוליטיקה" },
  { id: "technology", label: "טכנולוגיה" },
  { id: "sports", label: "ספורט" },
  { id: "entertainment", label: "בידור" },
  { id: "world", label: "חדשות עולם" },
  { id: "health", label: "בריאות" },
  { id: "crime", label: "פלילים" },
  { id: "israel", label: "חדשות ישראל" },
  { id: "military", label: "צבא וביטחון" },
];

const categoryColors = {
  breaking: "bg-[#E31E24]",
  security: "bg-orange-500",
  economy: "bg-green-600",
  politics: "bg-purple-600",
  technology: "bg-blue-600",
  sports: "bg-emerald-600",
  entertainment: "bg-pink-500",
  world: "bg-indigo-600",
  health: "bg-teal-600",
  crime: "bg-red-700",
  israel: "bg-blue-700",
  military: "bg-gray-600",
};

function CategoryRow({ category, label, currentArticleId }) {
  const { data: articles = [] } = useQuery({
    queryKey: ["cat-row", category],
    queryFn: () => base44.entities.NewsArticle.filter({ category }, "-created_date", 5),
    staleTime: 5 * 60 * 1000,
  });

  const filtered = articles.filter((a) => a.id !== currentArticleId).slice(0, 4);
  if (filtered.length === 0) return null;

  const badgeColor = categoryColors[category] || "bg-gray-600";

  return (
    <div className="mb-10">
      {/* Row header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className={`inline-block w-3 h-3 rounded-full ${badgeColor}`} />
          {label}
        </h2>
        <Link
          to={createPageUrl(`Category?cat=${category}`)}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
        >
          לכל הכתבות
          <ChevronLeft size={16} />
        </Link>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {filtered.map((article) => (
          <Link
            key={article.id}
            to={createPageUrl(`Article?id=${article.id}`)}
            className="group bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-all hover:scale-[1.02]"
          >
            {/* Image or video thumbnail */}
            {article.image_url ? (
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-36 object-cover"
              />
            ) : (
              <div className={`w-full h-36 ${badgeColor} opacity-20 flex items-center justify-center`}>
                <span className="text-white text-3xl opacity-50">📰</span>
              </div>
            )}
            <div className="p-3">
              <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${badgeColor} mb-2 inline-block`}>
                {label}
              </span>
              <h3 className="text-white text-sm font-bold line-clamp-2 leading-snug group-hover:text-gray-200">
                {article.title}
              </h3>
              <p className="text-gray-500 text-xs mt-1">
                {moment(article.created_date).fromNow()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ArticleCategoryRows({ currentArticleId }) {
  return (
    <div className="mb-12 border-t border-gray-800 pt-10">
      <h2 className="text-2xl font-bold text-white mb-8">עוד כתבות לפי קטגוריה</h2>
      {CATEGORIES.map((cat) => (
        <CategoryRow
          key={cat.id}
          category={cat.id}
          label={cat.label}
          currentArticleId={currentArticleId}
        />
      ))}
    </div>
  );
}