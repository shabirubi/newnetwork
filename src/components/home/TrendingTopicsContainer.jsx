import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Flame, Eye } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function TrendingTopicsContainer() {
  const { data: articles = [] } = useQuery({
    queryKey: ['trending-articles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 50),
    initialData: []
  });

  // Get unique categories with their popularity
  const categoryStats = articles.reduce((acc, article) => {
    const existing = acc.find(c => c.category === article.category);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ category: article.category, count: 1, label: article.category });
    }
    return acc;
  }, []);

  const topTrending = categoryStats
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const categoryLabels = {
    breaking: "🔥 חדשות חמות",
    security: "🛡️ ביטחון",
    economy: "💰 כלכלה",
    politics: "🏛️ פוליטיקה",
    technology: "💻 טכנולוגיה",
    sports: "⚽ ספורט",
    entertainment: "🎬 בידור",
    world: "🌍 עולם",
    health: "⚕️ בריאות"
  };

  return (
    <section className="px-4 sm:px-4 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#E31E24]" />
          <h2 className="text-2xl font-bold dark:text-white">טרנדים עכשיו</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {topTrending.map((item, idx) => (
          <motion.a
            key={item.category}
            href={`#`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.05 }}
            className="relative group"
          >
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 hover:border-[#E31E24]/50 transition-all h-full flex flex-col justify-between">
              {/* Header */}
              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  {categoryLabels[item.category] || item.category}
                </h3>
              </div>

              {/* Stats */}
              <div className="flex items-end justify-between pt-4 border-t border-gray-700">
                <div>
                  <div className="text-[#E31E24] font-bold text-2xl">{item.count}</div>
                  <div className="text-gray-400 text-xs">כתבות</div>
                </div>
                <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}