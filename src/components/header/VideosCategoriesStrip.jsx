import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Film, Clapperboard, Baby, Vote, Trophy, Heart, Globe, Cpu, Music, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

const categories = [
  { id: "all", label: "כל הסרטונים", icon: Film, color: "from-purple-500 to-pink-500" },
  { id: "entertainment", label: "דרמה ובידור", icon: Clapperboard, color: "from-red-500 to-orange-500" },
  { id: "kids", label: "ילדים", icon: Baby, color: "from-blue-500 to-cyan-500" },
  { id: "politics", label: "פוליטיקה", icon: Vote, color: "from-gray-600 to-gray-800" },
  { id: "sports", label: "ספורט", icon: Trophy, color: "from-green-500 to-emerald-500" },
  { id: "health", label: "בריאות", icon: Heart, color: "from-pink-500 to-rose-500" },
  { id: "world", label: "עולם", icon: Globe, color: "from-indigo-500 to-purple-500" },
  { id: "technology", label: "טכנולוגיה", icon: Cpu, color: "from-cyan-500 to-blue-500" },
  { id: "music", label: "מוזיקה", icon: Music, color: "from-yellow-500 to-orange-500" },
  { id: "breaking", label: "חמות", icon: Star, color: "from-red-600 to-pink-600" },
  { id: "security", label: "ביטחון", icon: Film, color: "from-gray-700 to-gray-900" },
  { id: "economy", label: "כלכלה", icon: Clapperboard, color: "from-emerald-600 to-green-700" },
  { id: "crime", label: "פלילים", icon: Film, color: "from-orange-600 to-red-700" },
  { id: "education", label: "חינוך", icon: Baby, color: "from-blue-600 to-indigo-700" },
  { id: "culture", label: "תרבות", icon: Star, color: "from-purple-600 to-pink-700" },
  { id: "environment", label: "סביבה", icon: Globe, color: "from-green-600 to-teal-700" },
  { id: "science", label: "מדע", icon: Cpu, color: "from-indigo-600 to-blue-700" },
  { id: "military", label: "צבא", icon: Film, color: "from-slate-700 to-gray-800" },
  { id: "law", label: "משפט", icon: Vote, color: "from-amber-600 to-yellow-700" },
  { id: "local", label: "מקומי", icon: Globe, color: "from-teal-500 to-cyan-600" }
];

export default function VideosCategoriesStrip() {
  const scrollRef = useRef(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative bg-black/40 backdrop-blur-sm border-b border-white/10 shadow-2xl z-[34] overflow-hidden group">
      {/* Cinema Running Lights Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-red-500/30 to-transparent"
          animate={{
            x: ['-100%', '200%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent"
          animate={{
            x: ['-100%', '200%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            delay: 1
          }}
        />
        <motion.div
          className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"
          animate={{
            x: ['-100%', '200%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            delay: 2
          }}
        />
      </div>
      
      {/* Film strip effect on top and bottom */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Left Arrow */}
      <button
        onClick={() => scroll('left')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-l from-black via-black to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={() => scroll('right')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-black via-black to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      {/* Categories Scroll - Manual Scrolling */}
      <div 
        ref={scrollRef}
        className="overflow-x-auto relative z-10 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-3 py-4 px-2">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={createPageUrl(`UserVideos?category=${cat.id}`)}
                onMouseEnter={() => setHoveredCategory(cat.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className="flex-shrink-0"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group/card"
                >
                  <div className="relative w-20 sm:w-24 group/item">
                    {/* Film frame border */}
                    <div className="absolute -inset-1 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg opacity-50" />
                    <div className={`relative w-full bg-gradient-to-br ${cat.color} p-[1px] rounded-lg shadow-xl hover:shadow-2xl transition-all`}>
                      <div className="w-full bg-black/90 backdrop-blur-xl rounded-lg flex flex-col items-center justify-center gap-1.5 p-3 relative overflow-hidden border border-white/5">
                        {/* Cinema light reflection */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover/card:opacity-30 transition-opacity duration-500`} />
                        
                        {/* Icon with cinema glow */}
                        <Icon className="w-10 h-10 text-white relative z-10 drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] group-hover/item:scale-110 transition-transform duration-300" />
                        
                        {/* Label */}
                        <p className="text-white font-bold text-[10px] sm:text-[11px] text-center leading-tight line-clamp-2 relative z-10 drop-shadow-lg">
                          {cat.label}
                        </p>
                        
                        {/* Hover shimmer effect */}
                        {hoveredCategory === cat.id && (
                          <motion.div
                            initial={{ x: '-100%', opacity: 0 }}
                            animate={{ x: '200%', opacity: [0, 1, 0] }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}