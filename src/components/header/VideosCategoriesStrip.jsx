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
    <div className="relative bg-gradient-to-r from-black/80 via-black/70 to-black/80 backdrop-blur-xl border-b border-purple-500/30 shadow-lg shadow-purple-500/20 z-[34] overflow-hidden group">
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

      {/* Categories Scroll - Auto Animated */}
      <div className="overflow-hidden relative z-[1]">
        <motion.div
          className="flex gap-2 py-3"
          animate={{
            x: ["0%", "-50%"]
          }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {[...categories, ...categories, ...categories, ...categories].map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <Link
              key={`${cat.id}-${idx}`}
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
                <div className={`w-16 sm:w-20 bg-gradient-to-br ${cat.color} p-[2px] rounded-lg shadow-lg hover:shadow-2xl transition-all`}>
                  <div className="w-full bg-black/80 backdrop-blur-xl rounded-lg flex flex-col items-center justify-center gap-1 p-2 relative overflow-hidden">
                    {/* Animated background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover/card:opacity-20 transition-opacity`} />
                    
                    {/* Icon */}
                    <Icon className="w-8 h-8 text-white relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                    
                    {/* Label */}
                    <p className="text-white font-bold text-[9px] sm:text-[10px] text-center leading-tight line-clamp-2 relative z-10">
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
        </motion.div>
      </div>
    </div>
  );
}