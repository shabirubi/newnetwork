import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Loader2, Mic, MicOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import StreamingAvatar, { AvatarQuality, StreamingEvents } from '@heygen/liveavatar-web-sdk';

export default function LiveAvatarChatModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const avatarRef = useRef(null);
  const videoRef = useRef(null);
  const avatarInstance = useRef(null);

  useEffect(() => {
    if (isOpen) {
      initSession();
    }
    
    return () => {
      if (avatarInstance.current) {
        avatarInstance.current.stopAvatar();
      }
    };
  }, [isOpen]);

  const initSession = async () => {
    try {
      setLoading(true);
      setError(null);

      // קבלת token מהשרת
      const { data } = await base44.functions.invoke('getHeyGenToken');
      
      if (data.error) {
        throw new Error(data.error);
      }

      // אתחול ה-SDK
      avatarInstance.current = new StreamingAvatar({
        token: data.token
      });

      // התחברות לאירועים
      avatarInstance.current.on(StreamingEvents.AVATAR_START_TALKING, () => {
        console.log('Avatar started talking');
      });

      avatarInstance.current.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        console.log('Avatar stopped talking');
      });

      avatarInstance.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log('Stream disconnected');
        setError('החיבור נותק');
      });

      avatarInstance.current.on(StreamingEvents.STREAM_READY, (event) => {
        console.log('Stream ready:', event.detail);
        setLoading(false);
      });

      // התחלת הסשן
      await avatarInstance.current.createStartAvatar({
        quality: AvatarQuality.High,
        avatarName: 'Wayne_20240711',
        voice: {
          voiceId: 'en-US-JennyNeural'
        },
        language: 'he'
      }, videoRef.current);

    } catch (err) {
      console.error('Error initializing avatar:', err);
      setError(err.message || 'שגיאה באתחול הדמות');
      setLoading(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      await avatarInstance.current.startVoiceChat();
      toast.success('מאזין...');
    } catch (err) {
      console.error('Error starting voice chat:', err);
      toast.error('שגיאה בהקלטה');
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      await avatarInstance.current.stopVoiceChat();
      setIsRecording(false);
    } catch (err) {
      console.error('Error stopping voice chat:', err);
      setIsRecording(false);
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
            <div className="bg-black relative" style={{ aspectRatio: '16/9' }}>
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" />
                    <p className="text-white">טוען דמות...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
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
            </div>

            {/* Footer Controls */}
            <div className="bg-gradient-to-r from-gray-900 to-black p-4 border-t border-green-500/20">
              <div className="flex items-center justify-center gap-4">
                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    disabled={loading || error}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full text-white font-bold transition-colors"
                  >
                    <Mic className="w-5 h-5" />
                    התחל דיבור
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full text-white font-bold transition-colors animate-pulse"
                  >
                    <MicOff className="w-5 h-5" />
                    עצור דיבור
                  </button>
                )}
              </div>
              <p className="text-gray-400 text-xs text-center mt-2">
                לחץ על הכפתור והתחל לדבר עם הדמות
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}