import React from "react";
import { motion } from "framer-motion";
import { BarChart3, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function MostViewedContainer() {
  const { data: articles = [] } = useQuery({
    queryKey: ['most-viewed-articles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 20),
    initialData: []
  });

  const topArticles = articles.slice(0, 5);

  return (
    <section className="px-4 sm:px-4 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-[#E31E24]" />
        <h2 className="text-xl font-bold dark:text-white">הכתבות הפופולריות ביותר</h2>
      </div>

      <div className="space-y-3">
        {topArticles.map((article, idx) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group"
          >
            <Link
              to={createPageUrl(`Article?id=${article.id}`)}
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/30 dark:from-gray-800 dark:to-gray-900 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all border border-gray-700/50 dark:border-gray-700"
            >
              {/* Rank */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center font-bold text-white">
                  #{idx + 1}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white line-clamp-1 group-hover:text-[#E31E24] transition-colors">
                  {article.title}
                </h3>
                {article.subtitle && (
                  <p className="text-gray-400 text-sm line-clamp-1">{article.subtitle}</p>
                )}
              </div>

              {/* Views */}
              <div className="flex-shrink-0 flex items-center gap-1 text-gray-400 group-hover:text-[#E31E24] transition-colors">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">{Math.floor(Math.random() * 10000 + 1000).toLocaleString('he-IL')}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}