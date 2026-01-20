import React from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Brain, Lightbulb, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function ExpertAnalysisContainer() {
  const { data: reporters = [] } = useQuery({
    queryKey: ['expert-reporters'],
    queryFn: () => base44.entities.Reporter.filter({ is_active: true }),
    initialData: [],
    staleTime: 30000
  });

  const { data: articles = [] } = useQuery({
    queryKey: ['analysis-articles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 20),
    initialData: []
  });

  const analysisArticles = articles
    .filter(a => ['politics', 'economy', 'security'].includes(a.category))
    .slice(0, 3);

  return (
    <section className="px-4 sm:px-4 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold dark:text-white">ניתוח עמוק - כתבים מומחים</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {analysisArticles.map((article, idx) => {
          const reporter = reporters[idx % reporters.length];
          
          return (
            <Link
              key={article.id}
              to={createPageUrl(`Article?id=${article.id}`)}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="h-full bg-gradient-to-br from-black/80 via-[#E31E24]/30 to-black/80 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-[#E31E24]/40 hover:border-[#E31E24]/80 transition-all group"
                style={{
                  boxShadow: '0 0 20px rgba(227, 30, 36, 0.3), inset 0 0 20px rgba(227, 30, 36, 0.1)'
                }}
              >
                {/* Image */}
                {article.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80"></div>
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  {/* Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                      ניתוח מומחה
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                    {article.title}
                  </h3>

                  {/* Subtitle */}
                  {article.subtitle && (
                    <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                      {article.subtitle}
                    </p>
                  )}

                  {/* Reporter Info */}
                  {reporter && (
                    <div className="border-t border-gray-700 pt-4 flex items-center gap-3">
                      <img
                        src={reporter.image}
                        alt={reporter.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold">{reporter.name}</p>
                        <p className="text-gray-400 text-xs">{reporter.specialty}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {analysisArticles.length === 0 && (
        <div className="bg-gradient-to-br from-black/80 via-[#E31E24]/20 to-black/80 backdrop-blur-sm rounded-2xl p-8 text-center border-2 border-[#E31E24]/40">
          <Brain className="w-12 h-12 text-[#E31E24] mx-auto mb-3" />
          <p className="text-gray-400">אין ניתוחים זמינים כרגע</p>
        </div>
      )}
    </section>
  );
}