import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Share2, Heart } from "lucide-react";
import moment from "moment";
import NewsReelsModal from "./NewsReelsModal";

export default function NewsReels() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedReel, setSelectedReel] = useState(null);

  // סרטוני יוטיוב שלנו
  const youtubeVideos = [
    { id: 'youtube-pPRKdCHHlGI', videoId: 'pPRKdCHHlGI', title: 'שידור חי עכשיו', category: 'breaking' },
    { id: 'youtube-OeEDtjuqinU', videoId: 'OeEDtjuqinU', title: 'חדשות הערב', category: 'breaking' },
    { id: 'youtube-EGxPXB-Kwuo', videoId: 'EGxPXB-Kwuo', title: 'עדכון חדשות יומי', category: 'breaking' },
    { id: 'youtube-k7WPygB6GlI', videoId: 'k7WPygB6GlI', title: 'חדשות עכשיו', category: 'breaking' },
    { id: 'youtube-4miQnYCTdS8', videoId: '4miQnYCTdS8', title: 'עדכון חם', category: 'security' },
    { id: 'youtube-2q9lcnXBicQ', videoId: '2q9lcnXBicQ', title: 'ניתוח מעמיק', category: 'economy' },
    { id: 'youtube-vecTR4YAf-w', videoId: 'vecTR4YAf-w', title: 'דיווח מיוחד', category: 'politics' }
  ];

  const newsReels = youtubeVideos.map((video, i) => ({
    ...video,
    subtitle: `הרשת החדשה - שידור חי`,
    thumbnail: `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`,
    videoUrl: `https://www.youtube.com/embed/${video.videoId}?autoplay=0&mute=1`,
    views: Math.floor(Math.random() * 100000) + 1000,
    timestamp: moment().subtract(i, 'hours').toDate(),
    liked: false
  }));

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : youtubeVideos.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < youtubeVideos.length - 1 ? prev + 1 : 0));
  };

  const categoryColors = {
    breaking: 'bg-red-600',
    security: 'bg-orange-600',
    economy: 'bg-green-600',
    politics: 'bg-purple-600',
    technology: 'bg-blue-600'
  };

  return (
    <section className="px-4 sm:px-4 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold dark:text-white">סרטוני חדשות</h2>
      </div>

      <div className="relative bg-black rounded-2xl overflow-hidden">
        <div className="flex items-center">
          {/* Left Arrow */}
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all"
          >
            <span className="text-white text-2xl">‹</span>
          </button>

          {/* Reels Container */}
          <div className="w-full overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 p-6"
              >
                {newsReels.slice(currentIndex, Math.min(currentIndex + 5, newsReels.length)).map((reel) => (
                  <motion.div
                    key={reel.id}
                    className="relative rounded-xl overflow-hidden aspect-[9/16] group"
                    whileHover={{ scale: 1.02 }}
                  >

                    {/* Category Badge */}
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold text-white ${categoryColors[reel.category]} z-10`}>
                      {reel.category}
                    </div>

                    {/* YouTube iframe embed */}
                    <iframe
                      src={`https://www.youtube.com/embed/${reel.videoId}`}
                      title={reel.title}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />

                    {/* Content overlay - only title */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent z-10">
                      <h3 className="text-white font-bold text-sm line-clamp-2">
                        {reel.title}
                      </h3>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all"
          >
            <span className="text-white text-2xl">›</span>
          </button>
        </div>

        {/* Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
          <span className="text-white text-sm font-bold">
            {currentIndex + 1} - {Math.min(currentIndex + 5, newsReels.length)} מתוך {newsReels.length}
          </span>
        </div>
      </div>


    </section>
  );
}