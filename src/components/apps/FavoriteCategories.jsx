import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { toast } from "sonner";

const categoryLabels = {
  breaking: "חדשות חמות",
  security: "ביטחון",
  economy: "כלכלה",
  politics: "פוליטיקה",
  technology: "טכנולוגיה",
  sports: "ספורט",
  entertainment: "בידור",
  world: "עולם",
  health: "בריאות"
};

const categoryEmoji = {
  breaking: "🔥",
  security: "🛡️",
  economy: "💰",
  politics: "🗳️",
  technology: "💻",
  sports: "⚽",
  entertainment: "🎬",
  world: "🌍",
  health: "⚕️"
};

export default function FavoriteCategories() {
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('favoriteCategories');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const allCategories = Object.keys(categoryLabels);

  const { data: articles = [] } = useQuery({
    queryKey: ['favorites-articles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 50),
    initialData: []
  });

  const toggleCategory = (cat) => {
    const updated = favorites.includes(cat)
      ? favorites.filter(c => c !== cat)
      : [...favorites, cat];
    setFavorites(updated);
    localStorage.setItem('favoriteCategories', JSON.stringify(updated));
    toast.success(favorites.includes(cat) ? 'הוסר מעדפות' : 'נוסף לעדפות');
  };

  const favoriteArticles = articles.filter(a => favorites.includes(a.category));

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl p-8 cursor-pointer shadow-2xl"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 relative">
            <Heart className="w-8 h-8 text-white" />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -left-1 bg-white text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">קטגוריות אהובות</h3>
            <p className="text-red-100">עדפות אישיות</p>
          </div>
        </div>
        <p className="text-white/90 text-sm">
          בחר את הקטגוריות המתעניינות אותך ביותר
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
                  <Heart className="w-8 h-8 text-red-600" />
                  <h2 className="text-3xl font-bold dark:text-white">קטגוריות אהובות</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 dark:text-white" />
                </button>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold dark:text-white mb-4">בחר קטגוריות</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {allCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`p-4 rounded-xl transition-all font-medium text-lg ${
                        favorites.includes(cat)
                          ? 'bg-red-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white'
                      }`}
                    >
                      <span className="mr-2">{categoryEmoji[cat]}</span>
                      {categoryLabels[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {favoriteArticles.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold dark:text-white mb-4">
                    כתבות מקטגוריות אהובות ({favoriteArticles.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {favoriteArticles.map(article => (
                      <Link
                        key={article.id}
                        to={createPageUrl(`Article?id=${article.id}`)}
                        className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-xl">{categoryEmoji[article.category]}</span>
                          <h4 className="font-bold dark:text-white line-clamp-2">{article.title}</h4>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {favoriteArticles.length === 0 && favorites.length > 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  אין כתבות בקטגוריות אהובות כרגע
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}