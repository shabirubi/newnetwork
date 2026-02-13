import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cloud, Loader2 } from "lucide-react";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

export default function WeatherForecastModal({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOpen = () => {
      if (!isOpen) {
        // Open the modal
        const event = new Event('openWeatherChatModal');
        window.dispatchEvent(event);
      }
    };
    window.addEventListener('openWeatherChat', handleOpen);
    return () => window.removeEventListener('openWeatherChat', handleOpen);
  }, [isOpen]);

  const weatherAgentUrl = "https://studio.d-id.com/agents/share?id=v2_agt_cim3LvE9&utm_source=copy&key=WjI5dloyeGxMVzloZFhSb01ud3hNRGt3TlRBd01qRTROall3TURjMU9ESTBPVFk2TVVsNFJ6Tk5kelJMWmtSWFZHVTNUREJmTjNkMw==";

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-blue-900 to-black rounded-2xl overflow-hidden w-full max-w-6xl shadow-2xl border border-blue-500/50 h-[95vh] sm:h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 p-4 flex items-center justify-between shrink-0 border-b border-blue-400/30">
            <motion.img 
              src={LOGO_URL}
              alt="הרשת החדשה"
              className="h-12 w-auto drop-shadow-2xl"
              animate={{ 
                scale: [1, 1.05, 1],
                filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)']
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="text-right flex-1 px-4">
              <div className="flex items-center justify-center gap-2">
                <Cloud className="w-6 h-6 text-white drop-shadow-lg" />
                <div className="text-white font-bold text-xl drop-shadow-lg">תחזיתן הרשת</div>
              </div>
              <div className="text-white/90 text-sm">שיחה חיה עם בינה מלאכותית</div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-red-500/30 hover:bg-red-500/50 flex items-center justify-center transition-colors border border-red-400/50"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 bg-black relative overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
                  <p className="text-white">טוען תחזיתן...</p>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={weatherAgentUrl}
              allow="microphone; camera; autoplay"
              className="w-full h-full border-0"
              title="Weather Forecast Chat"
              style={{ 
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                pointerEvents: 'auto',
                outline: 'none',
                border: 'none'
              }}
            />
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 p-3 border-t border-blue-400/30 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <span className="text-white font-bold">שיחה חיה</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}