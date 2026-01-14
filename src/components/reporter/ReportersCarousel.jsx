import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Video, Phone, ChevronLeft, ChevronRight } from "lucide-react";

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
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <div className="fixed top-2 left-0 right-0 sm:left-4 sm:right-4 z-30 px-2 sm:px-0">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="relative">
            {/* Background Image */}
            {reporterArticle?.image_url && (
              <div className="absolute inset-0 opacity-20">
                <img 
                  src={reporterArticle.image_url} 
                  alt=""
                  className="w-full h-full object-cover blur-sm"
                />
              </div>
            )}

            {/* Content */}
            <div className="relative p-4 sm:p-6">
              <div className="flex items-center gap-4">
                {/* Navigation Buttons */}
                <button
                  onClick={prevReporter}
                  className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>

                {/* Reporter Card */}
                <div className="flex-1 overflow-hidden">
                  <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                      key={currentIndex}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                      }}
                      className="flex items-center gap-4"
                    >
                      {/* Reporter Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-red-500 ring-2 ring-red-500/30">
                          <img
                            src={currentReporter.image}
                            alt={currentReporter.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center border-2 border-black">
                          <Flame className="w-3 h-3 text-white" />
                        </div>
                      </div>

                      {/* Reporter Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-bold text-lg sm:text-xl truncate">
                            {currentReporter.name}
                          </h3>
                          <span className="flex-shrink-0 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                            LIVE
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm sm:text-base mb-2 line-clamp-1">
                          {currentReporter.specialty}
                        </p>
                        {reporterArticle && (
                          <p className="text-yellow-400 text-xs sm:text-sm line-clamp-2 flex items-start gap-1">
                            <Flame className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{reporterArticle.title}</span>
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                        <button
                          onClick={() => onReporterClick(currentReporter)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl transition-all shadow-lg shadow-red-500/50 font-bold"
                        >
                          <Video className="w-4 h-4" />
                          <span className="hidden sm:inline">וידאו</span>
                        </button>
                        <button
                          onClick={() => onReporterClick(currentReporter)}
                          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-bold"
                        >
                          <Phone className="w-4 h-4" />
                          <span className="hidden sm:inline">שיחה</span>
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation Buttons */}
                <button
                  onClick={nextReporter}
                  className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center gap-1.5 mt-4">
                {reporters.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDirection(idx > currentIndex ? 1 : -1);
                      setCurrentIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentIndex
                        ? 'w-8 bg-red-500'
                        : 'w-1.5 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}