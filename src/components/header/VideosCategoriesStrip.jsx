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
    <div className="relative bg-black/60 backdrop-blur-md border-b-2 border-yellow-500/40 shadow-2xl shadow-yellow-500/20 z-[34] overflow-hidden group">
      {/* Intense Cinema Running Lights Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Red spotlight */}
        <motion.div
          className="absolute inset-0 h-full w-[400px] bg-gradient-to-r from-transparent via-red-600/70 to-transparent blur-xl"
          animate={{
            x: ['-400px', 'calc(100% + 400px)']
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            filter: 'drop-shadow(0 0 30px rgba(220, 38, 38, 0.8))'
          }}
        />
        
        {/* Gold/Yellow spotlight */}
        <motion.div
          className="absolute inset-0 h-full w-[400px] bg-gradient-to-r from-transparent via-yellow-400/70 to-transparent blur-xl"
          animate={{
            x: ['-400px', 'calc(100% + 400px)']
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
            delay: 0.8
          }}
          style={{
            filter: 'drop-shadow(0 0 30px rgba(250, 204, 21, 0.8))'
          }}
        />
        
        {/* Purple spotlight */}
        <motion.div
          className="absolute inset-0 h-full w-[400px] bg-gradient-to-r from-transparent via-purple-600/70 to-transparent blur-xl"
          animate={{
            x: ['-400px', 'calc(100% + 400px)']
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
            delay: 1.6
          }}
          style={{
            filter: 'drop-shadow(0 0 30px rgba(147, 51, 234, 0.8))'
          }}
        />
        
        {/* Cyan spotlight */}
        <motion.div
          className="absolute inset-0 h-full w-[400px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent blur-xl"
          animate={{
            x: ['-400px', 'calc(100% + 400px)']
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
            delay: 2.4
          }}
          style={{
            filter: 'drop-shadow(0 0 30px rgba(34, 211, 238, 0.8))'
          }}
        />
        
        {/* Pulsing ambient glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-yellow-600/20 to-purple-600/20"
          animate={{
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* Hollywood marquee lights border */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-500 opacity-60 animate-pulse" />
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-500 via-purple-500 to-yellow-500 opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }} />
      
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
                    {/* Film frame border with glow */}
                    <div className="absolute -inset-1 bg-gradient-to-br from-yellow-600 to-red-600 rounded-lg opacity-40 blur-sm group-hover/item:opacity-70 transition-opacity" />
                    <div className={`relative w-full bg-gradient-to-br ${cat.color} p-[2px] rounded-lg shadow-2xl hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] transition-all`}>
                      <div className="w-full bg-black/95 backdrop-blur-xl rounded-lg flex flex-col items-center justify-center gap-1.5 p-3 relative overflow-hidden border border-yellow-500/20">
                        {/* Intense cinema light reflection */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover/card:opacity-50 transition-opacity duration-500`} />
                        
                        {/* Rotating spotlight effect */}
                        <motion.div
                          className="absolute inset-0 opacity-20"
                          animate={{
                            background: [
                              'radial-gradient(circle at 0% 0%, rgba(239, 68, 68, 0.4) 0%, transparent 50%)',
                              'radial-gradient(circle at 100% 0%, rgba(250, 204, 21, 0.4) 0%, transparent 50%)',
                              'radial-gradient(circle at 100% 100%, rgba(147, 51, 234, 0.4) 0%, transparent 50%)',
                              'radial-gradient(circle at 0% 100%, rgba(34, 211, 238, 0.4) 0%, transparent 50%)',
                              'radial-gradient(circle at 0% 0%, rgba(239, 68, 68, 0.4) 0%, transparent 50%)'
                            ]
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                        
                        {/* Icon with intense cinema glow */}
                        <Icon className="w-10 h-10 text-white relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] group-hover/item:scale-125 group-hover/item:drop-shadow-[0_0_30px_rgba(250,204,21,1)] transition-all duration-300" />
                        
                        {/* Label with glow */}
                        <p className="text-white font-bold text-[10px] sm:text-[11px] text-center leading-tight line-clamp-2 relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] group-hover/item:text-yellow-300 transition-colors">
                          {cat.label}
                        </p>
                        
                        {/* Hover shimmer effect - stronger */}
                        {hoveredCategory === cat.id && (
                          <motion.div
                            initial={{ x: '-100%', opacity: 0 }}
                            animate={{ x: '200%', opacity: [0, 1, 0] }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/60 to-transparent"
                            style={{
                              filter: 'drop-shadow(0 0 20px rgba(250, 204, 21, 0.8))'
                            }}
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