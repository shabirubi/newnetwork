import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Zap, Clock } from "lucide-react";
import moment from "moment";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function EntertainmentUpdatesFeed() {
  const { data: entertainmentNews = [] } = useQuery({
    queryKey: ['entertainment-updates-feed'],
    queryFn: () => base44.entities.NewsArticle.filter(
      { category: 'entertainment' },
      '-created_date',
      8
    ),
    refetchInterval: 120000,
    initialData: []
  });

  const { data: sportsNews = [] } = useQuery({
    queryKey: ['sports-updates-feed'],
    queryFn: () => base44.entities.NewsArticle.filter(
      { category: 'sports' },
      '-created_date',
      8
    ),
    refetchInterval: 120000,
    initialData: []
  });

  const combined = [...entertainmentNews, ...sportsNews].sort(
    (a, b) => new Date(b.created_date) - new Date(a.created_date)
  ).slice(0, 8);

  return (
    <div className="sticky top-6 bg-black">
      {/* Header */}
      <div className="p-4 pb-3">
        <h2 className="font-bold text-lg text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          ספורט והפנאי
        </h2>
      </div>

      {/* Feed - Scrollable with animations */}
      <div className="max-h-[600px] overflow-y-auto space-y-0">
        {combined.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, x: 20 }}
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
                  <div 
                    className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1"
                  >
                    <Zap size={10} className="text-yellow-500" />
                    {article.category === 'sports' ? 'ספורט' : 'פנאי'}
                  </div>
                </div>
              )}

              {/* Content */}
              <div>
                <p className="text-xs text-white font-bold line-clamp-2 leading-snug mb-1.5 group-hover:text-yellow-500 transition-colors">
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
        to={createPageUrl("Category?cat=sports")}
        className="block p-3 text-center hover:text-yellow-500 transition-colors border-t border-gray-800 mt-2"
      >
        <span className="text-gray-300 font-bold text-sm">לכל העדכונים →</span>
      </Link>
    </div>
  );
}