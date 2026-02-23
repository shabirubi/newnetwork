import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Film, Clapperboard, Baby, Vote, Trophy, Heart, Globe, Cpu, Music, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { base44 } from "@/api/base44Client";

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
  const [categoryVideos, setCategoryVideos] = useState({});

  // Fetch videos for categories
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videos = await base44.entities.UserVideo.list('-created_date', 100);
        const videosByCategory = {};
        
        categories.forEach(cat => {
          const categoryVideo = videos.find(v => v.category === cat.id);
          if (categoryVideo && categoryVideo.thumbnail_url) {
            videosByCategory[cat.id] = categoryVideo.thumbnail_url;
          }
        });
        
        setCategoryVideos(videosByCategory);
      } catch (err) {
        console.error('Failed to fetch category videos:', err);
      }
    };
    
    fetchVideos();
  }, []);

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
    <div className="relative bg-black overflow-hidden z-[34] group" style={{ height: '100px' }}>
      {/* Netflix-Style Background Video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-30"
          style={{ filter: 'brightness(0.4) contrast(1.2)' }}
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-cinema-projector-light-rays-in-the-dark-49031-large.mp4" type="video/mp4" />
        </video>
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
      </div>

      {/* Intense Cinema Running Lights Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Red spotlight */}
        <motion.div
          className="absolute inset-0 h-full w-[500px] bg-gradient-to-r from-transparent via-red-600/60 to-transparent blur-2xl"
          animate={{
            x: ['-500px', 'calc(100% + 500px)']
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            filter: 'drop-shadow(0 0 40px rgba(220, 38, 38, 0.9))'
          }}
        />
        
        {/* Gold/Yellow spotlight */}
        <motion.div
          className="absolute inset-0 h-full w-[500px] bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent blur-2xl"
          animate={{
            x: ['-500px', 'calc(100% + 500px)']
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
            delay: 0.8
          }}
          style={{
            filter: 'drop-shadow(0 0 40px rgba(250, 204, 21, 0.9))'
          }}
        />
        
        {/* Purple spotlight */}
        <motion.div
          className="absolute inset-0 h-full w-[500px] bg-gradient-to-r from-transparent via-purple-600/60 to-transparent blur-2xl"
          animate={{
            x: ['-500px', 'calc(100% + 500px)']
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
            delay: 1.6
          }}
          style={{
            filter: 'drop-shadow(0 0 40px rgba(147, 51, 234, 0.9))'
          }}
        />
        
        {/* Cyan spotlight */}
        <motion.div
          className="absolute inset-0 h-full w-[500px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent blur-2xl"
          animate={{
            x: ['-500px', 'calc(100% + 500px)']
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
            delay: 2.4
          }}
          style={{
            filter: 'drop-shadow(0 0 40px rgba(34, 211, 238, 0.9))'
          }}
        />
      </div>

      {/* Netflix-style top gradient fade */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/90 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
      
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

      {/* Categories Scroll - Centered like Reporters */}
      <div 
        ref={scrollRef}
        className="overflow-x-auto relative z-10 scroll-smooth h-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-3 py-4 px-4 h-full items-center justify-center min-w-full">
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
                  <motion.div 
                    className="relative flex-shrink-0 group/item"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {/* Video thumbnail card */}
                    <div className="relative w-32 h-20 sm:w-36 sm:h-20">
                      {/* Glow effect on hover */}
                      <div className={`absolute -inset-1 bg-gradient-to-br ${cat.color} rounded-lg opacity-0 group-hover/item:opacity-50 blur-lg transition-all duration-300`} />
                      
                      {/* Main card with video background */}
                      <div className="relative w-full h-full rounded-lg shadow-xl overflow-hidden border-2 border-white/10 group-hover/item:border-white/30 transition-all duration-300">
                        {/* Real video thumbnail or gradient fallback */}
                        {categoryVideos[cat.id] ? (
                          <img 
                            src={categoryVideos[cat.id]} 
                            alt={cat.label}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-80`} />
                        )}
                        
                        {/* Dark overlay */}
                        <div className="absolute inset-0 bg-black/50 group-hover/item:bg-black/30 transition-all duration-300" />
                        
                        {/* Animated gradient overlay */}
                        <motion.div
                          className="absolute inset-0 opacity-20 group-hover/item:opacity-30"
                          animate={{
                            background: [
                              'radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.3) 0%, transparent 60%)',
                              'radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.3) 0%, transparent 60%)',
                              'radial-gradient(circle at 100% 100%, rgba(255, 255, 255, 0.3) 0%, transparent 60%)',
                              'radial-gradient(circle at 0% 100%, rgba(255, 255, 255, 0.3) 0%, transparent 60%)',
                              'radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.3) 0%, transparent 60%)'
                            ]
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                        
                        {/* Category label overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-white font-bold text-sm sm:text-base text-center px-2 relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] group-hover/item:scale-110 transition-transform duration-300">
                            {cat.label}
                          </p>
                        </div>
                        
                        {/* Play icon hint */}
                        <div className="absolute top-2 left-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
                          <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Icon className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        
                        {/* Shimmer on hover */}
                        {hoveredCategory === cat.id && (
                          <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '200%' }}
                            transition={{ duration: 0.7, ease: "easeInOut" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                          />
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}