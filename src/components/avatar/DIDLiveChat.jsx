import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Mic, MicOff, VideoIcon, VideoOff, Loader2, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">שיחה חיה עם D-ID Agent</h2>
                <p className="text-purple-100 text-sm">
                  {isLoading ? 'טוען...' : '🟢 מוכן לשיחה - דבר במיקרופון'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* D-ID Agent Iframe */}
          <div className="flex-1 bg-black relative overflow-hidden">
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
            />
          </div>

          {/* Footer Info */}
          <div className="bg-gradient-to-br from-gray-900 to-black p-4 border-t border-purple-500/30">
            <p className="text-center text-gray-400 text-sm">
              💬 דבר ישירות עם האגנט דרך המיקרופון
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}