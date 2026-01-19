import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Share2, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function UserVideos() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [likedVideos, setLikedVideos] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('likedUserVideos');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['user-videos'],
    queryFn: async () => {
      const response = await base44.entities.UserUploadedVideo.list('-created_date', 100);
      return response || [];
    },
    staleTime: 60000,
    initialData: []
  });

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

  return (
    <div className="min-h-screen bg-black overflow-x-hidden" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-black via-black/80 to-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E31E24] to-[#B91C1C] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">הר</span>
            </div>
            <h1 className="text-2xl font-bold text-white">עדכונים שלכם</h1>
          </Link>
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

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-12 right-0 text-white hover:text-[#E31E24] transition-colors z-10"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Video Player */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video shadow-2xl">
                <video
                  src={selectedVideo.video_url}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              </div>

              {/* Video Details */}
              <div className="mt-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedVideo.title || 'וידיאו ללא כותרת'}
                  </h2>
                  <p className="text-gray-300">
                    {selectedVideo.description || 'בלי תיאור'}
                  </p>
                </div>

                {/* Stats and Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-6 text-gray-400 text-sm">
                    <span>{selectedVideo.views || 0} צפיות</span>
                    <span>{new Date(selectedVideo.created_date).toLocaleDateString('he-IL')}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleLike(selectedVideo.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                        likedVideos.includes(selectedVideo.id)
                          ? 'bg-[#E31E24] text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${likedVideos.includes(selectedVideo.id) ? 'fill-current' : ''}`} />
                      אהבתי
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => shareVideo(selectedVideo)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all"
                    >
                      <Share2 className="w-5 h-5" />
                      שתף
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}