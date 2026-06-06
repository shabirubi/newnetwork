import React from 'react';
import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';

export default function YouTubeFloatingButton() {
  return (
    <div className="fixed left-4 bottom-24 lg:bottom-8 z-40 flex flex-col gap-2 items-start">
      {/* Reels button - bottom */}
      <motion.button
        onClick={() => window.dispatchEvent(new CustomEvent('openReels'))}
        className="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-full px-4 py-2.5 shadow-2xl shadow-red-500/50 transition-all active:scale-95 border-2 border-red-400 flex items-center gap-2"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        <Radio className="w-5 h-5 text-white" />
        <span className="text-white font-bold text-sm">ריילס</span>
      </motion.button>
    </div>
  );
}