import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, RefreshCw, AlertCircle, MapPin, ExternalLink } from "lucide-react";
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
        prompt: `Professional news image for: ${article.title}. High quality, modern journalism style, professional photograph directly related to the news story. Category: ${article.category}. Clean, presentable for news media. IMPORTANT: NO TEXT OR LETTERS in the image, only relevant visual content.`
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

  const countryFlags = {
    'USA': '🇺🇸',
    'UK': '🇬🇧',
    'France': '🇫🇷',
    'Germany': '🇩🇪',
    'China': '🇨🇳',
    'Russia': '🇷🇺',
    'Japan': '🇯🇵',
    'India': '🇮🇳',
    'Brazil': '🇧🇷',
    'Ukraine': '🇺🇦',
    'Israel': '🇮🇱',
    'Iran': '🇮🇷',
    'Turkey': '🇹🇷',
    'Saudi Arabia': '🇸🇦',
    'South Korea': '🇰🇷',
    'Italy': '🇮🇹',
    'Spain': '🇪🇸',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'Mexico': '🇲🇽',
    'default': '🌍'
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
        <div className="bg-gradient-to-br from-black/80 via-[#E31E24]/30 to-black/80 backdrop-blur-sm border-2 border-[#E31E24]/60 rounded-xl p-4 flex items-center gap-2 text-white mb-6">
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
            className="bg-gradient-to-br from-black/80 via-[#E31E24]/30 to-black/80 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-[#E31E24]/40 hover:border-[#E31E24]/80 transition-all group cursor-pointer h-full flex flex-col"
            style={{
              boxShadow: '0 0 20px rgba(227, 30, 36, 0.3), inset 0 0 20px rgba(227, 30, 36, 0.1)'
            }}
          >
            {/* Image Container */}
            {article.image_url ? (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                {/* Country Flag */}
                {article.source && (
                  <div className="absolute top-3 right-3 text-3xl drop-shadow-lg">
                    {countryFlags[article.source] || countryFlags.default}
                  </div>
                )}
              </div>
            ) : generatingImages[article.title] ? (
              <div className="h-48 bg-gradient-to-br from-black/60 via-[#E31E24]/30 to-black/60 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-black/60 via-[#E31E24]/30 to-black/60" />
            )}

            {/* Content */}
            <div className="p-5 flex flex-col flex-1 text-white">
              {/* Source & Location */}
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-3 h-3 text-[#E31E24]" />
                <span className="text-xs font-bold text-white/90">
                  {article.source || 'עולם'}
                </span>
                {article.category && (
                  <>
                    <span className="text-white/40">•</span>
                    <span className="text-xs text-white/70 capitalize">
                      {article.category}
                    </span>
                  </>
                )}
              </div>

              {/* Title */}
              <h3 className="font-bold text-base line-clamp-2 mb-2 group-hover:text-[#E31E24] transition-colors">
                {article.title}
              </h3>

              {/* Description */}
              <p className="text-white/80 text-sm line-clamp-3 mb-4 flex-1">
                {article.description}
              </p>

              {/* Read More Link */}
              <div className="flex items-center gap-2 text-xs text-white/80 hover:text-[#E31E24] transition-colors pt-3 border-t border-[#E31E24]/30">
                <ExternalLink className="w-3 h-3" />
                <span>קרא עוד</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {!loading && articles.length === 0 && !error && (
        <div className="text-center py-12 bg-gradient-to-br from-black/80 via-[#E31E24]/20 to-black/80 backdrop-blur-sm rounded-2xl border-2 border-[#E31E24]/40">
          <Globe className="w-12 h-12 text-[#E31E24] mx-auto mb-4" />
          <p className="text-gray-400">אין חדשות זמינות כרגע</p>
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