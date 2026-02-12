import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Mic, MicOff, VideoIcon, VideoOff, Loader2, MessageCircle, Radio } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

export default function DIDLiveChat({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate loading time for iframe
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const agentUrl = "https://studio.d-id.com/agents/share?id=v2_agt_pW1vqMCQ&utm_source=copy&key=WjI5dloyeGxMVzloZFhSb01ud3hNRGt3TlRBd01qRTROall3TURjMU9ESTBPVFk2TVVsNFJ6Tk5kelJMWmtSWFZHVTNUREJmTjNkMw==";

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
          className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden w-full max-w-6xl shadow-2xl border border-purple-500/50 h-[90vh] flex flex-col"
        >
          {/* Branded Header */}
          <div className="bg-black p-4 flex items-center justify-between shrink-0 border-b border-[#E31E24]/30"
            style={{
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)'
            }}
          >
            <motion.img 
              src={LOGO_URL}
              alt="הרשת החדשה"
              className="h-16 w-auto drop-shadow-2xl"
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
              <div className="text-white font-bold text-xl drop-shadow-lg">הרשת החדשה</div>
              <div className="text-[#E31E24] font-bold text-sm" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                {isLoading ? 'טוען אווטר...' : 'צ\'אט חי עם אווטר AI'}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#E31E24]/20 hover:bg-[#E31E24]/40 flex items-center justify-center transition-colors border border-[#E31E24]/30"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* D-ID Agent Iframe */}
          <div className="flex-1 bg-black relative overflow-hidden">
            {/* Left Frame */}
            <div className="absolute top-0 bottom-0 left-0 w-12 bg-black z-30"
              style={{
                boxShadow: '4px 0 20px rgba(0, 0, 0, 0.8)'
              }}
            />

            {/* Right Frame */}
            <div className="absolute top-0 bottom-0 right-0 w-12 bg-black z-30"
              style={{
                boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.8)'
              }}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                  <p className="text-white">טוען את האגנט...</p>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={agentUrl}
              allow="microphone; camera; autoplay"
              className="w-full h-full border-0"
              title="D-ID Agent Chat"
              tabIndex="-1"
              style={{ 
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '25%',
                height: '35%',
                overflow: 'hidden',
                pointerEvents: 'auto',
                outline: 'none',
                border: 'none'
              }}
            />
          </div>

          {/* Branded Footer */}
          <div className="bg-black p-4 border-t border-[#E31E24]/30 flex items-center justify-center"
            style={{
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.8)'
            }}
          >
            <div className="flex items-center gap-2 bg-[#E31E24]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#E31E24]/50">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E31E24] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E31E24]"></span>
              </span>
              <span className="text-white font-bold">שיחה חיה</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}