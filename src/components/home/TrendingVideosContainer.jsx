import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight, Play, Eye, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NewsReelsModal from "../news/NewsReelsModal";

export default function TrendingVideosContainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedReel, setSelectedReel] = useState(null);
  const [reelsModalOpen, setReelsModalOpen] = useState(false);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['trending-videos'],
    queryFn: async () => {
      const allVideos = await base44.entities.UserVideo.list('-created_date', 20);
      return allVideos || [];
    }
  });

  const visibleVideos = 6;
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < videos.length - visibleVideos;

  const handlePrev = () => {
    if (canScrollLeft) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (canScrollRight) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleVideoClick = (video) => {
    setSelectedReel({
      id: video.id,
      url: video.video_url,
      title: video.title,
      description: video.description,
      category: video.category,
      thumbnail: video.thumbnail_url,
      views: video.views || 0,
      likes: video.likes || 0
    });
    setReelsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="bg-black/30 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">הפופולריים כרגע</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-gray-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-br from-black/90 via-gray-900/80 to-black/90 rounded-2xl p-3 sm:p-6 backdrop-blur-sm border border-white/10 shadow-2xl w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-3xl font-bold text-white mb-0.5 sm:mb-1">הפופולריים כרגע</h2>
            <p className="text-gray-400 text-xs sm:text-sm">הסרטונים הכי חמים ברשת</p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handlePrev}
              disabled={!canScrollLeft}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                canScrollLeft
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={!canScrollRight}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                canScrollRight
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 gap-2 sm:gap-4"
              >
              {videos.slice(currentIndex, currentIndex + visibleVideos).map((video, idx) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleVideoClick(video)}
                  className="group relative aspect-[9/16] rounded-lg sm:rounded-xl overflow-hidden cursor-pointer border border-transparent hover:border-[#E31E24] transition-all"
                >
                  {/* Number Badge */}
                  <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 z-10">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-md sm:rounded-lg bg-black/80 backdrop-blur-sm flex items-center justify-center border border-white/20 sm:border-2">
                      <span className="text-base sm:text-2xl font-black text-white">
                        {currentIndex + idx + 1}
                      </span>
                    </div>
                  </div>

                  {/* Video Thumbnail */}
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={video.video_url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-[#E31E24] flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform">
                      <Play className="w-8 h-8 text-white" fill="white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 transform translate-y-full group-hover:translate-y-0 transition-transform">
                    <h3 className="text-white font-bold text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-300">
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span>{video.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span>{video.likes || 0}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Dots */}
        {videos.length > visibleVideos && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {[...Array(Math.ceil((videos.length - visibleVideos + 1)))].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === i
                    ? 'w-8 bg-[#E31E24]'
                    : 'w-2 bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <NewsReelsModal
        isOpen={reelsModalOpen}
        onClose={() => setReelsModalOpen(false)}
        initialReel={selectedReel}
        allReels={videos.map(v => ({
          id: v.id,
          url: v.video_url,
          title: v.title,
          description: v.description,
          category: v.category,
          thumbnail: v.thumbnail_url,
          views: v.views || 0,
          likes: v.likes || 0
        }))}
      />
    </>
  );
}