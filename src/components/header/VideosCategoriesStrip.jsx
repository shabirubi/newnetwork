import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Film, Clapperboard, Baby, Vote, Trophy, Heart, Globe, Cpu, Music, Star, X, Play, MessageCircle, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

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

  // Load videos from localStorage (cached from VideoCreator)
  const { data: categoryVideos = [] } = useQuery({
    queryKey: ['cached-videos', selectedCategory],
    queryFn: async () => {
      try {
        if (typeof window === 'undefined') return [];
        
        // Load from localStorage - faster and already available
        const savedVideos = localStorage.getItem('videoDownloadHistory');
        if (savedVideos) {
          const videos = JSON.parse(savedVideos);
          console.log('✅ טעינת סרטונים מ-localStorage:', videos.length, 'סרטונים');
          return videos.map(v => ({
            id: v.id,
            title: v.title || 'סרטון ללא כותרת',
            video_url: v.videoUrl,
            thumbnail_url: v.thumbnail || v.videoUrl,
            created_date: v.timestamp,
            views: 0
          })) || [];
        }
        return [];
      } catch (error) {
        console.error('Failed to load videos:', error);
        return [];
      }
    },
    enabled: !!selectedCategory,
    staleTime: 30000,
  });

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
                  console.log('📂 נבחרה קטגוריה:', cat.label, '| סך הכל סרטונים זמינים:', categoryVideos.length);
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

      {/* TikTok-Style Video Player Modal */}
      <AnimatePresence>
        {selectedCategory && categoryVideos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[50] bg-black overflow-hidden"
            style={{ position: 'fixed', inset: 0, width: '100%', height: '100%' }}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedCategory(null);
                setCurrentVideoIndex(0);
              }}
              className="fixed top-4 left-4 z-[10001] text-white hover:text-[#E31E24] transition-colors bg-black/50 p-2 rounded-full backdrop-blur-sm"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Video Counter - Enhanced */}
            <div className="fixed top-4 right-4 z-[10001] text-white bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 rounded-full backdrop-blur-sm shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">{currentVideoIndex + 1} / {categoryVideos.length}</div>
                <div className="text-xs opacity-90">כל הסרטונים מ-HeyGen 🎬</div>
              </div>
            </div>

            {/* TikTok-Style Scrollable Videos */}
            <div
              ref={videoContainerRef}
              onScroll={handleScroll}
              className="h-full w-full overflow-y-scroll snap-y snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categoryVideos.map((video, index) => (
                <div
                  key={video.id}
                  className="h-screen w-full snap-start snap-always flex relative"
                >
                  {/* Video Player */}
                  <div className="flex-1 flex items-center justify-center bg-black">
                    {Math.abs(index - currentVideoIndex) <= 1 && (
                      <video
                        src={video.video_url}
                        autoPlay={index === currentVideoIndex}
                        loop
                        playsInline
                        className="h-full w-full object-contain"
                      />
                    )}
                  </div>

                  {/* Right Side - Chat (Desktop) */}
                  <div className="hidden lg:flex w-96 flex-col bg-black/80 backdrop-blur-xl border-l border-gray-800">
                    {/* Video Info */}
                    <div className="p-4 border-b border-gray-800">
                      <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">
                        {video.title || 'ללא כותרת'}
                      </h2>
                      <p className="text-gray-400 text-sm">
                        {new Date(video.created_date).toLocaleDateString('he-IL')}
                      </p>
                    </div>

                    {/* Chat Header */}
                    <div className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] p-4 flex items-center gap-3">
                      <MessageCircle className="w-6 h-6 text-white" />
                      <div className="flex-1">
                        <h3 className="text-white font-bold">צ'אט חי</h3>
                        <p className="text-white/80 text-xs">{index === currentVideoIndex ? comments.length : 0} הודעות</p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {index === currentVideoIndex && comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                          <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                          <p className="text-sm">אין הודעות עדיין</p>
                        </div>
                      ) : index === currentVideoIndex ? (
                        <>
                          {comments.map((comment) => (
                            <motion.div
                              key={comment.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50"
                            >
                              <div className="flex items-start gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E31E24] to-[#B91C1C] flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs font-bold">
                                    {comment.user_name?.charAt(0)?.toUpperCase() || 'U'}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-white font-bold text-sm">
                                      {comment.user_name || 'אורח'}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                      {new Date(comment.created_date).toLocaleTimeString('he-IL', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-gray-300 text-sm break-words">
                                    {comment.content}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                          <div ref={chatEndRef} />
                        </>
                      ) : null}
                    </div>

                    {/* Message Input */}
                    {index === currentVideoIndex && (
                      <div className="p-4 border-t border-gray-800">
                        {!userName && (
                          <Input
                            type="text"
                            placeholder="הכניסו שם משתמש..."
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="mb-2 bg-gray-800 border-gray-700 text-white"
                          />
                        )}
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="כתבו הודעה..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="flex-1 bg-gray-800 border-gray-700 text-white"
                          />
                          <motion.button
                            type="submit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={!message.trim()}
                            className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] text-white px-4 py-2 rounded-lg disabled:opacity-50"
                          >
                            <Send className="w-5 h-5" />
                          </motion.button>
                        </form>
                      </div>
                    )}
                  </div>

                  {/* Mobile - Bottom Info Overlay */}
                  <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pb-20">
                    <h3 className="text-white font-bold text-lg mb-2">
                      {video.title || 'ללא כותרת'}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {new Date(video.created_date).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Scroll Hint */}
            {categoryVideos.length > 1 && (
              <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[10000] text-white/60 text-sm animate-bounce pointer-events-none">
                גלול למעלה/למטה
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}