import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Youtube, X, ExternalLink, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function YouTubeChannelContainer() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const { data: videosData, isLoading } = useQuery({
    queryKey: ["youtube-channel-videos"],
    queryFn: async () => {
      const response = await base44.functions.invoke("fetchYouTubeChannelVideos", {
        searchQuery: "הרשת החדשה",
        maxResults: 12
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const videos = videosData?.videos || [];

  if (isLoading) {
    return (
      <div className="w-full py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Youtube className="w-8 h-8 text-red-500" />
            <h2 className="text-3xl font-bold text-white">ערוץ היוטיוב שלנו</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-700" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <>
      <div className="w-full py-8 bg-gradient-to-b from-black via-red-950/10 to-black">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Youtube className="w-8 h-8 text-red-500" />
              <div>
                <h2 className="text-3xl font-bold text-white">ערוץ היוטיוב שלנו</h2>
                <p className="text-gray-400 text-sm">הסרטונים האחרונים מהערוץ</p>
              </div>
            </div>
            <a
              href="https://www.youtube.com/results?search_query=%D7%94%D7%A8%D7%A9%D7%AA+%D7%94%D7%97%D7%93%D7%A9%D7%94"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
            >
              <span className="hidden sm:inline">צפו בערוץ</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedVideo(video)}
                className="group bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 border border-gray-800 hover:border-red-500/50"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white mr-1" fill="white" />
                    </div>
                  </div>
                  {/* Duration Badge */}
                  <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-white text-xs font-bold">
                    <Youtube className="w-3 h-3 inline mr-1" />
                    YouTube
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-white font-bold text-sm line-clamp-2 mb-2 group-hover:text-red-400 transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(video.publishedAt).toLocaleDateString('he-IL', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden border border-red-500/30 shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 left-4 z-10 p-2 bg-black/80 hover:bg-red-600 text-white rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Video Player */}
              <div className="aspect-video">
                <iframe
                  src={`${selectedVideo.embedUrl}?autoplay=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Video Info */}
              <div className="p-6 border-t border-gray-800">
                <h3 className="text-white font-bold text-xl mb-2">
                  {selectedVideo.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {selectedVideo.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedVideo.publishedAt).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                  <a
                    href={selectedVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors text-sm"
                  >
                    צפו ביוטיוב
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}