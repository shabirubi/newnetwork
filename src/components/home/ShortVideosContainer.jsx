import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Zap, X } from "lucide-react";

export default function ShortVideosContainer() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const youtubeVideos = [
    { id: 'youtube-k7WPygB6GlI', videoId: 'k7WPygB6GlI', title: 'חדשה דחופה - הרשת החדשה', category: 'breaking' },
    { id: 'youtube-4miQnYCTdS8', videoId: '4miQnYCTdS8', title: 'עדכון חם - שידור חי', category: 'news' },
    { id: 'youtube-2q9lcnXBicQ', videoId: '2q9lcnXBicQ', title: 'ניתוח מעמיק', category: 'analysis' },
    { id: 'youtube-vecTR4YAf-w', videoId: 'vecTR4YAf-w', title: 'דיווח מיוחד בלעדי', category: 'special' },
    { id: 'youtube-OE6Oj8pW0BU', videoId: 'OE6Oj8pW0BU', title: 'סיקור חי מהשטח', category: 'live' },
    { id: 'youtube-t60lrCbStcY', videoId: 't60lrCbStcY', title: 'חדשות חמות עכשיו', category: 'breaking' }
  ];

  const categoryEmojis = {
    breaking: "🔴",
    news: "📰",
    analysis: "🎯",
    special: "⭐",
    live: "📡"
  };

  return (
    <section className="px-4 sm:px-4 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-yellow-500" />
        <h2 className="text-xl font-bold dark:text-white">סרטוני שורט חדשים</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {youtubeVideos.map((video, idx) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelectedVideo(video)}
            className="group cursor-pointer relative rounded-xl overflow-hidden border-2 border-[#E31E24]/40 hover:border-[#E31E24]/80 transition-all h-80 bg-black"
            style={{
              boxShadow: '0 0 20px rgba(227, 30, 36, 0.3), inset 0 0 20px rgba(227, 30, 36, 0.1)'
            }}
          >
            {/* Video Thumbnail */}
            <img
              src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-[#E31E24]/80 group-hover:bg-[#E31E24] rounded-full p-4 transition-all border-2 border-white/30">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
            </div>

            {/* Category Badge */}
            <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
              {categoryEmojis[video.category] || '📰'} {video.category}
            </div>

            {/* Content at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white text-sm font-bold line-clamp-2">
                {video.title}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVideo(null)}
            className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm bg-black rounded-2xl overflow-hidden border-2 border-[#E31E24]/60"
              style={{
                boxShadow: '0 0 40px rgba(227, 30, 36, 0.5)'
              }}
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-all border border-white/20"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Video Player */}
              <div className="relative aspect-[9/16] bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Video Info */}
              <div className="p-4 text-white bg-gradient-to-br from-black via-[#E31E24]/20 to-black">
                <h3 className="font-bold text-base">{selectedVideo.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}