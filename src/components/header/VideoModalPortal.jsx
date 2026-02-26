import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

export default function VideoModalPortal({
  isOpen,
  onClose,
  videos = [],
  currentVideoIndex,
  onScroll,
}) {
  const videoContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] bg-black"
          onClick={onClose}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-[100000] text-white hover:text-red-500 transition-colors bg-black/50 p-2 rounded-full backdrop-blur-sm"
          >
            <X className="w-8 h-8" />
          </button>

          {/* TikTok-Style Scrollable Videos */}
          <div
            ref={videoContainerRef}
            onScroll={onScroll}
            onClick={(e) => e.stopPropagation()}
            className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {videos.length > 0 ? (
              videos.map((video, index) => (
                <div
                  key={video.id}
                  className="h-screen w-screen snap-start snap-always flex items-center justify-center bg-black"
                >
                  {Math.abs(index - currentVideoIndex) <= 1 && (
                    <video
                      src={video.video_url}
                      autoPlay={index === currentVideoIndex}
                      loop
                      playsInline
                      controls
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>
              ))
            ) : (
              <div className="h-screen w-screen flex items-center justify-center bg-black">
                <p className="text-white text-xl">אין סרטונים זמינים</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}