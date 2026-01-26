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
  const backgroundMusic = React.useRef(null);
  const shouldContinuePlaying = React.useRef(false);

  // Listen for open radio event
  useEffect(() => {
    const handleOpenRadio = () => setIsOpen(true);
    window.addEventListener('openAIRadio', handleOpenRadio);
    return () => window.removeEventListener('openAIRadio', handleOpenRadio);
  }, []);

  const { data: articles = [] } = useQuery({
    queryKey: ['announcer-articles'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return [];
        return base44.entities.NewsArticle.list('-created_date', 10);
      } catch {
        return [];
      }
    },
    staleTime: 300000,
    refetchInterval: false,
    initialData: [],
    retry: 2
  });

  const playArticle = async (index) => {
    if (articles.length === 0 || !shouldContinuePlaying.current) return;
    
    const article = articles[index];
    setIsSpeaking(true);

    try {
      const textToSpeak = `דיווח עדכני מהרשת החדשה: ${article.title}${article.subtitle ? '. ' + article.subtitle : ''}`;
      
      // Get all available voices
      const voices = window.speechSynthesis.getVoices();
      
      // Try to find a young female Hebrew voice
      let selectedVoice = voices.find(voice => 
        voice.lang.includes('he') && voice.name.toLowerCase().includes('female')
      );
      
      // Fallback: any Hebrew voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.includes('he'));
      }
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'he-IL';
      utterance.rate = 1.05; // Slightly faster, youthful pace
      utterance.pitch = 1.2; // Higher pitch for younger female voice
      utterance.volume = 1;
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
        if (shouldContinuePlaying.current) {
          setTimeout(() => {
            setCurrentArticleIndex(prev => (prev + 1) % articles.length);
          }, 1000);
        }
      };

      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        setIsSpeaking(false);
        if (shouldContinuePlaying.current) {
          setTimeout(() => {
            setCurrentArticleIndex(prev => (prev + 1) % articles.length);
          }, 1000);
        }
      };

      window.speechSynthesis.cancel();
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
    } catch (error) {
      console.error('Error generating speech:', error);
      setIsSpeaking(false);
    }
  };

  const handlePlayArticle = async () => {
    if (articles.length === 0) return;
    
    // Load voices if not loaded yet
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        console.log('Voices loaded:', window.speechSynthesis.getVoices().length);
      });
    }
    
    shouldContinuePlaying.current = true;
    setIsPlaying(true);
    
    // Start background music
    if (!backgroundMusic.current) {
      backgroundMusic.current = new Audio('https://cdn.pixabay.com/download/audio/2022/03/10/audio_4f0137bf85.mp3');
      backgroundMusic.current.volume = 0.15;
      backgroundMusic.current.loop = true;
    }
    backgroundMusic.current.play().catch(() => {});
    
    setTimeout(() => {
      playArticle(currentArticleIndex);
    }, 300);
  };



  const handleStop = () => {
    shouldContinuePlaying.current = false;
    window.speechSynthesis.cancel();
    if (backgroundMusic.current) {
      backgroundMusic.current.pause();
    }
    setIsPlaying(false);
    setIsSpeaking(false);
    setCurrentArticleIndex(0);
  };

  React.useEffect(() => {
    if (shouldContinuePlaying.current && !isSpeaking && articles.length > 0) {
      const timer = setTimeout(() => {
        playArticle(currentArticleIndex);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentArticleIndex, isSpeaking]);

  const currentArticle = articles[currentArticleIndex];

  return (
    <>
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
              className="w-full bg-gradient-to-b from-[#1a1a1a] via-black to-black text-white rounded-t-3xl p-6 max-h-96 overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Radio Station Header */}
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-[#E31E24] animate-pulse" />
                  <h2 className="text-2xl font-bold">הרשת החדשה</h2>
                  <div className="w-3 h-3 rounded-full bg-[#E31E24] animate-pulse" />
                </div>
                <p className="text-sm text-gray-400">רדיו חדשות עם קריינית צעירה</p>
                <p className="text-xs text-[#E31E24] font-bold mt-2">שידור חי 24/7</p>
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