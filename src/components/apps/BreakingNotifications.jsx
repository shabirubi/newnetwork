import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, BellOff, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import moment from "moment";

export default function BreakingNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [enabled, setEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('breakingNotifications') === 'true';
    }
    return false;
  });

  const { data: breakingNews = [] } = useQuery({
    queryKey: ['breaking-notifications'],
    queryFn: () => base44.entities.NewsArticle.filter({ is_breaking: true }, '-created_date', 10),
    initialData: [],
    refetchInterval: enabled ? 60000 : false
  });

  const toggleNotifications = () => {
    const newState = !enabled;
    setEnabled(newState);
    localStorage.setItem('breakingNotifications', newState);
    toast.success(newState ? 'התראות הופעלו' : 'התראות כובו');
  };

  useEffect(() => {
    if (enabled && breakingNews.length > 0) {
      const latestId = localStorage.getItem('lastBreakingId');
      const newest = breakingNews[0];
      if (latestId !== newest.id) {
        localStorage.setItem('lastBreakingId', newest.id);
        if (latestId) {
          toast.error(`🔥 חדשות חמות: ${newest.title}`);
        }
      }
    }
  }, [breakingNews, enabled]);

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-red-600 to-rose-600 rounded-2xl p-8 cursor-pointer shadow-2xl relative overflow-hidden"
        onClick={() => setIsOpen(true)}
      >
        {enabled && (
          <div className="absolute top-3 left-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </div>
          </div>
        )}
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">התראות חמות</h3>
            <p className="text-red-100">עדכונים בזמן אמת</p>
          </div>
        </div>
        <p className="text-white/90 text-sm">
          קבל התראות מיידיות על חדשות חמות ועדכונים דחופים
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
                  <Bell className="w-8 h-8 text-red-600" />
                  <h2 className="text-3xl font-bold dark:text-white">התראות חדשות חמות</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 dark:text-white" />
                </button>
              </div>

              <div className="mb-6">
                <Button
                  onClick={toggleNotifications}
                  className={`w-full ${enabled ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                >
                  {enabled ? (
                    <>
                      <BellOff className="w-5 h-5 ml-2" />
                      כבה התראות
                    </>
                  ) : (
                    <>
                      <Bell className="w-5 h-5 ml-2" />
                      הפעל התראות
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-bold dark:text-white">חדשות חמות אחרונות</h3>
                {breakingNews.length > 0 ? (
                  breakingNews.map(article => (
                    <Link
                      key={article.id}
                      to={createPageUrl(`Article?id=${article.id}`)}
                      className="block bg-red-50 dark:bg-red-900/20 rounded-xl p-4 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border-r-4 border-red-600"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h4 className="font-bold dark:text-white mb-2">{article.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {moment(article.created_date).fromNow()}
                          </p>
                        </div>
                        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                          🔥 חם
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    אין חדשות חמות כרגע
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}