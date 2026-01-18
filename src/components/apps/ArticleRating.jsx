import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, ThumbsUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { toast } from "sonner";

export default function ArticleRating() {
  const [isOpen, setIsOpen] = useState(false);
  const [ratings, setRatings] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('articleRatings');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const { data: articles = [] } = useQuery({
    queryKey: ['rating-articles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 20),
    initialData: []
  });

  const rateArticle = (articleId, rating) => {
    const updated = { ...ratings, [articleId]: rating };
    setRatings(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('articleRatings', JSON.stringify(updated));
    }
    toast.success('דירוג נשמר!');
  };

  const topRatedArticles = articles
    .filter(a => ratings[a.id])
    .sort((a, b) => (ratings[b.id] || 0) - (ratings[a.id] || 0))
    .slice(0, 5);

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl p-8 cursor-pointer shadow-2xl"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Star className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">דירוג כתבות</h3>
            <p className="text-amber-100">דרג את הכתבות שקראת</p>
          </div>
        </div>
        <p className="text-white/90 text-sm">
          עזור לנו לשפר - דרג כתבות ותגלה המלצות מותאמות אישית
        </p>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-amber-600" />
                  <h2 className="text-3xl font-bold dark:text-white">דירוג כתבות</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 dark:text-white" />
                </button>
              </div>

              {topRatedArticles.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-amber-600" />
                    הכתבות המדורגות שלך
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {topRatedArticles.map(article => (
                      <Link
                        key={article.id}
                        to={createPageUrl(`Article?id=${article.id}`)}
                        className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                      >
                        <span className="font-medium dark:text-white flex-1">{article.title}</span>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < ratings[article.id]
                                  ? 'fill-amber-500 text-amber-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xl font-bold dark:text-white">כתבות אחרונות</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {articles.map(article => (
                    <div
                      key={article.id}
                      className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"
                    >
                      <Link
                        to={createPageUrl(`Article?id=${article.id}`)}
                        className="font-medium dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors block mb-3"
                      >
                        {article.title}
                      </Link>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => rateArticle(article.id, star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= (ratings[article.id] || 0)
                                  ? 'fill-amber-500 text-amber-500'
                                  : 'text-gray-300 hover:text-amber-400'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}