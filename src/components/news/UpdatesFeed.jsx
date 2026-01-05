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
    <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-6 border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#E31E24] to-[#B91C1C] p-3 border-b border-red-700">
        <h2 className="font-bold text-sm text-white flex items-center gap-2">
          <Flame className="w-4 h-4 animate-pulse" />
          חדשות חמות
        </h2>
      </div>

      {/* Feed */}
      <div className="max-h-[calc(100vh-180px)] overflow-y-auto bg-gray-50">
        {breakingNews.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <Link 
              to={createPageUrl(`Article?id=${article.id}`)}
              className="block p-3"
            >
              {/* Image if available */}
              {article.image_url && (
                <div className="w-full h-24 rounded overflow-hidden mb-2">
                  <img 
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-3 h-3 text-[#E31E24]" />
                  <span className="text-[10px] text-[#E31E24] font-bold">חם</span>
                </div>
                <p className="text-xs text-gray-900 font-bold line-clamp-2 leading-tight mb-1">
                  {article.title}
                </p>
                {article.subtitle && (
                  <p className="text-[10px] text-gray-600 line-clamp-1 mb-1">
                    {article.subtitle}
                  </p>
                )}
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <Clock size={10} />
                  {moment(article.created_date).fromNow()}
                </div>
              </div>
            </Link>
          </motion.div>
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