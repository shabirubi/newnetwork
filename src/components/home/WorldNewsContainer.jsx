import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, RefreshCw, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

export default function WorldNewsContainer() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingImages, setGeneratingImages] = useState({});

  const generateArticleImage = async (article) => {
    try {
      setGeneratingImages(prev => ({ ...prev, [article.title]: true }));
      const response = await base44.integrations.Core.GenerateImage({
        prompt: `Professional news image for: ${article.title}. High quality, modern journalism style, professional photograph related to: ${article.category}. Clean, presentable for news media. IMPORTANT: NO TEXT OR LETTERS in the image, only visual content.`
      });
      return response.url;
    } catch (err) {
      console.error('Image generation failed:', err);
      return null;
    } finally {
      setGeneratingImages(prev => ({ ...prev, [article.title]: false }));
    }
  };

  const fetchWorldNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('fetchWorldNews');
      console.log('World news response:', response);
      const newsArticles = response.data?.articles || response?.articles || [];
      const articlesWithImages = await Promise.all(
        (Array.isArray(newsArticles) ? newsArticles : []).map(async (article) => {
          const imageUrl = await generateArticleImage(article);
          return { ...article, image_url: imageUrl };
        })
      );
      setArticles(articlesWithImages);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-gradient-to-br ${getCategoryColor(article.category)} rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all group cursor-pointer h-full flex flex-col`}
          >
            {/* Image Container */}
            {article.image_url ? (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            ) : generatingImages[article.title] ? (
              <div className="h-48 bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-gray-600 to-gray-700" />
            )}

            {/* Content */}
            <div className="p-5 flex flex-col flex-1 text-white">
              {/* Badge */}
              <div className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 w-fit backdrop-blur-sm">
                {article.source || 'חדשות'}
              </div>

              {/* Title */}
              <h3 className="font-bold text-base line-clamp-2 mb-2 group-hover:text-yellow-200 transition-colors">
                {article.title}
              </h3>

              {/* Description */}
              <p className="text-white/80 text-sm line-clamp-2 mb-4 flex-1">
                {article.description}
              </p>

              {/* Category Tag */}
              {article.category && (
                <span className="text-[11px] text-white/70 bg-white/10 px-3 py-1 rounded-full w-fit">
                  {article.category}
                </span>
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