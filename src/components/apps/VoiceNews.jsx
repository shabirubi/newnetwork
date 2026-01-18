import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Play, Pause, SkipForward } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VoiceNews() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: articles = [] } = useQuery({
    queryKey: ['voice-articles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 10),
    initialData: []
  });

  const readArticle = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      utterance.onend = () => {
        setIsPlaying(false);
        if (currentIndex < articles.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
      };

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } else {
      toast.error('הדפדפן לא תומך בהקראה קולית');
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const article = articles[currentIndex];
      if (article) {
        const text = `${article.title}. ${article.subtitle || ''}`;
        readArticle(text);
      }
    }
  };

  const nextArticle = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    if (currentIndex < articles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl p-8 cursor-pointer shadow-2xl"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">חדשות קוליות</h3>
            <p className="text-pink-100">האזן לחדשות</p>
          </div>
        </div>
        <p className="text-white/90 text-sm">
          האזן לחדשות העיקריות בדרכים או בזמן פנוי
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
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Mic className="w-8 h-8 text-pink-600" />
                  <h2 className="text-3xl font-bold dark:text-white">נגן חדשות קולי</h2>
                </div>
                <button
                  onClick={() => {
                    window.speechSynthesis.cancel();
                    setIsPlaying(false);
                    setIsOpen(false);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 dark:text-white" />
                </button>
              </div>

              {articles.length > 0 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl p-6">
                    <div className="text-center mb-6">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        כתבה {currentIndex + 1} מתוך {articles.length}
                      </div>
                      <h3 className="text-2xl font-bold dark:text-white mb-3">
                        {articles[currentIndex]?.title}
                      </h3>
                      {articles[currentIndex]?.subtitle && (
                        <p className="text-gray-600 dark:text-gray-400">
                          {articles[currentIndex].subtitle}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={togglePlay}
                        size="lg"
                        className="bg-pink-600 hover:bg-pink-700 rounded-full w-16 h-16"
                      >
                        {isPlaying ? (
                          <Pause className="w-8 h-8" />
                        ) : (
                          <Play className="w-8 h-8" />
                        )}
                      </Button>
                      <Button
                        onClick={nextArticle}
                        size="lg"
                        variant="outline"
                        className="rounded-full"
                        disabled={currentIndex >= articles.length - 1}
                      >
                        <SkipForward className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {articles.map((article, index) => (
                      <button
                        key={article.id}
                        onClick={() => {
                          window.speechSynthesis.cancel();
                          setIsPlaying(false);
                          setCurrentIndex(index);
                        }}
                        className={`w-full text-right p-3 rounded-lg transition-colors ${
                          index === currentIndex
                            ? 'bg-pink-100 dark:bg-pink-900/30'
                            : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <p className="font-medium dark:text-white text-sm line-clamp-2">
                          {index + 1}. {article.title}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}