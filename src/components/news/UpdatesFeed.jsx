import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Flame, Clock, AlertTriangle } from "lucide-react";
import moment from "moment";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function UpdatesFeed() {
  const { data: breakingNews = [] } = useQuery({
    queryKey: ['breaking-news-feed'],
    queryFn: () => base44.entities.NewsArticle.filter({ is_breaking: true }, '-created_date', 10),
    initialData: []
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden sticky top-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#E31E24] to-[#B91C1C] p-3">
        <h2 className="font-bold text-xs text-white flex items-center gap-2">
          <Flame className="w-3.5 h-3.5" />
          עדכונים
        </h2>
      </div>

      {/* Feed - No scroll, fixed height */}
      <div className="bg-gray-50 dark:bg-gray-900 h-[500px] overflow-hidden">
        {breakingNews.slice(0, 4).map((article, index) => (
          <div
            key={article.id}
            className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
            <Link 
              to={createPageUrl(`Article?id=${article.id}`)}
              className="block p-2.5"
            >
              {/* Image if available */}
              {article.image_url && (
                <div className="w-full h-20 rounded overflow-hidden mb-2 relative">
                  <img 
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                  <div 
                    className="absolute top-1 right-1 bg-[#E31E24] text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"
                  >
                    <Flame size={8} />
                    LIVE
                  </div>
                </div>
              )}

              {/* Content */}
              <div>
                <p className="text-[11px] text-gray-900 dark:text-white font-bold line-clamp-2 leading-tight mb-1">
                  {article.title}
                </p>
                {article.subtitle && (
                  <p className="text-[9px] text-gray-600 dark:text-gray-400 line-clamp-1 mb-1">
                    {article.subtitle}
                  </p>
                )}
                <div className="flex items-center gap-1 text-[9px] text-gray-500 dark:text-gray-400">
                  <Clock size={9} />
                  {moment(article.created_date).fromNow()}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Footer */}
      <Link 
        to={createPageUrl("Category?cat=breaking")}
        className="block p-2 text-center bg-gradient-to-br from-[#E31E24] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B1B] transition-colors border-t border-red-700"
      >
        <span className="text-white font-bold text-[10px]">לכל החדשות החמות →</span>
      </Link>
    </div>
  );
}