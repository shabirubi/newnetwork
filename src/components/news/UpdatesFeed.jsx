import React, { useEffect } from "react";
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
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 8),
    refetchInterval: 120000,
    initialData: []
  });

  return (
    <div className="sticky top-6 bg-black">
      {/* Header */}
      <div className="p-4 pb-3">
        <h2 className="font-bold text-lg text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-[#E31E24]" />
          עדכונים חמים
        </h2>
      </div>

      {/* Feed - Scrollable with animations */}
      <motion.div 
        className="max-h-[600px] overflow-y-auto space-y-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        {breakingNews.slice(0, 8).map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border-b border-gray-800 hover:bg-gray-900/50 transition-all group"
            >
            <Link 
              to={createPageUrl(`Article?id=${article.id}`)}
              className="block p-3"
            >
              {/* Image if available */}
              {article.image_url && (
                <div className="w-full h-24 rounded-lg overflow-hidden mb-2.5 relative">
                  <img 
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {article.is_breaking && (
                    <div className="absolute -top-1 -right-1 w-3 h-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E31E24] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E31E24]"></span>
                    </div>
                  )}
                  <div 
                    className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1"
                  >
                    <Flame size={10} className="animate-pulse" />
                    חם
                  </div>
                </div>
              )}

              {/* Content */}
              <div>
                <p className="text-xs text-white font-bold line-clamp-2 leading-snug mb-1.5 group-hover:text-[#E31E24] transition-colors">
                  {article.title}
                </p>
                {article.subtitle && (
                  <p className="text-[10px] text-gray-400 line-clamp-1 mb-2">
                    {article.subtitle}
                  </p>
                )}
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <Clock size={10} />
                  <span className="font-medium">
                    {new Date(article.created_date).toLocaleTimeString('he-IL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span>• {moment(article.created_date).fromNow()}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <Link 
        to={createPageUrl("Category?cat=breaking")}
        className="block p-3 text-center hover:text-[#E31E24] transition-colors border-t border-gray-800 mt-2"
      >
        <span className="text-gray-300 font-bold text-sm">לכל החדשות החמות →</span>
      </Link>
    </div>
  );
}