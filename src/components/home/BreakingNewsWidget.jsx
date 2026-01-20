import React from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Zap, Clock, TrendingUp } from "lucide-react";
import moment from "moment";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function BreakingNewsWidget() {
  const { data: breakingNews = [] } = useQuery({
    queryKey: ['breaking-news'],
    queryFn: () => base44.entities.NewsArticle.filter({ is_breaking: true }, '-created_date', 8),
    initialData: [],
    refetchInterval: 15000
  });

  const topBreaking = breakingNews.slice(0, 4);

  return (
    <section className="px-4 sm:px-4 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
          <h2 className="text-2xl font-bold dark:text-white">חדשות חמות עכשיו</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {topBreaking.map((article, idx) => (
          <Link
            key={article.id}
            to={createPageUrl(`Article?id=${article.id}`)}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ x: 5 }}
              className="relative bg-gradient-to-br from-black/80 via-[#E31E24]/30 to-black/80 backdrop-blur-sm rounded-xl p-4 border-2 border-[#E31E24]/40 overflow-hidden group cursor-pointer"
              style={{
                boxShadow: '0 0 20px rgba(227, 30, 36, 0.3), inset 0 0 20px rgba(227, 30, 36, 0.1)'
              }}
            >
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#E31E24]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E31E24] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E31E24]"></span>
                  </div>
                  <span className="text-[#E31E24] font-bold text-xs uppercase tracking-wider">
                    חדשות חמות
                  </span>
                  <span className="text-gray-400 text-xs ml-auto">
                    {moment(article.created_date).fromNow()}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#E31E24] transition-colors">
                  {article.title}
                </h3>

                {/* Subtitle */}
                {article.subtitle && (
                  <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                    {article.subtitle}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E31E24]/30">
                  {article.source && (
                    <span className="text-xs text-gray-400">מקור: {article.source}</span>
                  )}
                  <span className="text-xs text-[#E31E24] font-bold ml-auto">
                    קרא עוד →
                  </span>
                </div>
              </div>

              {/* Right Border Accent */}
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#E31E24] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </motion.div>
          </Link>
        ))}
      </div>

      {breakingNews.length === 0 && (
        <div className="bg-gradient-to-br from-black/80 via-[#E31E24]/20 to-black/80 backdrop-blur-sm rounded-xl p-8 text-center border-2 border-[#E31E24]/40">
          <AlertTriangle className="w-12 h-12 text-[#E31E24] mx-auto mb-3" />
          <p className="text-gray-400">אין חדשות חמות כרגע</p>
        </div>
      )}
    </section>
  );
}