import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function LiveAvatarChatModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [sessionUrl, setSessionUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      initSession();
    }
  }, [isOpen]);

  const initSession = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await base44.functions.invoke('createLiveAvatarSession', {});
      
      if (data.success && data.session_url) {
        setSessionUrl(data.session_url);
      } else {
        setError('לא הצליח ליצור חיבור לדמות');
        toast.error('שגיאה בטעינת הדמות');
      }
    } catch (err) {
      console.error('LiveAvatar session error:', err);
      setError('שגיאת חיבור');
      toast.error('לא הצליח להתחבר לשירות');
    } finally {
      setLoading(false);
    }
  };

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
            <div className="bg-black" style={{ aspectRatio: '16/9' }}>
              {loading && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" />
                    <p className="text-white">טוען דמות...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-red-400 text-xl mb-4">⚠️</div>
                    <p className="text-white mb-4">{error}</p>
                    <button
                      onClick={initSession}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
                    >
                      נסה שוב
                    </button>
                  </div>
                </div>
              )}

              {sessionUrl && !loading && !error && (
                <iframe 
                  src={sessionUrl}
                  allow="microphone; camera"
                  title="LiveAvatar Session"
                  className="w-full h-full"
                  style={{ border: 'none' }}
                />
              )}
            </div>

            {/* Footer Info */}
            <div className="bg-gradient-to-r from-gray-900 to-black p-4 border-t border-green-500/20">
              <p className="text-gray-400 text-sm text-center">
                🎤 הפעל את המיקרופון שלך כדי לדבר עם הדמות
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}