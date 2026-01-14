import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Video, Phone, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";

export default function ReportersCarousel({ onReporterClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const { data: reporters = [] } = useQuery({
    queryKey: ['reporters-carousel'],
    queryFn: () => base44.entities.Reporter.filter({ is_active: true }),
    initialData: []
  });

  const { data: articles = [] } = useQuery({
    queryKey: ['breaking-articles'],
    queryFn: () => base44.entities.NewsArticle.filter({ is_breaking: true }, '-created_date', 20),
    initialData: []
  });

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (reporters.length === 0) return;
    
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % reporters.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [reporters.length]);

  const nextReporter = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % reporters.length);
  };

  const prevReporter = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + reporters.length) % reporters.length);
  };

  if (reporters.length === 0) return null;

  const currentReporter = reporters[currentIndex];
  
  // Find latest breaking article for this reporter's categories
  const reporterArticle = articles.find(article => 
    currentReporter.categories?.some(cat => article.category === cat)
  ) || articles[0];

  const slideVariants = {
    enter: {
      y: -100,
      opacity: 0
    },
    center: {
      y: 0,
      opacity: 1
    },
    exit: {
      y: 100,
      opacity: 0
    }
  };

  return (
    <div className="fixed top-1/2 -translate-y-1/2 left-0 w-auto max-w-xs z-20">
      <div className="flex flex-col">
        {/* Header Badge */}
        <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 px-3 py-1 flex items-center gap-2 justify-center">
          <Flame className="w-3 h-3 text-white animate-pulse" />
          <span className="text-white text-xs font-bold">כתבים בשטח</span>
        </div>

        {/* Reporter Card */}
        <div className="flex-1 overflow-hidden py-3">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: 0.5,
                ease: "easeInOut"
              }}
              className="flex flex-col items-center gap-2 px-3"
            >
              {/* Reporter Avatar */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-500 ring-2 ring-red-500/30">
                  <img
                    src={currentReporter.image}
                    alt={currentReporter.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center border-2 border-black">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                </div>
              </div>

              {/* Reporter Info */}
              <div className="text-center">
                <h3 className="text-white font-bold text-sm mb-0.5">
                  {currentReporter.name}
                </h3>
                <p className="text-gray-300 text-[10px] mb-2 line-clamp-1">
                  {currentReporter.specialty}
                </p>
                {reporterArticle && (
                  <p className="text-yellow-400 text-[10px] line-clamp-3 text-right">
                    🔥 {reporterArticle.title}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1.5 w-full mt-2">
                <button
                  onClick={() => onReporterClick(currentReporter)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg transition-all shadow-lg shadow-red-500/30 text-xs font-bold"
                >
                  <Video className="w-3 h-3" />
                  שיחת וידאו
                </button>
                <button
                  onClick={() => onReporterClick(currentReporter)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-xs font-bold"
                >
                  <MessageCircle className="w-3 h-3" />
                  צ'אט
                </button>
                <button
                  onClick={() => onReporterClick(currentReporter)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-xs font-bold"
                >
                  <Phone className="w-3 h-3" />
                  שיחה קולית
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation & Progress */}
        <div className="border-t border-white/10 p-2">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={prevReporter}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-3 h-3 text-white" />
            </button>
            
            <div className="flex gap-1">
              {reporters.slice(0, 5).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all ${
                    idx === currentIndex % 5
                      ? 'w-4 bg-red-500'
                      : 'w-1 bg-white/30'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextReporter}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-3 h-3 text-white" />
            </button>
          </div>
          
          <div className="text-center text-[9px] text-white/60">
            {currentIndex + 1} / {reporters.length}
          </div>
        </div>
      </div>
    </div>
  );
}