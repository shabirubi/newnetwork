import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Share2, Heart, Send, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Input } from "@/components/ui/input";

const categoryLabels = {
  all: "כל הסרטונים",
  entertainment: "דרמה ובידור",
  kids: "ילדים",
  politics: "פוליטיקה",
  sports: "ספורט",
  health: "בריאות",
  world: "עולם",
  technology: "טכנולוגיה",
  music: "מוזיקה",
  breaking: "חמות",
  security: "ביטחון",
  economy: "כלכלה",
  crime: "פלילים",
  education: "חינוך",
  culture: "תרבות",
  environment: "סביבה",
  science: "מדע",
  military: "צבא",
  law: "משפט",
  local: "מקומי"
};

const getCategoryLabel = (category) => categoryLabels[category] || category;

export default function UserVideos() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [likedVideos, setLikedVideos] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('likedUserVideos');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chat_username') || '';
    }
    return '';
  });
  const chatEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Get category from URL
  const urlParams = new URLSearchParams(window.location.search);
  const selectedCategory = urlParams.get('category') || 'all';

  const { data: allVideos = [], isLoading } = useQuery({
    queryKey: ['user-videos'],
    queryFn: async () => {
      const response = await base44.entities.UserVideo.list('-created_date', 500);
      return response || [];
    },
    staleTime: 60000,
    initialData: []
  });

  // Filter videos by category
  const videos = selectedCategory === 'all' 
    ? allVideos 
    : allVideos.filter(video => video.category === selectedCategory);

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
    refetchInterval: 3000, // Real-time updates every 3 seconds
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

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  return (
    <div className="min-h-screen bg-black overflow-x-hidden" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-black via-black/80 to-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link to={createPageUrl("Home")} className="flex items-center gap-2 hover:opacity-80 transition-opacity mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E31E24] to-[#B91C1C] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">הר</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {selectedCategory === 'all' ? 'כל הסרטונים' : getCategoryLabel(selectedCategory)}
            </h1>
          </Link>
          {selectedCategory !== 'all' && (
            <Link 
              to={createPageUrl("UserVideos?category=all")}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← חזרה לכל הסרטונים
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400">טוען ווידיאוהים...</div>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🎬</div>
            <h2 className="text-2xl font-bold text-white mb-2">אין ווידיאוהים עדיין</h2>
            <p className="text-gray-400 mb-6">עלו את הוידיאו הראשון שלכם וחלקו את הסיפור שלכם</p>
            <Link to={createPageUrl("Home")}>
              <button className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">
                חזרה לעמוד הבית
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                {/* Video Card */}
                <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-video shadow-lg hover:shadow-2xl transition-shadow">
                  {/* Thumbnail */}
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#E31E24]/20 to-[#B91C1C]/20 flex items-center justify-center">
                      <span className="text-4xl">🎥</span>
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#E31E24] rounded-full p-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="w-6 h-6 text-white fill-white" />
                    </motion.button>
                  </div>

                  {/* Duration Badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="mt-3 space-y-2">
                  <h3 className="text-white font-bold line-clamp-2 group-hover:text-[#E31E24] transition-colors">
                    {video.title || 'וידיאו ללא כותרת'}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {video.description || 'בלי תיאור'}
                  </p>
                  <div className="flex items-center gap-2 text-gray-500 text-xs pt-2">
                    <span>{video.views || 0} צפיות</span>
                    <span>•</span>
                    <span>{new Date(video.created_date).toLocaleDateString('he-IL')}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Giant Video Player with Chat Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm overflow-hidden"
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
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Side - Live Chat */}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}