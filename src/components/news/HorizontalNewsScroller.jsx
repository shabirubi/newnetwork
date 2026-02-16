import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight, Clock, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function HorizontalNewsScroller({ category, title, icon: Icon }) {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  React.useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e) => {
      e.preventDefault();
      scrollContainer.scrollLeft += e.deltaY;
      handleScroll();
    };

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    return () => scrollContainer.removeEventListener('wheel', handleWheel);
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['news-horizontal', category],
    queryFn: async () => {
      const filter = category === 'all' ? {} : { category };
      const news = await base44.entities.NewsArticle.filter(filter, '-created_date', 12);
      return news || [];
    }
  });

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      const newPosition = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-black/90 via-gray-900/80 to-black/90 rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-8 w-48 bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="min-w-[300px] h-64 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-black/90 via-gray-900/80 to-black/90 rounded-2xl p-6 border border-white/10 shadow-2xl relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E31E24] to-[#B91C1C] flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
          <h2 className="text-3xl font-bold text-white">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!showLeftArrow}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              showLeftArrow
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!showRightArrow}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              showRightArrow
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none'
        }}
      >
        {articles.map((article, idx) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="min-w-[300px] flex-shrink-0"
          >
            <Link
              to={`${createPageUrl("Article")}?id=${article.id}`}
              className="block group"
            >
              <div className="relative h-48 rounded-xl overflow-hidden mb-3">
                <img
                  src={article.image_url || 'https://via.placeholder.com/300x200'}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                
                {article.is_breaking && (
                  <div className="absolute top-3 right-3 bg-[#E31E24] text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    🔴 חדש
                  </div>
                )}

                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(article.created_date).toLocaleDateString('he-IL', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </div>
              </div>

              <h3 className="text-white font-bold text-lg line-clamp-2 group-hover:text-[#E31E24] transition-colors mb-2">
                {article.title}
              </h3>

              {article.subtitle && (
                <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                  {article.subtitle}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="bg-[#E31E24]/20 text-[#E31E24] px-2 py-1 rounded">
                  {article.category}
                </span>
                {article.views && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{article.views}</span>
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}