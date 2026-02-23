import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Film, Clapperboard, Baby, Vote, Trophy, Heart, Globe, Cpu, Music, Star, X, Send, MessageCircle, Share2, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

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
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chat_username') || '';
    }
    return '';
  });
  const [likedVideos, setLikedVideos] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('likedUserVideos');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [showChat, setShowChat] = useState(true);
  const chatEndRef = useRef(null);
  const queryClient = useQueryClient();

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

  // Fetch comments for selected video
  const { data: comments = [] } = useQuery({
    queryKey: ['video-comments', selectedVideo?.id],
    queryFn: async () => {
      if (!selectedVideo?.id) return [];
      const response = await base44.entities.VideoComment.filter(
        { video_id: selectedVideo.id },
        '-created_date',
        100
      );
      return response || [];
    },
    enabled: !!selectedVideo?.id,
    refetchInterval: 3000,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      return await base44.entities.VideoComment.create(messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['video-comments', selectedVideo?.id]);
      setMessage("");
    },
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedVideo) return;

    let finalUserName = userName.trim();
    if (!finalUserName) {
      finalUserName = 'אורח' + Math.floor(Math.random() * 1000);
      setUserName(finalUserName);
      localStorage.setItem('chat_username', finalUserName);
    }

    sendMessageMutation.mutate({
      video_id: selectedVideo.id,
      user_name: finalUserName,
      content: message.trim(),
      is_approved: true
    });
  };

  const toggleLike = (videoId) => {
    setLikedVideos(prev => {
      const newLiked = prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId];
      localStorage.setItem('likedUserVideos', JSON.stringify(newLiked));
      return newLiked;
    });
  };

  const shareVideo = (video) => {
    if (navigator.share) {
      navigator.share({
        title: video.title || 'וידיאו מהרשת החדשה',
        text: video.description || 'צפה בוידיאו זה',
        url: window.location.href
      }).catch(() => {});
    }
  };

  const handleVideoClick = async (categoryId) => {
    const videos = await base44.entities.UserVideo.filter({ category: categoryId }, '-created_date', 1);
    if (videos && videos[0]) {
      setSelectedVideo(videos[0]);
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  return (
    <div className="relative bg-black overflow-hidden z-[34] group" style={{ height: '80px' }}>
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
              <div
                key={cat.id}
                onMouseEnter={() => setHoveredCategory(cat.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => handleVideoClick(cat.id)}
                className="flex-shrink-0 cursor-pointer"
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
                    <div className="relative w-24 h-14 sm:w-28 sm:h-16">
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
                          <p className="text-white font-bold text-xs sm:text-sm text-center px-1 relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] group-hover/item:scale-105 transition-transform duration-300">
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
              </div>
            );
          })}
        </div>
      </div>

      {/* Giant Video Player with Chat Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm overflow-hidden"
            onClick={() => setSelectedVideo(null)}
          >
            <div className="h-full flex flex-col lg:flex-row p-4 lg:p-6 gap-4">
              {/* Close Button */}
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 left-4 lg:left-auto lg:right-4 z-20 text-white hover:text-[#E31E24] transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Left Side - Video Player */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex flex-col gap-4"
              >
                {/* Giant Video Player */}
                <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl flex-1 min-h-0">
                  <video
                    src={selectedVideo.video_url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Video Info */}
                <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-800">
                  <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">
                    {selectedVideo.title || 'וידיאו ללא כותרת'}
                  </h2>
                  <p className="text-gray-300 text-sm mb-4">
                    {selectedVideo.description || 'בלי תיאור'}
                  </p>

                  {/* Stats and Actions */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4 text-gray-400 text-sm">
                      <span>{selectedVideo.views || 0} צפיות</span>
                      <span>•</span>
                      <span>{new Date(selectedVideo.created_date).toLocaleDateString('he-IL')}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleLike(selectedVideo.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm ${
                          likedVideos.includes(selectedVideo.id)
                            ? 'bg-[#E31E24] text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${likedVideos.includes(selectedVideo.id) ? 'fill-current' : ''}`} />
                        אהבתי
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => shareVideo(selectedVideo)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all text-sm"
                      >
                        <Share2 className="w-4 h-4" />
                        שתף
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowChat(!showChat)}
                        className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all text-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {showChat ? 'הסתר צ\'אט' : 'הצג צ\'אט'}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Side - Live Chat */}
              {showChat && (
                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 100, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full lg:w-96 flex flex-col bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden"
                >
                  {/* Chat Header */}
                  <div className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] p-4 flex items-center gap-3">
                    <MessageCircle className="w-6 h-6 text-white" />
                    <div className="flex-1">
                      <h3 className="text-white font-bold">צ'אט חי</h3>
                      <p className="text-white/80 text-xs">{comments.length} הודעות</p>
                    </div>
                    <button
                      onClick={() => setShowChat(false)}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                    {comments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                        <p className="text-sm">אין הודעות עדיין</p>
                        <p className="text-xs">היו הראשונים להגיב!</p>
                      </div>
                    ) : (
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
                    )}
                  </div>

                  {/* Message Input */}
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
                        disabled={!message.trim() || sendMessageMutation.isPending}
                        className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </motion.button>
                    </form>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}