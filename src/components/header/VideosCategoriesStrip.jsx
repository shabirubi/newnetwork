import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Film, Clapperboard, Baby, Vote, Trophy, Heart, Globe, Cpu, Music, Star, X, Play, MessageCircle, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import VideoModalPortal from "./VideoModalPortal";

const categories = [
  { id: "all", label: "כל הסרטונים", icon: Film, color: "from-purple-500 to-pink-500", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=300&fit=crop" },
  { id: "entertainment", label: "דרמה ובידור", icon: Clapperboard, color: "from-red-500 to-orange-500", image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=300&fit=crop" },
  { id: "kids", label: "ילדים", icon: Baby, color: "from-blue-500 to-cyan-500", image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop" },
  { id: "politics", label: "פוליטיקה", icon: Vote, color: "from-gray-600 to-gray-800", image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=300&fit=crop" },
  { id: "sports", label: "ספורט", icon: Trophy, color: "from-green-500 to-emerald-500", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop" },
  { id: "health", label: "בריאות", icon: Heart, color: "from-pink-500 to-rose-500", image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=300&fit=crop" },
  { id: "world", label: "עולם", icon: Globe, color: "from-indigo-500 to-purple-500", image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400&h=300&fit=crop" },
  { id: "technology", label: "טכנולוגיה", icon: Cpu, color: "from-cyan-500 to-blue-500", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop" },
  { id: "music", label: "מוזיקה", icon: Music, color: "from-yellow-500 to-orange-500", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop" },
  { id: "breaking", label: "חמות", icon: Star, color: "from-red-600 to-pink-600", image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=300&fit=crop" },
  { id: "security", label: "ביטחון", icon: Film, color: "from-gray-700 to-gray-900", image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=300&fit=crop" },
  { id: "economy", label: "כלכלה", icon: Clapperboard, color: "from-emerald-600 to-green-700", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop" },
  { id: "crime", label: "פלילים", icon: Film, color: "from-orange-600 to-red-700", image: "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=400&h=300&fit=crop" },
  { id: "education", label: "חינוך", icon: Baby, color: "from-blue-600 to-indigo-700", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop" },
  { id: "culture", label: "תרבות", icon: Star, color: "from-purple-600 to-pink-700", image: "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=400&h=300&fit=crop" },
  { id: "environment", label: "סביבה", icon: Globe, color: "from-green-600 to-teal-700", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop" },
  { id: "science", label: "מדע", icon: Cpu, color: "from-indigo-600 to-blue-700", image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&h=300&fit=crop" },
  { id: "military", label: "צבא", icon: Film, color: "from-slate-700 to-gray-800", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop" },
  { id: "law", label: "משפט", icon: Vote, color: "from-amber-600 to-yellow-700", image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=300&fit=crop" },
  { id: "local", label: "מקומי", icon: Globe, color: "from-teal-500 to-cyan-600", image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop" }
];

export default function VideosCategoriesStrip() {
  const scrollRef = useRef(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chat_username') || '';
    }
    return '';
  });
  const chatEndRef = useRef(null);
  const queryClient = useQueryClient();
  const videoContainerRef = useRef(null);



  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Load videos from localStorage or database
  const { data: categoryVideos = [], status } = useQuery({
    queryKey: ['cached-videos', selectedCategory],
    queryFn: async () => {
      try {
        if (typeof window === 'undefined') return [];
        
        let videos = [];
        
        // Try localStorage first
        const savedVideos = localStorage.getItem('videoDownloadHistory');
        if (savedVideos) {
          try {
            const parsed = JSON.parse(savedVideos);
            if (Array.isArray(parsed) && parsed.length > 0) {
              videos = parsed.map(v => ({
                id: v.id || Math.random().toString(),
                title: v.title || 'סרטון ללא כותרת',
                video_url: v.videoUrl,
                thumbnail_url: v.thumbnail || v.videoUrl,
                created_date: v.timestamp,
                views: 0
              }));
              console.log('✅ טעינת סרטונים מ-localStorage:', videos.length, 'סרטונים');
              return videos;
            }
          } catch (e) {
            console.error('שגיאה בפרסום JSON:', e);
          }
        }
        
        // Fallback to database if no localStorage videos
        try {
          const dbVideos = await base44.entities.UserVideo.list('-created_date', 100);
          if (dbVideos && Array.isArray(dbVideos) && dbVideos.length > 0) {
            videos = dbVideos.map(v => ({
              id: v.id,
              title: v.title || 'סרטון ללא כותרת',
              video_url: v.video_url,
              thumbnail_url: v.thumbnail_url || v.video_url,
              created_date: v.created_date,
              views: v.views || 0
            }));
            console.log('✅ טעינת סרטונים מהמאגר:', videos.length, 'סרטונים');
            return videos;
          }
        } catch (error) {
          console.error('שגיאה בטעינה מהמאגר:', error);
        }
        
        console.warn('⚠️ אין סרטונים זמינים');
        return [];
      } catch (error) {
        console.error('Failed to load videos:', error);
        return [];
      }
    },
    enabled: !!selectedCategory,
    staleTime: 0,
    gcTime: 0,
  });

  React.useEffect(() => {
    console.log('🎬 CategoryVideos updated - count:', categoryVideos.length, 'status:', status);
  }, [categoryVideos, status]);

  const currentVideo = categoryVideos[currentVideoIndex];

  // Fetch comments for current video
  const { data: comments = [] } = useQuery({
    queryKey: ['video-comments', currentVideo?.id],
    queryFn: async () => {
      if (!currentVideo?.id) return [];
      return await base44.entities.VideoComment.filter({ video_id: currentVideo.id }, '-created_date', 100);
    },
    enabled: !!currentVideo?.id,
    refetchInterval: 3000,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      return await base44.entities.VideoComment.create(messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-comments', currentVideo?.id] });
      setMessage("");
    },
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !currentVideo) return;

    let finalUserName = userName.trim();
    if (!finalUserName) {
      finalUserName = 'אורח' + Math.floor(Math.random() * 1000);
      setUserName(finalUserName);
      localStorage.setItem('chat_username', finalUserName);
    }

    sendMessageMutation.mutate({
      video_id: currentVideo.id,
      user_name: finalUserName,
      content: message.trim(),
      is_approved: true
    });
  };

  // Handle scroll for TikTok-style navigation
  const handleScroll = (e) => {
    const container = videoContainerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const viewportHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / viewportHeight);

    if (newIndex !== currentVideoIndex && newIndex >= 0 && newIndex < categoryVideos.length) {
      setCurrentVideoIndex(newIndex);
    }
  };

  // Hide body scroll when modal is open
  React.useEffect(() => {
    if (selectedCategory) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [selectedCategory]);

  React.useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  return (
    <div className="relative bg-gradient-to-br from-black via-[#0080FF]/5 to-black overflow-hidden z-[34] border-b border-[#0080FF]/20" style={{ height: '80px' }}>
      {/* Gradient Overlays */}
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
      
      {/* Scroll Arrows */}
      <button
        onClick={() => scroll('left')}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 backdrop-blur-sm p-2 rounded-full hover:bg-black/80 transition-all shadow-lg border border-[#0080FF]/30"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 backdrop-blur-sm p-2 rounded-full hover:bg-black/80 transition-all shadow-lg border border-[#0080FF]/30"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>

      {/* Categories Scroll */}
      <div 
        ref={scrollRef}
        className="overflow-x-auto h-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-3 py-4 h-full items-center justify-center" style={{ minWidth: '100%', width: 'max-content', margin: '0 auto' }}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setTimeout(() => {
                    console.log('📂 נבחרה קטגוריה:', cat.label, '| סטטוס:', status, '| סרטונים:', categoryVideos.length);
                  }, 100);
                }}
                onMouseEnter={() => setHoveredCategory(cat.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 cursor-pointer relative"
              >
                <div className="relative w-20 h-12 rounded-xl overflow-hidden border border-[#0080FF]/30 hover:border-[#0080FF]/60 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,128,255,0.3)]">
                  {/* Background Image */}
                  <img 
                    src={cat.image} 
                    alt={cat.label}
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                    <Icon className="w-4 h-4 text-white mb-0.5 drop-shadow-lg" />
                    <p className="text-white font-bold text-[10px] text-center drop-shadow-lg leading-tight">
                      {cat.label}
                    </p>
                  </div>
                  
                  {/* Hover Glow */}
                  {hoveredCategory === cat.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-[#0080FF]/20 backdrop-blur-[2px]"
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <VideoModalPortal
        isOpen={!!selectedCategory}
        onClose={() => {
          setSelectedCategory(null);
          setCurrentVideoIndex(0);
        }}
        videos={categoryVideos}
        currentVideoIndex={currentVideoIndex}
        onScroll={handleScroll}
      />
    </div>
  );
}