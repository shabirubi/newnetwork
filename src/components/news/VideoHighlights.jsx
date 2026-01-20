import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";

const youtubeVideos = [
  {
    id: 'youtube-k7WPygB6GlI',
    videoId: 'k7WPygB6GlI',
    title: "חדשות עכשיו - עדכון חם",
    url: "https://www.youtube.com/embed/k7WPygB6GlI?autoplay=1"
  },
  {
    id: 'youtube-4miQnYCTdS8',
    videoId: '4miQnYCTdS8',
    title: "ניתוח מעמיק - הרשת החדשה",
    url: "https://www.youtube.com/embed/4miQnYCTdS8?autoplay=1"
  },
  {
    id: 'youtube-2q9lcnXBicQ',
    videoId: '2q9lcnXBicQ',
    title: "דיווח מיוחד בלעדי",
    url: "https://www.youtube.com/embed/2q9lcnXBicQ?autoplay=1"
  },
  {
    id: 'youtube-vecTR4YAf-w',
    videoId: 'vecTR4YAf-w',
    title: "סיקור חי מהשטח",
    url: "https://www.youtube.com/embed/vecTR4YAf-w?autoplay=1"
  }
];

export default function VideoHighlights() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  return (
    <section className="bg-gradient-to-br from-black/80 via-[#E31E24]/20 to-black/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#E31E24]/40"
      style={{
        boxShadow: '0 0 40px rgba(227, 30, 36, 0.3), inset 0 0 30px rgba(227, 30, 36, 0.1)'
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#E31E24] flex items-center justify-center border-2 border-white/20">
          <Play className="w-6 h-6 text-white" fill="white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">וידאו מומלצים</h2>
          <p className="text-gray-300 text-sm">הכי נצפים היום</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {youtubeVideos.map((video, index) => (
          <motion.div
            key={video.id}
            onClick={() => setSelectedVideo(video)}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-xl cursor-pointer border-2 border-[#E31E24]/40 hover:border-[#E31E24]/80 transition-all"
            style={{
              boxShadow: '0 0 20px rgba(227, 30, 36, 0.2)'
            }}
          >
            <div className="relative aspect-video overflow-hidden bg-black">
              <img
                src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#E31E24] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform border-2 border-white/30">
                  <Play className="w-7 h-7 text-white ml-1" fill="white" />
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-white font-bold text-sm line-clamp-2 group-hover:text-[#E31E24] transition-colors">
                {video.title}
              </h3>
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
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border-2 border-[#E31E24]/60"
              style={{
                boxShadow: '0 0 60px rgba(227, 30, 36, 0.6)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-all border border-white/20"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <iframe
                src={selectedVideo.url}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}