import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, X, Play } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function TikTokNewsContainer() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Fetch user uploaded videos
  const { data: userVideos = [] } = useQuery({
    queryKey: ['userVideos'],
    queryFn: async () => {
      try {
        return await base44.entities.UserVideo.filter({ status: 'ready' }, '-created_date', 20);
      } catch {
        return [];
      }
    },
    initialData: []
  });

  // Only use user videos
  const tiktokVideos = userVideos.map(v => ({
    id: v.id,
    title: v.title,
    username: `@${v.uploader_email?.split('@')[0] || 'user'}`,
    url: v.video_url,
    thumbnail: v.thumbnail_url,
    type: 'user'
  }));

  return (
    <section className="px-4 sm:px-4 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Music className="w-6 h-6 text-[#0080FF]" />
          <h2 className="text-2xl font-bold dark:text-white">סרטוני חדשות בטיקטוק</h2>
        </div>
        <a
          href="https://www.tiktok.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0080FF] hover:text-[#0066FF] font-bold text-sm transition-colors"
        >
          עיין הכל →
        </a>
      </div>

      <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 snap-x snap-mandatory scrollbar-hide">
        {tiktokVideos.map((video, idx) => (
          <motion.div
            key={video.id}
            onClick={() => setSelectedVideo(video)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="group relative rounded-2xl overflow-hidden aspect-[9/16] bg-gradient-to-br from-black/80 via-[#0080FF]/30 to-black/80 backdrop-blur-sm cursor-pointer border-2 border-[#0080FF]/40 hover:border-[#0080FF]/80 transition-all flex-shrink-0 w-28 sm:w-auto snap-center"
            style={{
              boxShadow: '0 0 20px rgba(0, 128, 255, 0.3), inset 0 0 20px rgba(0, 128, 255, 0.1)'
            }}
          >
            {/* Video Preview */}
            {video.thumbnail ? (
              <div className="relative w-full h-full">
                <video
                  src={video.url}
                  className="w-full h-full object-cover pointer-events-none"
                  muted
                  playsInline
                  poster={video.thumbnail}
                ></video>
              </div>
            ) : (
              <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-16 h-16 text-white/40 mx-auto mb-2" />
                  <p className="text-white/60 text-sm">וידאו</p>
                </div>
              </div>
            )}
            {/* Watermark */}
            <div className="absolute bottom-2 right-2 opacity-20 pointer-events-none z-20">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png" 
                alt="הרשת החדשה" 
                className="h-6 w-auto"
              />
            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent group-hover:via-black/40 transition-all" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">
                {video.title}
              </h3>
              <p className="text-white/70 text-xs font-medium">{video.username}</p>
            </div>

            {/* Play Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#0080FF]/80 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform border-2 border-white/30">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
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
              className="relative w-full max-w-md aspect-[9/16] bg-black rounded-2xl overflow-hidden border-2 border-[#0080FF]/60"
              style={{
                boxShadow: '0 0 40px rgba(0, 128, 255, 0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-all border border-white/20"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              {selectedVideo.url ? (
                <video
                  src={selectedVideo.url}
                  className="w-full h-full bg-black"
                  controls
                  autoPlay
                  playsInline
                  style={{ objectFit: 'contain' }}
                ></video>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                  <p className="text-white/60">הוידאו לא זמין</p>
                </div>
              )}
              {/* Watermark */}
              <div className="absolute bottom-4 right-4 opacity-30 pointer-events-none">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png" 
                  alt="הרשת החדשה" 
                  className="h-12 w-auto drop-shadow-2xl"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}