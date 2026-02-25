import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function YouTubeFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [channelInfo, setChannelInfo] = useState(null);

  useEffect(() => {
    if (isOpen && videos.length === 0) {
      fetchVideos();
    }
  }, [isOpen]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('fetchYouTubeChannelVideos', {
        maxResults: 50
      });
      
      if (response?.data?.channelInfo) {
        setChannelInfo(response.data.channelInfo);
      }
      
      if (response?.data?.videos && response.data.videos.length > 0) {
        setVideos(response.data.videos);
        toast.success(`נטענו ${response.data.videos.length} סרטונים`);
      } else {
        toast.error('לא נמצאו סרטונים');
      }
    } catch (err) {
      toast.error('שגיאה בטעינת סרטונים');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating YouTube Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 bottom-24 lg:bottom-8 z-40 bg-red-600 hover:bg-red-700 rounded-full p-4 shadow-2xl shadow-red-500/50 transition-all active:scale-95"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-red-500/30 shadow-2xl shadow-red-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {channelInfo?.thumbnail ? (
                    <img 
                      src={channelInfo.thumbnail} 
                      alt="Channel" 
                      className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                    />
                  ) : (
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="white">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  )}
                  <div>
                    <h2 className="text-white font-bold text-xl">{channelInfo?.title || 'הרשת החדשה'}</h2>
                    <p className="text-red-100 text-sm">ערוץ YouTube רשמי</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://www.youtube.com/@Hareshetahadasha"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="פתח בYouTube"
                  >
                    <ExternalLink className="w-5 h-5 text-white" />
                  </a>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Videos Grid */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
                    <p className="text-white mt-4">טוען סרטונים...</p>
                  </div>
                ) : videos.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">לא נמצאו סרטונים</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((video) => (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-red-500/50 transition-all group"
                      >
                        <div className="relative aspect-video bg-black cursor-pointer" onClick={() => setSelectedVideo(video)}>
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                            <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                          </div>
                          {video.duration && (
                            <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-white text-xs font-bold">
                              {video.duration}
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="text-white font-bold text-sm line-clamp-2 mb-2">
                            {video.title}
                          </h3>
                          <p className="text-gray-400 text-xs mb-2">{video.publishedAt}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedVideo(video)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                            >
                              <Play className="w-4 h-4" />
                              צפה
                            </button>
                            <a
                              href={`https://www.youtube.com/watch?v=${video.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-all flex items-center justify-center"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-black rounded-2xl w-full max-w-5xl overflow-hidden border border-red-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-600 to-red-700">
                <h3 className="text-white font-bold">{selectedVideo.title}</h3>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="aspect-video bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}