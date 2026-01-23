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
    queryFn: () => base44.entities.UserVideo.filter({ status: 'ready' }, '-created_date', 20),
    initialData: []
  });

  const youtubeVideos = [
    {
      id: 'youtube-pPRKdCHHlGI',
      title: "שידור חי עכשיו",
      username: "@hareshet_live",
      url: "https://www.youtube.com/embed/pPRKdCHHlGI?autoplay=0&mute=1",
      type: 'youtube'
    },
    {
      id: 'youtube-OeEDtjuqinU',
      title: "חדשות הערב - עדכון",
      username: "@hareshet_evening",
      url: "https://www.youtube.com/embed/OeEDtjuqinU?autoplay=0&mute=1",
      type: 'youtube'
    },
    {
      id: 'youtube-EGxPXB-Kwuo',
      title: "עדכון חדשות יומי",
      username: "@hareshet_daily",
      url: "https://www.youtube.com/embed/EGxPXB-Kwuo?autoplay=0&mute=1",
      type: 'youtube'
    },
    {
      id: 'youtube-k7WPygB6GlI',
      title: "חדשות עכשיו - ביטחון",
      username: "@hareshet_live",
      url: "https://www.youtube.com/embed/k7WPygB6GlI?autoplay=0&mute=1",
      type: 'youtube'
    },
    {
      id: 'youtube-4miQnYCTdS8',
      title: "כלכלה - אפדייט חם",
      username: "@hareshet_economy",
      url: "https://www.youtube.com/embed/4miQnYCTdS8?autoplay=0&mute=1",
      type: 'youtube'
    }
  ];

  // Combine user videos with YouTube videos
  const tiktokVideos = [
    ...userVideos.map(v => ({
      id: v.id,
      title: v.title,
      username: `@${v.uploader_email?.split('@')[0] || 'user'}`,
      url: v.video_url,
      thumbnail: v.thumbnail_url,
      type: 'user'
    })),
    ...youtubeVideos
  ];

  return (
    <section className="px-4 sm:px-4 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Music className="w-6 h-6 text-[#E31E24]" />
          <h2 className="text-2xl font-bold dark:text-white">סרטוני חדשות בטיקטוק</h2>
        </div>
        <a
          href="https://www.tiktok.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#E31E24] hover:text-red-700 font-bold text-sm transition-colors"
        >
          עיין הכל →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiktokVideos.map((video, idx) => (
          <motion.div
            key={video.id}
            onClick={() => setSelectedVideo(video)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="group relative rounded-2xl overflow-hidden aspect-[9/16] bg-gradient-to-br from-black/80 via-[#E31E24]/30 to-black/80 backdrop-blur-sm cursor-pointer border-2 border-[#E31E24]/40 hover:border-[#E31E24]/80 transition-all"
            style={{
              boxShadow: '0 0 20px rgba(227, 30, 36, 0.3), inset 0 0 20px rgba(227, 30, 36, 0.1)'
            }}
          >
            {/* Video Preview */}
            {video.type === 'youtube' ? (
              <iframe
                src={`https://www.youtube.com/embed/${video.id.replace('youtube-', '')}?controls=0&mute=1`}
                className="w-full h-full object-cover pointer-events-none"
                frameBorder="0"
              />
            ) : video.thumbnail ? (
              <img 
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <Music className="w-16 h-16 text-gray-600" />
              </div>
            )}

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
              <div className="w-16 h-16 rounded-full bg-[#E31E24]/80 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform border-2 border-white/30">
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
              className="relative w-full max-w-md aspect-[9/16] bg-black rounded-2xl overflow-hidden border-2 border-[#E31E24]/60"
              style={{
                boxShadow: '0 0 40px rgba(227, 30, 36, 0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-all border border-white/20"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              {selectedVideo.type === 'youtube' ? (
                <iframe
                  src={selectedVideo.url}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={selectedVideo.url}
                  className="w-full h-full bg-black"
                  controls
                  playsInline
                  style={{ objectFit: 'contain' }}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}