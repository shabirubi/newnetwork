import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, Share2, Bookmark, Eye, Clock } from "lucide-react";
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

const categoryColors = {
  breaking: "bg-red-600",
  security: "bg-orange-600",
  economy: "bg-green-600",
  politics: "bg-purple-600",
  technology: "bg-blue-600",
  sports: "bg-emerald-600",
  entertainment: "bg-pink-600",
  world: "bg-indigo-600",
  health: "bg-rose-600"
};

export default function TikTokNewsFeed({ articles }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const handleScroll = (e) => {
    const delta = e.deltaY;
    if (Math.abs(delta) > 50) {
      if (delta > 0 && currentIndex < articles.length - 1) {
        setDirection(1);
        setCurrentIndex(prev => prev + 1);
      } else if (delta < 0 && currentIndex > 0) {
        setDirection(-1);
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    touchEndY.current = e.changedTouches[0].clientY;
    const delta = touchStartY.current - touchEndY.current;
    
    if (Math.abs(delta) > 100) {
      if (delta > 0 && currentIndex < articles.length - 1) {
        setDirection(1);
        setCurrentIndex(prev => prev + 1);
      } else if (delta < 0 && currentIndex > 0) {
        setDirection(-1);
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' && currentIndex < articles.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    } else if (e.key === 'ArrowUp' && currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, articles.length]);

  if (!articles || articles.length === 0) return null;

  const currentArticle = articles[currentIndex];

  return (
    <div 
      ref={containerRef}
      onWheel={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 bg-black overflow-hidden"
      style={{ height: '100vh', touchAction: 'none' }}
    >
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ y: direction > 0 ? '100%' : '-100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: direction > 0 ? '-100%' : '100%', opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative w-full h-full">
            {/* Background Image/Gradient */}
            {currentArticle.image_url ? (
              <div className="absolute inset-0">
                <img 
                  src={currentArticle.image_url} 
                  alt={currentArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />
            )}

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end p-6 pb-24">
              {/* Category Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${categoryColors[currentArticle.category] || 'bg-gray-700'} text-white font-bold text-sm`}>
                  {categoryLabels[currentArticle.category] || currentArticle.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                {currentArticle.title}
              </h1>

              {/* Subtitle */}
              {currentArticle.subtitle && (
                <p className="text-xl text-gray-200 mb-4 line-clamp-2">
                  {currentArticle.subtitle}
                </p>
              )}

              {/* Content Preview */}
              {currentArticle.content && (
                <p className="text-base text-gray-300 mb-6 line-clamp-3">
                  {currentArticle.content}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-4 text-gray-400 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  {moment(currentArticle.created_date).fromNow()}
                </div>
                {currentArticle.source && (
                  <div className="flex items-center gap-2">
                    <span>•</span>
                    <span>{currentArticle.source}</span>
                  </div>
                )}
              </div>

              {/* Read More Button */}
              <Link 
                to={createPageUrl(`Article?id=${currentArticle.id}`)}
                className="inline-flex items-center justify-center px-8 py-4 bg-[#E31E24] hover:bg-[#B91C1C] text-white font-bold rounded-full transition-all transform hover:scale-105"
              >
                קרא עוד
              </Link>
            </div>

            {/* Navigation Indicators */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2">
              {articles.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  className={`w-1 h-8 rounded-full transition-all ${
                    idx === currentIndex 
                      ? 'bg-white h-12' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>

            {/* Scroll Hint */}
            {currentIndex < articles.length - 1 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 1, repeat: Infinity }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm flex flex-col items-center gap-2"
              >
                <span>גלול למטה</span>
                <ChevronUp className="rotate-180" size={20} />
              </motion.div>
            )}

            {/* Article Counter */}
            <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white font-bold text-sm">
              {currentIndex + 1} / {articles.length}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}