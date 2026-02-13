import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Share2, Heart } from "lucide-react";
import moment from "moment";
import NewsReelsModal from "./NewsReelsModal";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function NewsReels() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedReel, setSelectedReel] = useState(null);

  // Fetch user uploaded videos only
  const { data: userVideos = [] } = useQuery({
    queryKey: ['news-reels-videos'],
    queryFn: async () => {
      try {
        const videos = await base44.entities.UserVideo.filter(
          { status: 'ready' },
          '-created_date',
          20
        );
        return videos;
      } catch {
        return [];
      }
    },
    initialData: []
  });

  const newsReels = userVideos.map((video, i) => ({
    id: video.id,
    videoUrl: video.video_url,
    title: video.title,
    category: 'חדשות',
    subtitle: `הרשת החדשה`,
    thumbnail: video.thumbnail_url,
    views: video.views || 0,
    timestamp: new Date(video.created_date),
    liked: false
  }));

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : newsReels.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < newsReels.length - 1 ? prev + 1 : 0));
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
                    className="relative rounded-xl overflow-hidden aspect-[9/16] group cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedReel(reel)}
                  >

                    {/* Thumbnail Background */}
                    {reel.thumbnail ? (
                      <img 
                        src={reel.thumbnail} 
                        alt={reel.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                        <img 
                          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png" 
                          alt="הרשת החדשה" 
                          className="w-24 h-24 opacity-50"
                        />
                      </div>
                    )}

                    {/* Video preview - hidden initially */}
                    <video
                      src={reel.videoUrl}
                      className="absolute inset-0 w-full h-full object-cover hidden group-hover:block"
                      playsInline
                      muted
                      onMouseEnter={(e) => e.target.play()}
                      onMouseLeave={(e) => e.target.pause()}
                    />

                    {/* Watermark */}
                    <div className="absolute bottom-2 right-2 opacity-20 pointer-events-none z-20">
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png" 
                        alt="הרשת החדשה" 
                        className="h-6 w-auto"
                      />
                    </div>

                    {/* Category Badge */}
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold text-white bg-[#E31E24] z-10`}>
                      {reel.category}
                    </div>

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

      {/* Reels Modal */}
      <NewsReelsModal 
      reel={selectedReel} 
      onClose={() => setSelectedReel(null)} 
      />
      </section>
  );
}