import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Edit3 } from 'lucide-react';
import ArticleEditorModal from './ArticleEditorModal';

export default function YouTubeFloatingButton() {
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {editorOpen && (
          <ArticleEditorModal
            article={null}
            onClose={() => setEditorOpen(false)}
            onSaved={() => setEditorOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed left-4 bottom-24 lg:bottom-8 z-40 flex flex-col gap-2 items-start">
        {/* Editor button — above Reels */}
        <motion.button
          onClick={() => setEditorOpen(true)}
          className="bg-[#0057B8] hover:bg-blue-700 rounded-full px-4 py-2.5 shadow-2xl shadow-blue-500/50 transition-all active:scale-95 border-2 border-blue-400 flex items-center gap-2"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Edit3 className="w-5 h-5 text-white" />
          <span className="text-white font-bold text-sm">עורך</span>
        </motion.button>

        {/* Reels button */}
        <motion.button
          onClick={() => window.dispatchEvent(new CustomEvent('openReels'))}
          className="bg-red-600 hover:bg-red-700 rounded-full px-4 py-2.5 shadow-2xl shadow-red-500/50 transition-all active:scale-95 border-2 border-red-400 flex items-center gap-2"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <Radio className="w-5 h-5 text-white" />
          <span className="text-white font-bold text-sm">Reels</span>
        </motion.button>
      </div>
    </>
  );
}