import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function TikTokNewsFeed() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const containerRef = React.useRef(null);
  const touchStartRef = React.useRef(0);

  const youtubeVideos = [
    { id: 'youtube-pPRKdCHHlGI', url: 'https://www.youtube.com/embed/pPRKdCHHlGI?autoplay=0&mute=1&loop=1&playlist=pPRKdCHHlGI', title: 'שידור חי עכשיו' },
    { id: 'youtube-OeEDtjuqinU', url: 'https://www.youtube.com/embed/OeEDtjuqinU?autoplay=0&mute=1&loop=1&playlist=OeEDtjuqinU', title: 'חדשות הערב' },
    { id: 'youtube-k7WPygB6GlI', url: 'https://www.youtube.com/embed/k7WPygB6GlI?autoplay=0&mute=1&loop=1&playlist=k7WPygB6GlI', title: 'חדשות עכשיו' },
    { id: 'youtube-4miQnYCTdS8', url: 'https://www.youtube.com/embed/4miQnYCTdS8?autoplay=0&mute=1&loop=1&playlist=4miQnYCTdS8', title: 'עדכון חם' },
    { id: 'youtube-2q9lcnXBicQ', url: 'https://www.youtube.com/embed/2q9lcnXBicQ?autoplay=0&mute=1&loop=1&playlist=2q9lcnXBicQ', title: 'ניתוח מעמיק' },
    { id: 'youtube-vecTR4YAf-w', url: 'https://www.youtube.com/embed/vecTR4YAf-w?autoplay=0&mute=1&loop=1&playlist=vecTR4YAf-w', title: 'דיווח מיוחד' }
  ];

  const currentVideo = youtubeVideos[currentIndex % youtubeVideos.length];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : youtubeVideos.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < youtubeVideos.length - 1 ? prev + 1 : 0));
  };

  // Handle wheel scroll
  React.useEffect(() => {
    const handleWheel = (e) => {
      if (containerRef.current && containerRef.current.contains(e.target)) {
        e.preventDefault();
        if (e.deltaY > 0) {
          handleNext();
        } else {
          handlePrevious();
        }
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleWheel);
  }, [currentIndex]);

  // Handle touch swipe
  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStartRef.current - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full bg-black overflow-hidden"
      style={{ height: 'clamp(500px, 80vh, 700px)' }}
    >
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentVideo.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            {/* YouTube Video Player */}
            <iframe
              src={currentVideo.url}
              className="w-full h-full absolute inset-0"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />

            {/* Gradient Overlay for Title */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 pointer-events-none">
              <h2 className="text-2xl font-bold text-white">
                {currentVideo.title}
              </h2>
              <p className="text-white/70 text-sm mt-2">
                הרשת החדשה - שידור חי
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress Indicator */}
        <div className="absolute top-4 left-0 right-0 flex gap-1 px-4 z-10">
          {youtubeVideos.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all ${
                idx === currentIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={handlePrevious}
          className="absolute top-1/2 -translate-y-1/2 left-4 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-white/20"
          aria-label="Previous video"
        >
          <ChevronUp className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          className="absolute top-1/2 -translate-y-1/2 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-white/20"
          aria-label="Next video"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* Video Counter */}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full text-white text-xs font-bold border border-white/20 z-10">
          {currentIndex + 1} / {youtubeVideos.length}
        </div>
      </div>
    </div>
  );
}