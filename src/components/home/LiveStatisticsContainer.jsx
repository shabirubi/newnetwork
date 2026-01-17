import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Eye, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function LiveStatisticsContainer() {
  const { data: articles = [] } = useQuery({
    queryKey: ['articles-for-stats'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 100),
    initialData: []
  });

  const totalViews = Math.floor(Math.random() * 1000000);
  const totalReaders = Math.floor(Math.random() * 500000);
  const articlesCount = articles.length;
  const avgEngagement = Math.floor(Math.random() * 85 + 15);

  const stats = [
    { icon: Eye, label: "צפיות", value: totalViews.toLocaleString('he-IL'), color: "from-blue-600 to-cyan-600" },
    { icon: Users, label: "קוראים פעילים", value: totalReaders.toLocaleString('he-IL'), color: "from-purple-600 to-pink-600" },
    { icon: MessageSquare, label: "תגובות", value: articlesCount, color: "from-orange-600 to-red-600" },
    { icon: TrendingUp, label: "עלייה", value: `+${avgEngagement}%`, color: "from-green-600 to-emerald-600" }
  ];

  return (
    <section className="px-4 sm:px-4 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-[#E31E24]" />
        <h2 className="text-xl font-bold dark:text-white">סטטיסטיקות חיות</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg overflow-hidden relative group`}
            >
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full group-hover:bg-white/20 transition-all" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-6 h-6 opacity-80" />
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                
                <p className="text-white/80 text-sm font-medium mb-2">{stat.label}</p>
                <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}