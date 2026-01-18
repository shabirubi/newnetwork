import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookMarked, X, Trash2, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import moment from "moment";

export default function ReadingList() {
  const [isOpen, setIsOpen] = useState(false);
  const [savedArticles, setSavedArticles] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('readingList');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const { data: articles = [] } = useQuery({
    queryKey: ['reading-list-articles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 20),
    initialData: []
  });

  const toggleArticle = (articleId) => {
    const updated = savedArticles.includes(articleId)
      ? savedArticles.filter(id => id !== articleId)
      : [...savedArticles, articleId];
    setSavedArticles(updated);
    localStorage.setItem('readingList', JSON.stringify(updated));
    toast.success(savedArticles.includes(articleId) ? 'הוסר מרשימת הקריאה' : 'נוסף לרשימת הקריאה');
  };

  const clearAll = () => {
    setSavedArticles([]);
    localStorage.setItem('readingList', JSON.stringify([]));
    toast.success('רשימת הקריאה נוקתה');
  };

  const savedArticlesList = articles.filter(a => savedArticles.includes(a.id));

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl p-8 cursor-pointer shadow-2xl"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 relative">
            <BookMarked className="w-8 h-8 text-white" />
            {savedArticles.length > 0 && (
              <span className="absolute -top-1 -left-1 bg-white text-violet-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {savedArticles.length}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">רשימת קריאה</h3>
            <p className="text-violet-100">שמור לקריאה מאוחרת</p>
          </div>
        </div>
        <p className="text-white/90 text-sm">
          שמור כתבות מעניינות וקרא אותן מתי שנוח לך
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
                  <BookMarked className="w-8 h-8 text-violet-600" />
                  <h2 className="text-3xl font-bold dark:text-white">רשימת הקריאה שלי</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 dark:text-white" />
                </button>
              </div>

              {savedArticlesList.length > 0 && (
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-gray-600 dark:text-gray-400">
                    {savedArticlesList.length} כתבות שמורות
                  </p>
                  <Button onClick={clearAll} variant="outline" size="sm">
                    <Trash2 className="w-4 h-4 ml-2" />
                    נקה הכל
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                {savedArticlesList.length > 0 ? (
                  <>
                    <h3 className="text-xl font-bold dark:text-white">כתבות שמורות</h3>
                    {savedArticlesList.map(article => (
                      <div
                        key={article.id}
                        className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4 flex items-start gap-4"
                      >
                        {article.image_url && (
                          <img src={article.image_url} alt={article.title} className="w-24 h-24 object-cover rounded-lg" />
                        )}
                        <div className="flex-1">
                          <Link
                            to={createPageUrl(`Article?id=${article.id}`)}
                            className="font-bold dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors block mb-2"
                          >
                            {article.title}
                          </Link>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            נשמר {moment(article.created_date).fromNow()}
                          </p>
                          <div className="flex gap-2">
                            <Link to={createPageUrl(`Article?id=${article.id}`)}>
                              <Button size="sm" variant="outline">
                                <ExternalLink className="w-4 h-4 ml-2" />
                                קרא
                              </Button>
                            </Link>
                            <Button onClick={() => toggleArticle(article.id)} size="sm" variant="outline">
                              <Trash2 className="w-4 h-4 ml-2" />
                              הסר
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <BookMarked className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                      רשימת הקריאה שלך ריקה
                    </p>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold dark:text-white">כתבות אחרונות</h3>
                      {articles.slice(0, 5).map(article => (
                        <div
                          key={article.id}
                          className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between"
                        >
                          <Link
                            to={createPageUrl(`Article?id=${article.id}`)}
                            className="font-medium dark:text-white hover:text-violet-600 transition-colors flex-1"
                          >
                            {article.title}
                          </Link>
                          <Button onClick={() => toggleArticle(article.id)} size="sm">
                            <BookMarked className="w-4 h-4 ml-2" />
                            שמור
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}