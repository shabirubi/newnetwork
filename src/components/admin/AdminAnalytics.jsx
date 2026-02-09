import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { TrendingUp, Eye, ThumbsUp, MessageCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminAnalytics() {
  const { data: videos = [], isLoading: loadingVideos } = useQuery({
    queryKey: ['admin-analytics-videos'],
    queryFn: () => base44.entities.UserVideo.list('-created_date', 1000)
  });

  const { data: articles = [], isLoading: loadingArticles } = useQuery({
    queryKey: ['admin-analytics-articles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 1000)
  });

  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.likes || 0), 0);
  const topVideos = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
  const topArticles = [...articles].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 10);

  const stats = [
    { label: 'סה"כ צפיות', value: totalViews.toLocaleString(), icon: Eye, color: 'from-blue-500 to-blue-600' },
    { label: 'סה"כ לייקים', value: totalLikes.toLocaleString(), icon: ThumbsUp, color: 'from-pink-500 to-pink-600' },
    { label: 'ממוצע צפיות', value: Math.round(totalViews / (videos.length || 1)).toLocaleString(), icon: TrendingUp, color: 'from-green-500 to-green-600' },
  ];

  if (loadingVideos || loadingArticles) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#E31E24] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">אנליטיקס</h2>
        <p className="text-gray-400">נתונים וסטטיסטיקות</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 shadow-xl`}
            >
              <Icon className="w-8 h-8 text-white/90 mb-4" />
              <p className="text-white/80 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4">סרטונים פופולריים</h3>
          <div className="space-y-2">
            {topVideos.map((video, index) => (
              <div key={video.id} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-[#E31E24] flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate text-sm">{video.title}</p>
                  <p className="text-gray-400 text-xs">{video.views || 0} צפיות</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4">חדשות אחרונות</h3>
          <div className="space-y-2">
            {topArticles.map((article) => (
              <div key={article.id} className="p-3 bg-gray-900/50 rounded-xl">
                <p className="text-white truncate text-sm">{article.title}</p>
                <p className="text-gray-400 text-xs">{article.category}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}