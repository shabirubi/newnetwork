import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, RefreshCw, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

export default function WorldNewsContainer() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorldNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('fetchWorldNews');
      console.log('World news response:', response);
      const newsArticles = response.data?.articles || response?.articles || [];
      setArticles(Array.isArray(newsArticles) ? newsArticles : []);
    } catch (err) {
      setError('שגיאה בטעינת חדשות עולמיות: ' + err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorldNews();
    const interval = setInterval(fetchWorldNews, 3600000); // Refresh every hour
    return () => clearInterval(interval);
  }, []);

  const categoryColors = {
    'politics': 'from-purple-600 to-purple-700',
    'economy': 'from-green-600 to-green-700',
    'technology': 'from-blue-600 to-blue-700',
    'sports': 'from-orange-600 to-orange-700',
    'world': 'from-indigo-600 to-indigo-700',
    'security': 'from-red-600 to-red-700',
    'default': 'from-gray-600 to-gray-700'
  };

  const getCategoryColor = (category) => {
    return categoryColors[category?.toLowerCase()] || categoryColors.default;
  };

  return (
    <section className="px-4 sm:px-4 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#E31E24]" />
          <h2 className="text-xl font-bold dark:text-white">חדשות מכל העולם</h2>
        </div>
        <Button
          onClick={fetchWorldNews}
          disabled={loading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'טוען...' : 'רענן'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-2 text-red-400 mb-6">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-gradient-to-br ${getCategoryColor(article.category)} rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-all group relative overflow-hidden`}
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full group-hover:bg-white/20 transition-all" />

            <div className="relative z-10">
              {/* Category Badge */}
              <div className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 backdrop-blur-sm">
                {article.source || 'חדשות'}
              </div>

              {/* Title */}
              <h3 className="font-bold text-sm md:text-base line-clamp-2 mb-2 group-hover:text-white transition-colors">
                {article.title}
              </h3>

              {/* Description */}
              <p className="text-white/80 text-xs md:text-sm line-clamp-3 mb-4">
                {article.description}
              </p>

              {/* Category Tag */}
              {article.category && (
                <div className="inline-block">
                  <span className="text-[10px] md:text-xs text-white/70 bg-white/10 px-2 py-1 rounded">
                    {article.category}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {!loading && articles.length === 0 && !error && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">אין חדשות זמינות כרגע</p>
        </div>
      )}

      {loading && articles.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E31E24]" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-4">טוען חדשות עולמיות...</p>
        </div>
      )}
    </section>
  );
}