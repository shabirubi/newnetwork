import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, X, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function TrendingHashtags() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: articles = [] } = useQuery({
    queryKey: ['trending-hashtags'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 100),
    initialData: []
  });

  const extractHashtags = () => {
    const hashtagMap = {};
    articles.forEach(article => {
      const text = (article.title + ' ' + (article.subtitle || '') + ' ' + (article.content || '')).toLowerCase();
      const matches = text.match(/#[\w\u0590-\u05FF]+/g) || [];
      matches.forEach(tag => {
        hashtagMap[tag] = (hashtagMap[tag] || 0) + 1;
      });
    });
    
    return Object.entries(hashtagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([tag, count]) => ({ tag, count }));
  };

  const trending = extractHashtags();

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl p-8 cursor-pointer shadow-2xl"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Hash className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">תגים פופולריים</h3>
            <p className="text-cyan-100">עקוב אחרי המגמות</p>
          </div>
        </div>
        <p className="text-white/90 text-sm">
          התגים המדודים ביותר בחדשות של היום
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
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-cyan-600" />
                  <h2 className="text-3xl font-bold dark:text-white">תגים במגמה</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 dark:text-white" />
                </button>
              </div>

              {trending.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trending.map((item, index) => (
                    <motion.div
                      key={item.tag}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                          {item.tag}
                        </h3>
                        <div className="flex items-center gap-2 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 px-3 py-1 rounded-full text-sm font-bold">
                          <TrendingUp className="w-4 h-4" />
                          {item.count}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.count === 1 ? 'כתבה אחת' : `${item.count} כתבות`}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                  אין תגים זמינים
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}