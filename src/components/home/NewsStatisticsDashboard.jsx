import React from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Eye, TrendingUp, Users, Zap, Clock } from "lucide-react";

export default function NewsStatisticsDashboard() {
  const { data: articles = [] } = useQuery({
    queryKey: ['stats-articles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 100),
    initialData: [],
    refetchInterval: 30000
  });

  const { data: channels = [] } = useQuery({
    queryKey: ['stats-channels'],
    queryFn: () => base44.entities.NewsChannel.list(),
    initialData: [],
    refetchInterval: 30000
  });

  // Calculate statistics
  const totalArticles = articles.length;
  const breakingCount = articles.filter(a => a.is_breaking).length;
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const avgViewsPerArticle = totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0;

  const categoryStats = articles.reduce((acc, article) => {
    const existing = acc.find(c => c.category === article.category);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({
        category: article.category,
        count: 1,
        views: article.views || 0
      });
    }
    return acc;
  }, []).sort((a, b) => b.count - a.count).slice(0, 5);

  const stats = [
    {
      label: "סך הכתבות",
      value: totalArticles,
      icon: BarChart3,
      color: "from-blue-600 to-blue-900",
      textColor: "text-blue-400"
    },
    {
      label: "חדשות חמות",
      value: breakingCount,
      icon: Zap,
      color: "from-yellow-600 to-yellow-900",
      textColor: "text-yellow-400"
    },
    {
      label: "סך הצפיות",
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: "from-purple-600 to-purple-900",
      textColor: "text-purple-400"
    },
    {
      label: "ממוצע צפיות",
      value: avgViewsPerArticle.toLocaleString(),
      icon: TrendingUp,
      color: "from-green-600 to-green-900",
      textColor: "text-green-400"
    }
  ];

  return (
    <section className="px-4 sm:px-4 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold dark:text-white">סטטיסטיקות חיות</h2>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`bg-gradient-to-br ${stat.color} rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all cursor-pointer group`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <div className="text-white/70 text-sm font-medium mb-1">{stat.label}</div>
              <div className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Category Rankings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700"
      >
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-[#E31E24]" />
          <h3 className="text-white font-bold text-lg">קטגוריות מובילות</h3>
        </div>

        <div className="space-y-3">
          {categoryStats.map((stat, idx) => {
            const maxCount = categoryStats[0]?.count || 1;
            const percentage = (stat.count / maxCount) * 100;
            
            return (
              <motion.div
                key={stat.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-gray-300 font-bold text-sm capitalize">
                    {stat.category}
                  </span>
                  <span className="text-gray-400 text-xs ml-auto">{stat.count} כתבות</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: idx * 0.1 + 0.3, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-[#E31E24] to-red-600 rounded-full"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Active Channels */}
      {channels.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-green-500" />
            <h3 className="text-white font-bold text-lg">ערוצים פעילים</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {channels.slice(0, 4).map((channel) => (
              <motion.div
                key={channel.id}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 hover:border-green-500 transition-all cursor-pointer"
              >
                <p className="text-white font-bold text-sm mb-1">{channel.name}</p>
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                  <span className="text-xs text-green-400">שידור חי</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}