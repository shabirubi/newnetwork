import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Eye, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function VerticalNewsScroller({ category, title, icon: Icon }) {
  const scrollContainerRef = useRef(null);
  const [canScrollDown, setCanScrollDown] = React.useState(true);
  const [canScrollUp, setCanScrollUp] = React.useState(false);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['news-by-category', category],
    queryFn: async () => {
      try {
        const allArticles = await base44.entities.NewsArticle.list('-created_date', 100);
        return allArticles.filter(a => a.category === category);
      } catch (err) {
        console.error(`Error fetching articles for ${category}:`, err);
        return [];
      }
    },
    initialData: [],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollHeight, scrollTop, clientHeight } = scrollContainerRef.current;
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 10);
    setCanScrollUp(scrollTop > 10);
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [articles]);

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 400;
    scrollContainerRef.current.scrollBy({
      top: direction === 'down' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-black rounded-2xl p-4 min-h-[500px] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">טוען...</div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="bg-black rounded-2xl p-4 min-h-[500px] flex items-center justify-center">
        <div className="text-gray-500">אין חדשות זמינות</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden border border-gray-800">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-800 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-[#0080FF] to-[#0066FF] rounded-lg">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-base sm:text-lg text-white">{title}</h3>
          <p className="text-xs sm:text-sm text-gray-400">{articles.length} חדשות</p>
        </div>
      </div>

      {/* Vertical Scrollable Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="h-[600px] overflow-y-auto scrollbar-hide space-y-3 p-4"
        >
          {articles.map((article, idx) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link to={createPageUrl("Article") + `?id=${article.id}`}>
                <div className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden hover:border-[#0080FF]/50 transition-all cursor-pointer h-32 sm:h-40">
                  {/* Image Background */}
                  {article.image_url && (
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    </div>
                  )}

                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-sm sm:text-base text-white line-clamp-2 group-hover:text-[#0080FF] transition-colors">
                          {article.title}
                        </h4>
                      </div>
                      {article.is_breaking && (
                        <div className="flex-shrink-0 bg-[#E31E24] text-white text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                          חם
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-300">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>
                        {new Date(article.created_date).toLocaleTimeString('he-IL', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Scroll Buttons */}
        {canScrollUp && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => scroll('up')}
            className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 bg-black/80 hover:bg-black border border-[#0080FF]/50 text-[#0080FF] p-2 rounded-full transition-all"
          >
            ↑
          </motion.button>
        )}

        {canScrollDown && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => scroll('down')}
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10 bg-black/80 hover:bg-black border border-[#0080FF]/50 text-[#0080FF] p-2 rounded-full transition-all"
          >
            ↓
          </motion.button>
        )}
      </div>

      {/* Footer Link */}
      <Link to={createPageUrl(`Category?cat=${category}`)}>
        <div className="p-4 border-t border-gray-800 hover:bg-gray-900/50 transition-colors text-center cursor-pointer">
          <span className="text-gray-300 hover:text-[#0080FF] transition-colors font-bold text-sm">
            כל החדשות →
          </span>
        </div>
      </Link>
    </div>
  );
}