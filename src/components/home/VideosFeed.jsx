import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Eye, ChevronUp, ChevronDown, Play } from "lucide-react";
import VideoShareButtons from "../shared/VideoShareButtons";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";
const BACKGROUND_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/43de178a9_image.png";

export default function VideosFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const { data: userVideos = [] } = useQuery({
    queryKey: ['user-videos-feed'],
    queryFn: () => base44.entities.UserVideo.filter({ status: 'ready' }, '-created_date', 100),
    initialData: [],
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Real YouTube videos from the channel
  const youtubeVideos = [
    { id: 'yt-pPRKdCHHlGI', title: 'שידור חי עכשיו - הרשת החדשה', url: 'https://www.youtube.com/embed/pPRKdCHHlGI?autoplay=0&mute=1&rel=0', thumbnail: 'https://img.youtube.com/vi/pPRKdCHHlGI/maxresdefault.jpg' },
    { id: 'yt-OeEDtjuqinU', title: 'חדשות הערב - שידור חי', url: 'https://www.youtube.com/embed/OeEDtjuqinU?autoplay=0&mute=1&rel=0', thumbnail: 'https://img.youtube.com/vi/OeEDtjuqinU/maxresdefault.jpg' },
    { id: 'yt-EGxPXB-Kwuo', title: 'עדכון חדשות יומי - הרשת החדשה', url: 'https://www.youtube.com/embed/EGxPXB-Kwuo?autoplay=0&mute=1&rel=0', thumbnail: 'https://img.youtube.com/vi/EGxPXB-Kwuo/maxresdefault.jpg' },
    { id: 'yt-yqfErzEHR0g', title: 'כתבים מהשטח - דיווח בזמן אמת', url: 'https://www.youtube.com/embed/yqfErzEHR0g?autoplay=0&mute=1&rel=0', thumbnail: 'https://img.youtube.com/vi/yqfErzEHR0g/maxresdefault.jpg' },
    { id: 'yt-k7WPygB6GlI', title: 'סרטון ממוחשב - הרשת החדשה', url: 'https://www.youtube.com/embed/k7WPygB6GlI?autoplay=0&mute=1&rel=0', thumbnail: 'https://img.youtube.com/vi/k7WPygB6GlI/maxresdefault.jpg' },
    { id: 'yt-4miQnYCTdS8', title: 'הרשת החדשה - שידור חי', url: 'https://www.youtube.com/embed/4miQnYCTdS8?autoplay=0&mute=1&rel=0', thumbnail: 'https://img.youtube.com/vi/4miQnYCTdS8/maxresdefault.jpg' },
    { id: 'yt-2q9lcnXBicQ', title: 'תוכן מיוחד הרשת', url: 'https://www.youtube.com/embed/2q9lcnXBicQ?autoplay=0&mute=1&rel=0', thumbnail: 'https://img.youtube.com/vi/2q9lcnXBicQ/maxresdefault.jpg' },
    { id: 'yt-vecTR4YAf-w', title: 'חדשות בזמן אמת', url: 'https://www.youtube.com/embed/vecTR4YAf-w?autoplay=0&mute=1&rel=0', thumbnail: 'https://img.youtube.com/vi/vecTR4YAf-w/maxresdefault.jpg' },
  ];

  const videos = [
    ...youtubeVideos,
    ...userVideos.map(v => ({
      id: v.id,
      title: v.title,
      url: v.video_url,
      thumbnail: v.thumbnail_url,
      views: v.views || 0,
      likes: v.likes || 0
    }))
  ];

  // Load more on scroll
  useEffect(() => {
    const handleWheel = (e) => {
      if (!containerRef.current?.contains(e.target)) return;
      e.preventDefault();
      
      if (e.deltaY > 0 && currentIndex < videos.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentIndex, videos.length]);

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientY);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientY);
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50 && currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (touchStart - touchEnd < -50 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (videos.length === 0) {
    return (
      <section className="relative h-screen overflow-hidden bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#E31E24] border-t-transparent animate-spin mx-auto" />
          <p className="text-xl mt-4">טוען וידאו...</p>
        </div>
      </section>
    );
  }

  const currentVideo = videos[currentIndex];

  return (
    <section className="relative bg-black">
      <section
        ref={containerRef}
        className="relative h-screen overflow-hidden bg-black"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          backgroundImage: `url('${BACKGROUND_IMAGE}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        <style>{`
          @keyframes neon-glow {
            0%, 100% { box-shadow: 0 0 10px rgba(227, 30, 36, 0.5), 0 0 20px rgba(227, 30, 36, 0.3); }
            50% { box-shadow: 0 0 20px rgba(227, 30, 36, 0.8), 0 0 40px rgba(227, 30, 36, 0.6); }
          }
        `}</style>

        {/* Video Player Container */}
        <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-6 w-full h-full px-4 sm:px-0">
          {/* Up Arrow Button - Left */}
          <motion.button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 backdrop-blur-sm border border-[#E31E24]/40 hover:border-[#E31E24] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#E31E24]" />
          </motion.button>

          <div className="relative flex-shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="rounded-3xl overflow-hidden bg-black border-2 border-[#E31E24]/40"
                style={{
                  width: 'clamp(280px, 90vw, 400px)',
                  height: 'clamp(500px, 160vw, 600px)',
                  animation: 'neon-glow 3s ease-in-out infinite'
                }}
              >
                {/* Video Container */}
                <div className="relative w-full h-full">
                  <iframe
                    src={currentVideo?.url}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                  />

                  {/* Logo Watermark */}
                  <div className="absolute top-2 right-2 opacity-60 hover:opacity-100 transition-opacity">
                    <img 
                      src={LOGO_URL} 
                      alt="הרשת החדשה" 
                      className="h-12 w-auto drop-shadow-lg"
                    />
                  </div>

                  {/* Video Title Overlay */}
                  {currentVideo?.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4">
                      <h3 className="text-white font-bold text-base line-clamp-2 mb-2">{currentVideo.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/80 text-xs">
                          {currentVideo?.views && (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>{currentVideo.views.toLocaleString()} צפיות</span>
                            </>
                          )}
                        </div>
                        <VideoShareButtons videoUrl={currentVideo.url} title={currentVideo.title} className="scale-90" />
                      </div>
                    </div>
                  )}

                  {/* Play Icon */}
                  {currentVideo?.thumbnail && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40 pointer-events-none">
                      <div className="w-16 h-16 rounded-full bg-[#E31E24] flex items-center justify-center">
                        <Play className="w-8 h-8 text-white mr-1" fill="white" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Video Counter */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-full text-white text-xs font-bold border border-[#E31E24]/40">
              {currentIndex + 1} / {videos.length}
            </div>
          </div>

          {/* Down Arrow Button - Right */}
          <motion.button
            onClick={() => setCurrentIndex(Math.min(videos.length - 1, currentIndex + 1))}
            disabled={currentIndex === videos.length - 1}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 backdrop-blur-sm border border-[#E31E24]/40 hover:border-[#E31E24] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-[#E31E24]" />
          </motion.button>
        </div>

        {/* Scroll Hint */}
        {currentIndex === 0 && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm flex flex-col items-center gap-2 z-20"
          >
            <span>גלול למטה לעוד וידאו</span>
            <motion.div 
              animate={{ y: [0, 8, 0], rotate: 180 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronUp className="w-5 h-5" />
            </motion.div>
          </motion.div>
        )}
      </section>
    </section>
  );
}