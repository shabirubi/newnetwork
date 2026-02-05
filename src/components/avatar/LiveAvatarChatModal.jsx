import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Loader2 } from 'lucide-react';

export default function LiveAvatarChatModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // סימולציה של טעינה
      const timer = setTimeout(() => setLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl border border-green-500/30"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">צ'אט חי עם דמות AI</h2>
                  <p className="text-green-100 text-sm">דבר עם הדמות באמצעות המיקרופון</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="bg-black relative" style={{ aspectRatio: '16/9' }}>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" />
                    <p className="text-white">טוען דמות...</p>
                  </div>
                </div>
              )}

              <iframe 
                ref={iframeRef}
                src="https://app.liveavatar.com/f0a9978d-634a-4063-8164-42ba6670542f"
                allow="microphone; camera"
                title="LiveAvatar Chat"
                className="w-full h-full border-0"
              />
            </div>

            {/* Footer Info */}
            <div className="bg-gradient-to-r from-gray-900 to-black p-4 border-t border-green-500/20">
              <p className="text-gray-400 text-sm text-center">
                🎤 דבר עם הדמות ישירות דרך הממשק
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}