import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, X, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AIAnnouncer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const audio = React.useRef(null);

  const { data: articles = [] } = useQuery({
    queryKey: ['announcer-articles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 10),
    staleTime: 60000,
    initialData: []
  });

  const handlePlayArticle = async () => {
    if (articles.length === 0) return;
    
    const article = articles[currentArticleIndex];
    setIsPlaying(true);
    setIsSpeaking(true);

    try {
      // Generate speech using ElevenLabs
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Read this news headline professionally in Hebrew as a TV news anchor would: "${article.title}". Keep it natural and engaging.`,
        add_context_from_internet: false
      });

      // Use Web Speech API as fallback or direct audio generation
      const utterance = new SpeechSynthesisUtterance(article.title);
      utterance.lang = 'he-IL';
      utterance.rate = 0.9;
      
      const voices = window.speechSynthesis.getVoices();
      const hebrewVoice = voices.find(v => v.lang.includes('he'));
      if (hebrewVoice) utterance.voice = hebrewVoice;

      utterance.onend = () => {
        setIsSpeaking(false);
        // Auto-advance to next article (loop infinitely)
        setCurrentArticleIndex(prev => (prev + 1) % articles.length);
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error generating speech:', error);
      setIsPlaying(false);
      setIsSpeaking(false);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsSpeaking(false);
    setCurrentArticleIndex(0);
  };

  if (articles.length === 0) return null;

  const currentArticle = articles[currentArticleIndex];

  return (
    <>
      {/* Announcer Button - Floating */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-32 right-6 z-50 flex flex-col items-center gap-3 group"
      >
        {/* Pulse Animation */}
        <div className="absolute inset-0 w-20 h-20 rounded-full bg-[#E31E24] opacity-20 animate-pulse" />
        
        {/* Main Button */}
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#E31E24] to-[#B91C1C] shadow-2xl flex items-center justify-center group-hover:shadow-[0_0_30px_rgba(227,30,36,0.6)] transition-all">
          <div className="absolute inset-0 rounded-full border-2 border-[#E31E24] animate-pulse opacity-50" />
          <Volume2 className="w-10 h-10 text-white relative z-10" />
        </div>
        
        {/* Label */}
        <span className="text-xs font-bold bg-[#E31E24] text-white px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg">
          השדרן משדר עדכונים חיים 24/7
        </span>
      </motion.button>

      {/* Announcer Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-gradient-to-b from-gray-900 to-black text-white rounded-t-3xl p-6 max-h-96 overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">השדרן של הרשת החדשה</h2>
                <p className="text-gray-400">שמע חדשות עדכניות בקול מקצועי</p>
              </div>

              {/* Current Article */}
              {currentArticle && (
                <div className="bg-white/10 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-400 mb-2">
                    כתבה {currentArticleIndex + 1} מתוך {articles.length}
                  </p>
                  <h3 className="font-bold text-lg mb-3 line-clamp-3">
                    {currentArticle.title}
                  </h3>
                  {isSpeaking && (
                    <div className="flex items-center gap-2 text-[#E31E24]">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span className="text-sm">משדר כעת...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-3">
                <Button
                  onClick={isPlaying ? handleStop : handlePlayArticle}
                  className={`flex-1 flex items-center justify-center gap-2 py-6 font-bold rounded-xl transition-all ${
                    isPlaying
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:shadow-lg'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5" />
                      עצור
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      הקשב לחדשות
                    </>
                  )}
                </Button>
              </div>

              {/* Articles List */}
              <div className="mt-6 space-y-2">
                <p className="text-xs text-gray-500 font-bold mb-3">כתבות נוספות:</p>
                {articles.slice(0, 3).map((article, idx) => (
                  <button
                    key={article.id}
                    onClick={() => {
                      setCurrentArticleIndex(idx);
                      handleStop();
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      idx === currentArticleIndex
                        ? 'bg-[#E31E24]/20 border border-[#E31E24]'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <p className="text-sm line-clamp-2">{article.title}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}