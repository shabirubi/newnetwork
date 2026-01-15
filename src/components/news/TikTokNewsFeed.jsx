import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Clock, Share2, Bookmark, Eye, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import moment from "moment";

const categoryColors = {
  breaking: "bg-[#E31E24] text-white",
  security: "bg-orange-500 text-white",
  economy: "bg-green-600 text-white",
  politics: "bg-purple-600 text-white",
  technology: "bg-blue-600 text-white",
  sports: "bg-emerald-600 text-white",
  entertainment: "bg-pink-500 text-white",
  world: "bg-indigo-600 text-white",
  health: "bg-teal-600 text-white"
};

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

export default function TikTokNewsFeed({ articles: propArticles }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedCount, setLoadedCount] = useState(50);
  const containerRef = useRef(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const { data: fetchedArticles = [] } = useQuery({
    queryKey: ['tiktok-feed', loadedCount],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', loadedCount),
    staleTime: 60000,
    initialData: [],
    enabled: !propArticles || propArticles.length === 0
  });

  const articles = propArticles && propArticles.length > 0 ? propArticles : fetchedArticles;

  // Load more on scroll/swipe
  useEffect(() => {
    if (currentIndex >= loadedCount - 5) {
      setLoadedCount(prev => prev + 10);
    }
  }, [currentIndex, loadedCount]);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe up
      if (currentIndex < articles.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }

    if (touchStart - touchEnd < -50) {
      // Swipe down
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  const handleWheel = (e) => {
    if (e.deltaY > 0 && currentIndex < articles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (articles.length === 0) {
    return null;
  }

  return (
    <section 
      ref={containerRef}
      className="relative h-screen overflow-hidden bg-black"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* News Cards */}
      <AnimatePresence mode="wait">
        {articles.slice(currentIndex, currentIndex + 1).map((article, idx) => (
          <motion.div
            key={article.id}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative w-full h-full max-w-lg mx-auto">
              {/* Background Image */}
              {article.image_url && (
                <div className="absolute inset-0">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                </div>
              )}

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-6 pb-24">
                {/* Category Badge */}
                <div className="mb-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${categoryColors[article.category]}`}>
                    {article.is_breaking && <TrendingUp className="w-3.5 h-3.5" />}
                    {categoryLabels[article.category]}
                  </span>
                </div>

                {/* Title */}
                <Link to={createPageUrl(`Article?id=${article.id}`)}>
                  <h2 className="text-white text-2xl md:text-3xl font-bold mb-3 leading-tight">
                    {article.title}
                  </h2>
                </Link>

                {/* Subtitle */}
                {article.subtitle && (
                  <p className="text-white/90 text-base mb-4 line-clamp-2">
                    {article.subtitle}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {moment(article.created_date).fromNow()}
                  </span>
                  {article.source && (
                    <span>מקור: {article.source}</span>
                  )}
                </div>
              </div>

              {/* Side Actions */}
              <div className="absolute left-4 bottom-32 flex flex-col gap-6">
                <button className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs">שיתוף</span>
                </button>

                <button className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <span className="text-xs">שמירה</span>
                </button>

                <Link 
                  to={createPageUrl(`Article?id=${article.id}`)}
                  className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Eye className="w-6 h-6" />
                  </div>
                  <span className="text-xs">קרא עוד</span>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Navigation Indicators */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
        <div className="bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
          {currentIndex + 1} / {articles.length}
        </div>
        {currentIndex > 0 && (
          <button
            onClick={() => setCurrentIndex(prev => prev - 1)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Scroll Hint */}
      {currentIndex === 0 && (
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: [1, 0.5, 1], y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm flex flex-col items-center gap-2"
        >
          <span>גלול למעלה לעוד חדשות</span>
          <ChevronUp className="w-5 h-5" />
        </motion.div>
      )}
    </section>
  );
}