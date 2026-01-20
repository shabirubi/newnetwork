import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Heart, Share2, MessageCircle, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function ShortVideosContainer() {
  const [videos, setVideos] = useState([]);
  const [likedVideos, setLikedVideos] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Mock short videos data
  useEffect(() => {
    const mockVideos = [
      {
        id: 1,
        title: "חדשה דחופה מירושלים",
        thumbnail: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&h=500&fit=crop",
        duration: "0:45",
        views: 125400,
        likes: 8542,
        category: "breaking"
      },
      {
        id: 2,
        title: "כדורגל: מחזמר של ליגת העל",
        thumbnail: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&h=500&fit=crop",
        duration: "1:20",
        views: 245600,
        likes: 15800,
        category: "sports"
      },
      {
        id: 3,
        title: "טכנולוגיה: חכמויות חדשות",
        thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=500&fit=crop",
        duration: "1:05",
        views: 89300,
        likes: 6200,
        category: "technology"
      },
      {
        id: 4,
        title: "כלכלה: מחירי דולר בעלייה",
        thumbnail: "https://images.unsplash.com/photo-1611974586776-8dbb4a2b9b1f?w=300&h=500&fit=crop",
        duration: "0:55",
        views: 156700,
        likes: 9450,
        category: "economy"
      },
      {
        id: 5,
        title: "בידור: סלבריטים בחדשות",
        thumbnail: "https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=300&h=500&fit=crop",
        duration: "1:15",
        views: 324500,
        likes: 22100,
        category: "entertainment"
      },
      {
        id: 6,
        title: "בריאות: טיפים חדשים לכושר",
        thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=500&fit=crop",
        duration: "1:00",
        views: 201300,
        likes: 14200,
        category: "health"
      }
    ];
    setVideos(mockVideos);
  }, []);

  const toggleLike = (videoId) => {
    setLikedVideos(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };

  const categoryEmojis = {
    breaking: "🔴",
    sports: "⚽",
    technology: "💻",
    economy: "💰",
    entertainment: "🎬",
    health: "💪"
  };

  return (
    <section className="px-4 sm:px-4 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-yellow-500" />
        <h2 className="text-xl font-bold dark:text-white">סרטוני שורט חדשים</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {videos.map((video, idx) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelectedVideo(video)}
            className="group cursor-pointer relative rounded-xl overflow-hidden border-2 border-[#E31E24]/40 hover:border-[#E31E24]/80 transition-all h-80"
            style={{
              boxShadow: '0 0 20px rgba(227, 30, 36, 0.3), inset 0 0 20px rgba(227, 30, 36, 0.1)'
            }}
          >
            {/* Video Thumbnail */}
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/30 group-hover:bg-white/50 rounded-full p-3 transition-all">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
            </div>

            {/* Duration Badge */}
            <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded">
              {video.duration}
            </div>

            {/* Category Badge */}
            <div className="absolute top-2 left-2 bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
              {categoryEmojis[video.category]} {video.category}
            </div>

            {/* Content at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white text-sm font-bold line-clamp-2 mb-2">
                {video.title}
              </p>
              <div className="flex items-center justify-between text-[11px] text-white/70">
                <span>{(video.views / 1000).toFixed(0)}K צפיות</span>
                <div className="flex items-center gap-1">
                  <Heart className={`w-3 h-3 ${likedVideos[video.id] ? 'fill-red-500 text-red-500' : ''}`} />
                  {(video.likes / 1000).toFixed(0)}K
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedVideo(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-black rounded-2xl overflow-hidden"
          >
            {/* Video Player */}
            <div className="relative aspect-[9/16] bg-black flex items-center justify-center">
              <img
                src={selectedVideo.thumbnail}
                alt={selectedVideo.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="bg-white/30 hover:bg-white/50 rounded-full p-4 transition-all">
                  <Play className="w-8 h-8 text-white fill-white" />
                </button>
              </div>
            </div>

            {/* Video Info */}
            <div className="p-4 text-white">
              <h3 className="font-bold text-base mb-2">{selectedVideo.title}</h3>
              <div className="flex items-center justify-between text-sm text-gray-300 mb-4">
                <span>{(selectedVideo.views / 1000).toFixed(0)}K צפיות</span>
                <span>{selectedVideo.duration}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-around gap-2">
                <button
                  onClick={() => toggleLike(selectedVideo.id)}
                  className="flex flex-col items-center gap-1 flex-1 py-2 rounded-lg hover:bg-white/10 transition-all"
                >
                  <Heart
                    className={`w-5 h-5 ${likedVideos[selectedVideo.id] ? 'fill-red-500 text-red-500' : ''}`}
                  />
                  <span className="text-xs">{(selectedVideo.likes / 1000).toFixed(0)}K</span>
                </button>

                <button className="flex flex-col items-center gap-1 flex-1 py-2 rounded-lg hover:bg-white/10 transition-all">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-xs">תגובות</span>
                </button>

                <button className="flex flex-col items-center gap-1 flex-1 py-2 rounded-lg hover:bg-white/10 transition-all">
                  <Share2 className="w-5 h-5" />
                  <span className="text-xs">שיתוף</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedVideo(null)}
                className="w-full mt-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all font-medium"
              >
                סגור
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}