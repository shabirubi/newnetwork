import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, X, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import moment from "moment";

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

export default function NewsTimeline() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(null);

  const { data: articles = [] } = useQuery({
    queryKey: ['timeline-articles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 100),
    initialData: []
  });

  const todayArticles = articles.filter(a => {
    const articleDate = new Date(a.created_date);
    const today = new Date();
    return articleDate.toDateString() === today.toDateString();
  });

  const hourlyData = {};
  todayArticles.forEach(article => {
    const hour = new Date(article.created_date).getHours();
    if (!hourlyData[hour]) {
      hourlyData[hour] = [];
    }
    hourlyData[hour].push(article);
  });

  const hours = Object.keys(hourlyData).sort((a, b) => b - a);

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 cursor-pointer shadow-2xl"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">ציר זמן</h3>
            <p className="text-emerald-100">מעקב אחר התפתחויות</p>
          </div>
        </div>
        <p className="text-white/90 text-sm">
          עקוב אחרי ההתפתחויות של היום לפי שעות
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
                  <Clock className="w-8 h-8 text-emerald-600" />
                  <h2 className="text-3xl font-bold dark:text-white">ציר זמן של חדשות היום</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 dark:text-white" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  {todayArticles.length} כתבות היום • {moment().format('dddd, DD MMMM')}
                </p>
              </div>

              {hours.length > 0 ? (
                <div className="space-y-4">
                  {hours.map(hour => (
                    <div key={hour} className="relative">
                      <button
                        onClick={() => setSelectedHour(selectedHour === hour ? null : hour)}
                        className="w-full flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-emerald-600 text-white font-bold rounded-full w-16 h-16 flex items-center justify-center text-lg">
                            {hour}:00
                          </div>
                          <div className="text-right">
                            <p className="font-bold dark:text-white">
                              {hourlyData[hour].length} כתבות
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              לחץ לצפייה
                            </p>
                          </div>
                        </div>
                        <ArrowRight className={`w-5 h-5 transition-transform ${selectedHour === hour ? 'rotate-90' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {selectedHour === hour && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mr-8 mt-3 space-y-2 border-r-2 border-emerald-600 pr-4">
                              {hourlyData[hour].map(article => (
                                <Link
                                  key={article.id}
                                  to={createPageUrl(`Article?id=${article.id}`)}
                                  className="block bg-white dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                      <h4 className="font-bold dark:text-white mb-1">{article.title}</h4>
                                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span>{categoryLabels[article.category]}</span>
                                        <span>•</span>
                                        <span>{moment(article.created_date).format('HH:mm')}</span>
                                      </div>
                                    </div>
                                    {article.is_breaking && (
                                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                        🔥 חם
                                      </span>
                                    )}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                  אין כתבות מהיום עדיין
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}