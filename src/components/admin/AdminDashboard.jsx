import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Users, Video, Newspaper, DollarSign, TrendingUp, Eye, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users-count'],
    queryFn: () => base44.entities.User.list('created_date', 1000)
  });

  const { data: videos = [], isLoading: loadingVideos } = useQuery({
    queryKey: ['admin-videos-count'],
    queryFn: () => base44.entities.UserVideo.list('created_date', 1000)
  });

  const { data: articles = [], isLoading: loadingArticles } = useQuery({
    queryKey: ['admin-articles-count'],
    queryFn: () => base44.entities.NewsArticle.list('created_date', 1000)
  });

  const { data: subscriptions = [], isLoading: loadingSubscriptions } = useQuery({
    queryKey: ['admin-subscriptions-count'],
    queryFn: () => base44.entities.Subscription.list('created_date', 1000)
  });

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const totalRevenue = activeSubscriptions * 99; // חישוב פשוט
  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);

  const stats = [
    { 
      label: 'משתמשים', 
      value: users.length, 
      icon: Users, 
      color: 'from-blue-500 to-blue-600',
      loading: loadingUsers 
    },
    { 
      label: 'סרטונים', 
      value: videos.length, 
      icon: Video, 
      color: 'from-purple-500 to-purple-600',
      loading: loadingVideos 
    },
    { 
      label: 'חדשות', 
      value: articles.length, 
      icon: Newspaper, 
      color: 'from-green-500 to-green-600',
      loading: loadingArticles 
    },
    { 
      label: 'מנויים פעילים', 
      value: activeSubscriptions, 
      icon: DollarSign, 
      color: 'from-yellow-500 to-yellow-600',
      loading: loadingSubscriptions 
    },
    { 
      label: 'הכנסות חודשיות', 
      value: `₪${totalRevenue}`, 
      icon: TrendingUp, 
      color: 'from-red-500 to-red-600',
      loading: loadingSubscriptions 
    },
    { 
      label: 'צפיות כוללות', 
      value: totalViews.toLocaleString(), 
      icon: Eye, 
      color: 'from-pink-500 to-pink-600',
      loading: loadingVideos 
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">לוח בקרה</h2>
        <p className="text-gray-400">סקירה כללית של המערכת</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8 text-white/90" />
                {stat.loading && <Loader2 className="w-5 h-5 text-white/70 animate-spin" />}
              </div>
              <p className="text-white/80 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">
                {stat.loading ? '...' : stat.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white mb-4">פעילות אחרונה</h3>
        <div className="space-y-3">
          {articles.slice(0, 5).map((article) => (
            <div key={article.id} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl">
              <Newspaper className="w-5 h-5 text-green-400" />
              <div className="flex-1 min-w-0">
                <p className="text-white truncate">{article.title}</p>
                <p className="text-gray-400 text-sm">
                  {new Date(article.created_date).toLocaleString('he-IL')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}