import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

export default function KanArchiveModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-black rounded-2xl overflow-hidden max-w-7xl w-full h-[90vh] border-2 border-[#E31E24]/40"
          style={{
            boxShadow: '0 0 60px rgba(227, 30, 36, 0.5)'
          }}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black via-black/80 to-transparent p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                🔥
              </div>
              <div>
                <h2 className="text-white text-2xl font-bold">עמוד האש - כאן תאגיד</h2>
                <p className="text-gray-400 text-sm">סדרה תיעודית מיוחדת</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://www.kan.org.il/program/?catid=949"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                title="פתח באתר כאן"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-[#E31E24] text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* iFrame */}
          <iframe
            src="https://www.kan.org.il/program/?catid=949"
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; encrypted-media; fullscreen"
            title="עמוד האש - כאן"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}