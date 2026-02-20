import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Heart, MessageCircle, Loader2 } from "lucide-react";
import VideoShareModal from "../shared/VideoShareModal";

export default function NewsReelsModal({ isOpen, onClose, initialReel, reel, allReels = [] }) {
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const currentReel = initialReel || reel;
  if (!isOpen && !currentReel) return null;
  if (!currentReel) return null;

  const videoUrl = currentReel.url || currentReel.videoUrl;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-2xl w-full bg-black rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-all"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Video Player */}
        <div className="relative bg-black aspect-video flex items-center justify-center">
          {!videoUrl ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-[#E31E24] animate-spin" />
              <p className="text-gray-400 text-sm">טוען סרטון...</p>
            </div>
          ) : (
            <video
              src={videoUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error('Video load error:', e);
                e.target.style.display = 'none';
              }}
            />
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{currentReel.title}</h2>
            {currentReel.description && (
              <p className="text-gray-300">{currentReel.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-gray-300 hover:text-[#E31E24] transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span className="text-sm font-bold">{currentReel.likes || 0}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShareModalOpen(true)}
              className="flex items-center gap-2 text-gray-300 hover:text-[#E31E24] transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-bold">שתף</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-gray-300 hover:text-[#E31E24] transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-bold">תגובות</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <VideoShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        videoUrl={videoUrl}
        videoTitle={currentReel.title}
      />
    </motion.div>
  );
}