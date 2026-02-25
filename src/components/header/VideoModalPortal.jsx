import React, { useRef, useEffect, useState } from 'react';
import { motion } from "framer-motion";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] bg-black overflow-hidden"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
      }}
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-[100000] text-white hover:text-red-500 transition-colors bg-black/50 p-2 rounded-full backdrop-blur-sm"
      >
        <X className="w-8 h-8" />
      </button>

      {/* TikTok-Style Scrollable Videos - Clean */}
      <div
        ref={videoContainerRef}
        onScroll={onScroll}
        onClick={(e) => e.stopPropagation()}
        className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          height: '100vh',
          width: '100vw',
          position: 'relative',
        }}
      >
        {videos.length > 0 ? (
          videos.map((video, index) => (
            <div
              key={video.id}
              className="h-screen w-screen snap-start snap-always flex items-center justify-center bg-black"
              style={{
                height: '100vh',
                width: '100vw',
              }}
            >
              {Math.abs(index - currentVideoIndex) <= 1 && (
                <video
                  src={video.video_url}
                  autoPlay={index === currentVideoIndex}
                  loop
                  playsInline
                  controls={false}
                  className="h-full w-full object-cover"
                  style={{
                    height: '100%',
                    width: '100%',
                  }}
                />
              )}
            </div>
          ))
        ) : (
          <div className="h-screen w-screen flex items-center justify-center bg-black">
            <p className="text-white">אין סרטונים זמינים</p>
          </div>
        )}
      </div>
    </motion.div>,
    typeof document !== 'undefined' ? document.body : null
  );
}