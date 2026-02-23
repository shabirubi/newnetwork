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
  { id: "breaking", label: "חמות", icon: Star, color: "from-red-600 to-pink-600" }
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
    <div className="relative bg-gradient-to-r from-black via-gray-900 to-black border-b border-gray-800 py-3 overflow-hidden group">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 animate-pulse pointer-events-none" />
      
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

      {/* Categories Scroll */}
      <div
        ref={scrollRef}
        className="flex gap-4 px-4 overflow-x-auto scrollbar-hide scroll-smooth relative z-[1]"
        style={{ scrollbarWidth: 'none' }}
      >
        {categories.map((cat) => {
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
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group/card"
              >
                <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${cat.color} p-[2px] shadow-lg hover:shadow-2xl transition-all`}>
                  <div className="w-full h-full bg-black/80 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                    {/* Animated background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover/card:opacity-20 transition-opacity`} />
                    
                    {/* Icon */}
                    <Icon className="w-12 h-12 text-white relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                    
                    {/* Label */}
                    <p className="text-white font-bold text-sm text-center px-2 relative z-10">
                      {cat.label}
                    </p>

                    {/* Shine effect on hover */}
                    {hoveredCategory === cat.id && (
                      <motion.div
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={{ x: '200%', opacity: [0, 1, 0] }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}