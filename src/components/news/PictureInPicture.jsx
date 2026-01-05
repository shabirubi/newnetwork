import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Minimize2 } from "lucide-react";

export default function PictureInPicture({ isVisible, onClose }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 100 }}
        className={`fixed z-[100] ${
          isExpanded 
            ? "inset-4 md:inset-20" 
            : "bottom-4 left-4 w-80 md:w-96"
        }`}
        style={{ transition: "all 0.3s ease" }}
      >
        <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl">
          {/* Controls */}
          <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-xs font-bold">LIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white flex items-center justify-center transition-colors"
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Video */}
          <div className={isExpanded ? "aspect-video" : "aspect-video"}>
            <iframe
              src="https://ok.ru/videoembed/10508051226319?autoplay=1"
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
              frameBorder="0"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}