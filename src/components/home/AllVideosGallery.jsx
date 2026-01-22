import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Eye, Clock, X, Film, Youtube, Loader } from "lucide-react";
import moment from "moment";

const VideoSkeleton = () => (
  <div className="group cursor-pointer bg-gradient-to-br from-black/80 via-[#E31E24]/20 to-black/80 backdrop-blur-sm rounded-xl overflow-hidden border-2 border-[#E31E24]/40" style={{ boxShadow: '0 0 20px rgba(227, 30, 36, 0.3)' }}>
    <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-800 rounded animate-pulse"></div>
      <div className="h-3 bg-gray-800 rounded w-2/3 animate-pulse"></div>
      <div className="flex justify-between">
        <div className="h-3 bg-gray-800 rounded w-1/3 animate-pulse"></div>
        <div className="h-3 bg-gray-800 rounded w-1/4 animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default function AllVideosGallery() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  const { data: userVideos = [], isLoading } = useQuery({
    queryKey: ['all-user-videos'],
    queryFn: () => base44.entities.UserVideo.filter({ status: 'ready' }, '-created_date', 200),
    initialData: [],
    refetchInterval: 60000
  });

  // YouTube videos from the channel
  const youtubeVideos = [
    { id: 'yt-EGxPXB-Kwuo', title: 'עדכון חדשות יומי - הרשת החדשה', url: 'https://www.youtube.com/embed/EGxPXB-Kwuo', thumbnail: 'https://img.youtube.com/vi/EGxPXB-Kwuo/maxresdefault.jpg', type: 'youtube', created_date: new Date('2024-01-21') },
    { id: 'yt-yqfErzEHR0g', title: 'כתבים מהשטח - דיווח בזמן אמת', url: 'https://www.youtube.com/embed/yqfErzEHR0g', thumbnail: 'https://img.youtube.com/vi/yqfErzEHR0g/maxresdefault.jpg', type: 'youtube', created_date: new Date('2024-01-20') },
    { id: 'yt-k7WPygB6GlI', title: 'סרטון ממוחשב - הרשת החדשה', url: 'https://www.youtube.com/embed/k7WPygB6GlI', thumbnail: 'https://img.youtube.com/vi/k7WPygB6GlI/maxresdefault.jpg', type: 'youtube', created_date: new Date('2024-01-15') },
    { id: 'yt-4miQnYCTdS8', title: 'הרשת החדשה - שידור חי', url: 'https://www.youtube.com/embed/4miQnYCTdS8', thumbnail: 'https://img.youtube.com/vi/4miQnYCTdS8/maxresdefault.jpg', type: 'youtube', created_date: new Date('2024-01-14') },
    { id: 'yt-2q9lcnXBicQ', title: 'תוכן מיוחד הרשת', url: 'https://www.youtube.com/embed/2q9lcnXBicQ', thumbnail: 'https://img.youtube.com/vi/2q9lcnXBicQ/maxresdefault.jpg', type: 'youtube', created_date: new Date('2024-01-13') },
    { id: 'yt-vecTR4YAf-w', title: 'חדשות בזמן אמת', url: 'https://www.youtube.com/embed/vecTR4YAf-w', thumbnail: 'https://img.youtube.com/vi/vecTR4YAf-w/maxresdefault.jpg', type: 'youtube', created_date: new Date('2024-01-12') },
    { id: 'yt-OE6Oj8pW0BU', title: 'עדכוני חדשות', url: 'https://www.youtube.com/embed/OE6Oj8pW0BU', thumbnail: 'https://img.youtube.com/vi/OE6Oj8pW0BU/maxresdefault.jpg', type: 'youtube', created_date: new Date('2024-01-11') },
    { id: 'yt-t60lrCbStcY', title: 'סיקור מיוחד', url: 'https://www.youtube.com/embed/t60lrCbStcY', thumbnail: 'https://img.youtube.com/vi/t60lrCbStcY/maxresdefault.jpg', type: 'youtube', created_date: new Date('2024-01-10') },
  ];

  // Combine all videos
  const allVideos = [
    ...youtubeVideos,
    ...userVideos.map(v => ({
      id: v.id,
      title: v.title,
      url: v.video_url,
      thumbnail: v.thumbnail_url,
      type: 'user',
      created_date: new Date(v.created_date),
      views: v.views || 0,
      uploader_email: v.uploader_email
    }))
  ].sort((a, b) => b.created_date - a.created_date);

  return (
    <section className="px-4 sm:px-4 mt-12 mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Film className="w-6 h-6 text-[#E31E24]" />
          <h2 className="text-3xl font-bold text-white">גלריית וידאו מלאה</h2>
        </div>
        <div className="text-gray-400 text-sm">
          {allVideos.length} סרטונים זמינים
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading && Array.from({ length: 8 }).map((_, idx) => (
          <VideoSkeleton key={`skeleton-${idx}`} />
        ))}
        {allVideos.map((video, idx) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -5 }}
            onClick={() => setSelectedVideo(video)}
            className="group cursor-pointer bg-gradient-to-br from-black/80 via-[#E31E24]/20 to-black/80 backdrop-blur-sm rounded-xl overflow-hidden border-2 border-[#E31E24]/40 hover:border-[#E31E24]/80 transition-all"
            style={{
              boxShadow: '0 0 20px rgba(227, 30, 36, 0.3), inset 0 0 20px rgba(227, 30, 36, 0.1)'
            }}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden">
              {video.thumbnail ? (
                <img 
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <Film className="w-12 h-12 text-gray-600" />
                </div>
              )}
              
              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-[#E31E24] flex items-center justify-center">
                  <Play className="w-8 h-8 text-white mr-1" fill="white" />
                </div>
              </div>

              {/* Type Badge */}
              <div className="absolute top-2 right-2">
                {video.type === 'youtube' ? (
                  <div className="bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                    <Youtube className="w-3 h-3" />
                    YouTube
                  </div>
                ) : (
                  <div className="bg-[#E31E24] text-white px-2 py-1 rounded-md text-xs font-bold">
                    משתמש
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="text-white font-bold text-sm line-clamp-2 mb-2 group-hover:text-[#E31E24] transition-colors">
                {video.title}
              </h3>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {moment(video.created_date).fromNow()}
                </div>
                {video.views > 0 && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {video.views.toLocaleString()}
                  </div>
                )}
              </div>

              {video.uploader_email && (
                <div className="text-xs text-gray-500 mt-2 truncate">
                  {video.uploader_email}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-black rounded-2xl overflow-hidden max-w-5xl w-full border-2 border-[#E31E24]/40"
              style={{
                boxShadow: '0 0 60px rgba(227, 30, 36, 0.5)'
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-[#E31E24] transition-all border-2 border-[#E31E24]/40"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Video Player */}
              <div className="relative aspect-video">
                {selectedVideo.type === 'youtube' ? (
                  <iframe
                    src={`${selectedVideo.url}?autoplay=0`}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                  />
                ) : (
                  <>
                    <video
                      key={selectedVideo.id}
                      src={selectedVideo.url}
                      className="w-full h-full bg-black"
                      autoPlay
                      loop
                      controls
                      playsInline
                      style={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                      onLoadStart={() => setIsLoading(true)}
                      onLoadedMetadata={(e) => {
                        e.target.volume = 1;
                      }}
                      onCanPlay={() => setIsLoading(false)}
                      onError={() => setIsLoading(false)}
                    />

                    {/* Loading Indicator */}
                    {isLoading && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Loader className="w-8 h-8 text-[#E31E24]" />
                        </motion.div>
                        <p className="text-white font-bold text-lg">טוען...</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Video Info */}
              <div className="p-6 bg-gradient-to-br from-black/80 via-[#E31E24]/20 to-black/80">
                <h2 className="text-white text-2xl font-bold mb-2">{selectedVideo.title}</h2>
                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {moment(selectedVideo.created_date).format('DD/MM/YYYY')}
                  </div>
                  {selectedVideo.views > 0 && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {selectedVideo.views.toLocaleString()} צפיות
                    </div>
                  )}
                  {selectedVideo.type === 'youtube' ? (
                    <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Youtube className="w-3 h-3" />
                      YouTube
                    </div>
                  ) : (
                    <div className="bg-[#E31E24] text-white px-3 py-1 rounded-full text-xs font-bold">
                      הועלה ע"י משתמש
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {allVideos.length === 0 && (
        <div className="bg-gradient-to-br from-black/80 via-[#E31E24]/20 to-black/80 backdrop-blur-sm rounded-xl p-12 text-center border-2 border-[#E31E24]/40">
          <Film className="w-16 h-16 text-[#E31E24] mx-auto mb-4" />
          <p className="text-gray-400 text-lg">אין סרטונים זמינים כרגע</p>
        </div>
      )}
    </section>
  );
}