import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Play, Send, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "כל הסרטונים", icon: "🎬" },
  { id: "entertainment", label: "דרמה ובידור", icon: "🎭" },
  { id: "news", label: "חדשות", icon: "📰" },
  { id: "music", label: "מוזיקה", icon: "🎵" },
  { id: "educational", label: "חינוכי", icon: "📚" },
  { id: "comedy", label: "קומדיה", icon: "😂" },
  { id: "sports", label: "ספורט", icon: "⚽" },
  { id: "lifestyle", label: "לייף סטייל", icon: "✨" },
];

export default function VideosByCategory({ videos = [] }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chat_username') || '';
    }
    return '';
  });
  const [comments, setComments] = useState([]);
  const chatEndRef = React.useRef(null);

  // Assign categories randomly if not specified
  const categorizedVideos = videos.reduce((acc, video) => {
    const category = video.category || 'all';
    if (!acc[category]) acc[category] = [];
    acc[category].push(video);
    return acc;
  }, {});

  // Add to all category
  Object.values(categorizedVideos).forEach(videoList => {
    if (!categorizedVideos.all) categorizedVideos.all = [];
    categorizedVideos.all = [...new Set([...categorizedVideos.all, ...videoList])];
  });

  const currentVideos = categorizedVideos[selectedCategory] || [];
  const currentVideo = currentVideos[currentVideoIndex];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !currentVideo) return;

    let finalUserName = userName.trim();
    if (!finalUserName) {
      finalUserName = 'אורח' + Math.floor(Math.random() * 1000);
      setUserName(finalUserName);
      localStorage.setItem('chat_username', finalUserName);
    }

    setComments([...comments, {
      id: Date.now(),
      user_name: finalUserName,
      content: message.trim(),
      created_date: new Date().toISOString()
    }]);
    setMessage("");
  };

  React.useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  return (
    <div className="space-y-6">
      {/* Categories Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 px-2 lg:px-0">
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setCurrentVideoIndex(0);
              setComments([]);
            }}
            className={`flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="mr-2">{cat.icon}</span>
            {cat.label}
          </motion.button>
        ))}
      </div>

      {/* Video Grid - Desktop */}
      {currentVideos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>אין סרטונים בקטגוריה זו</p>
        </div>
      ) : (
        <div className="hidden lg:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentVideos.map((video, idx) => (
            <motion.div
              key={`${video.id}-${idx}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="group cursor-pointer"
              onClick={() => setCurrentVideoIndex(idx)}
            >
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all">
                <video
                  src={video.videoUrl}
                  className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Play className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
                <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1 rounded text-white text-xs font-bold">
                  #{idx + 1}
                </div>
              </div>
              <p className="text-white text-sm font-medium mt-2 truncate">{video.title}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* TikTok-Style Mobile Player */}
      <AnimatePresence>
        {currentVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black lg:hidden"
          >
            {/* Close Button */}
            <button
              onClick={() => setCurrentVideoIndex(-1)}
              className="fixed top-4 left-4 z-[10001] text-white bg-black/50 p-2 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Video Counter */}
            <div className="fixed top-4 right-4 z-[10001] text-white bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full text-sm font-bold">
              {currentVideoIndex + 1} / {currentVideos.length}
            </div>

            {/* TikTok Videos */}
            <div
              className="h-full w-full overflow-y-scroll snap-y snap-mandatory"
              style={{ scrollbarWidth: 'none' }}
            >
              {currentVideos.map((video, index) => (
                <div key={video.id} className="h-screen w-full snap-start flex">
                  {/* Video */}
                  <div className="flex-1 flex items-center justify-center bg-black">
                    <video
                      src={video.videoUrl}
                      autoPlay={index === currentVideoIndex}
                      loop
                      playsInline
                      className="h-full w-full object-contain"
                    />
                  </div>

                  {/* Chat Sidebar (Desktop) */}
                  <div className="hidden lg:flex w-96 flex-col bg-black/80 border-l border-gray-800">
                    {/* Video Info */}
                    <div className="p-4 border-b border-gray-800">
                      <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">
                        {video.title}
                      </h2>
                      <p className="text-gray-400 text-sm">
                        {new Date(video.timestamp).toLocaleDateString('he-IL')}
                      </p>
                    </div>

                    {/* Chat Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center gap-3">
                      <MessageCircle className="w-6 h-6 text-white" />
                      <div className="flex-1">
                        <h3 className="text-white font-bold">צ'אט חי</h3>
                        <p className="text-white/80 text-xs">{comments.length} הודעות</p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                          <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                          <p className="text-sm">אין הודעות עדיין</p>
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
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
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
                          disabled={!message.trim()}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                        >
                          <Send className="w-5 h-5" />
                        </motion.button>
                      </form>
                    </div>
                  </div>

                  {/* Mobile Bottom Info */}
                  <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pb-20">
                    <h3 className="text-white font-bold text-lg mb-2">
                      {video.title}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {new Date(video.timestamp).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Scroll Hint */}
            {currentVideos.length > 1 && (
              <div className="fixed bottom-20 left-1/2 -translate-x-1/2 text-white/60 text-sm animate-bounce pointer-events-none">
                גלול למעלה/למטה
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Full-Screen Player */}
      <AnimatePresence>
        {currentVideo && window.innerWidth >= 1024 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="hidden lg:block fixed inset-0 z-[9999] bg-black"
            onClick={() => setCurrentVideoIndex(-1)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentVideoIndex(-1);
              }}
              className="fixed top-4 left-4 z-[10001] text-white bg-black/50 p-2 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}