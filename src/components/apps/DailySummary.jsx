import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import moment from "moment";

export default function DailySummary() {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: articles = [] } = useQuery({
    queryKey: ['today-articles'],
    queryFn: async () => {
      const allArticles = await base44.entities.NewsArticle.list('-created_date', 50);
      const today = new Date();
      return allArticles.filter(a => {
        const articleDate = new Date(a.created_date);
        return articleDate.toDateString() === today.toDateString();
      });
    },
    initialData: []
  });

  const generateSummary = async () => {
    setIsGenerating(true);
    try {
      const articlesText = articles.slice(0, 20).map(a => 
        `${a.title} - ${a.subtitle || ''}`
      ).join('\n');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `צור סיכום קצר ומעניין של החדשות העיקריות של היום מהכותרות הבאות:

${articlesText}

הסיכום צריך להיות:
- קצר (3-4 פסקאות)
- מעניין וקליט
- מכסה את הנושאים החשובים ביותר
- בעברית תקינה

החזר רק את הסיכום בפורמט טקסט פשוט.`,
        add_context_from_internet: false
      });

      setSummary(result);
      toast.success("הסיכום נוצר בהצלחה!");
    } catch (error) {
      toast.error("שגיאה ביצירת הסיכום");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 cursor-pointer shadow-2xl"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">סיכום יומי</h3>
            <p className="text-indigo-100">כל החדשות במבט אחד</p>
          </div>
        </div>
        <p className="text-white/90 text-sm">
          סיכום חכם של כל החדשות החשובות של היום
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
                  <FileText className="w-8 h-8 text-indigo-600" />
                  <h2 className="text-3xl font-bold dark:text-white">סיכום היום</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 dark:text-white" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 dark:text-gray-400">
                    {moment().format('dddd, DD MMMM YYYY')}
                  </p>
                  <p className="text-indigo-600 font-bold">
                    {articles.length} כתבות היום
                  </p>
                </div>
              </div>

              {!summary && !isGenerating && (
                <div className="text-center space-y-6 py-8">
                  <Sparkles className="w-16 h-16 text-indigo-600 mx-auto" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    קבל סיכום מקיף של כל החדשות החשובות שהתרחשו היום
                  </p>
                  <Button
                    onClick={generateSummary}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg"
                  >
                    <Sparkles className="w-5 h-5 ml-2" />
                    צור סיכום יומי
                  </Button>
                </div>
              )}

              {isGenerating && (
                <div className="text-center space-y-4 py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400">מכין את הסיכום...</p>
                </div>
              )}

              {summary && !isGenerating && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {summary}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={generateSummary}
                    variant="outline"
                    className="w-full"
                  >
                    צור סיכום מחדש
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}