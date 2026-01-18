import React from "react";
import { motion } from "framer-motion";
import { Users, Eye, TrendingUp, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function LiveStats() {
  const { data: articles = [] } = useQuery({
    queryKey: ['stats-articles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 50),
    initialData: []
  });

  const [liveViewers, setLiveViewers] = React.useState(1234);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLiveViewers(prev => prev + Math.floor(Math.random() * 20) - 10);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const todayArticles = articles.filter(a => {
    const today = new Date();
    const articleDate = new Date(a.created_date);
    return articleDate.toDateString() === today.toDateString();
  }).length;

  const breakingNews = articles.filter(a => a.is_breaking).length;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">סטטיסטיקות חיות</h3>
          <p className="text-purple-100">נתוני האתר בזמן אמת</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-white" />
            <span className="text-white/80 text-sm">צופים כעת</span>
          </div>
          <motion.div
            key={liveViewers}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-white"
          >
            {liveViewers.toLocaleString()}
          </motion.div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-white" />
            <span className="text-white/80 text-sm">כתבות היום</span>
          </div>
          <div className="text-3xl font-bold text-white">{todayArticles}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-white" />
            <span className="text-white/80 text-sm">חדשות חמות</span>
          </div>
          <div className="text-3xl font-bold text-white">{breakingNews}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-white" />
            <span className="text-white/80 text-sm">פעילות</span>
          </div>
          <div className="text-3xl font-bold text-white">גבוהה</div>
        </div>
      </div>
    </motion.div>
  );
}