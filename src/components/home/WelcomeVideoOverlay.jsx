import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function WelcomeVideoOverlay({ onVideoEnd }) {
  const [videoEnded, setVideoEnded] = useState(false);

  const handleVideoEnd = () => {
    setVideoEnded(true);
    setTimeout(() => {
      onVideoEnd();
    }, 500);
  };

  return (
    <AnimatePresence>
      {!videoEnded && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-md aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 backdrop-blur-md"
          >
            {/* YouTube Shorts Embed */}
            <iframe
              src="https://www.youtube.com/embed/P2yEIgfJ0J8?autoplay=1&modestbranding=1&fs=0"
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              onLoad={(e) => {
                e.target.style.pointerEvents = "none";
              }}
            />

            {/* Overlay for detecting end */}
            <div
              className="absolute inset-0 cursor-pointer"
              onClick={handleVideoEnd}
              onDoubleClick={handleVideoEnd}
              title="קליק לעבור הלאה"
            />

            {/* Skip Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              onClick={handleVideoEnd}
              className="absolute top-4 left-4 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold transition-all"
            >
              דלג →
            </motion.button>

            {/* Loading indicator */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-4 right-4 w-6 h-6 border-2 border-white/50 border-t-white rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}