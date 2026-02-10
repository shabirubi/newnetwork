import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

export default function ReporterLiveChat({ isOpen, onClose, reporter }) {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !reporter) return null;

  // Map reporters to their D-ID agent URLs
  const reporterAgents = {
    'עדי': "https://studio.d-id.com/agents/share?id=v2_agt_DMY3wZsg&key=WjI5dloyeGxMVzloZFhSb01ud3hNRGt3TlRBd01qRTROall3TURjMU9ESTBPVFk2TVVsNFJ6Tk5kelJMWmtSWFZHVTNUREJmTjNkMw==",
    'רון כהן': "https://studio.d-id.com/agents/share?id=v2_agt_vpw--KK0&key=WjI5dloyeGxMVzloZFhSb01ud3hNRGt3TlRBd01qRTROall3TURjMU9ESTBPVFk2TVVsNFJ6Tk5kelJMWmtSWFZHVTNUREJmTjNkMw==",
  };

  const agentUrl = reporterAgents[reporter.name] || reporterAgents['עדי'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-black rounded-2xl overflow-hidden w-full max-w-5xl shadow-2xl border-2 border-[#0080FF]/50 h-[90vh] flex flex-col"
          style={{
            boxShadow: '0 0 60px rgba(0, 128, 255, 0.5)'
          }}
        >
          {/* Branded Header */}
          <div className="bg-gradient-to-r from-black via-[#0080FF]/20 to-black p-4 flex items-center justify-between shrink-0 border-b-2 border-[#0080FF]/50">
            <motion.img 
              src={LOGO_URL}
              alt="הרשת החדשה"
              className="h-12 w-auto drop-shadow-2xl"
              animate={{ 
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="text-center flex-1 px-4">
              <div className="text-white font-bold text-xl drop-shadow-lg">{reporter.name}</div>
              <div className="text-[#0080FF] font-bold text-sm flex items-center justify-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0080FF] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0080FF]"></span>
                </span>
                שיחה חיה
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center transition-colors border-2 border-red-500/50"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* D-ID Agent Iframe */}
          <div className="flex-1 bg-black relative overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="text-center">
                  <Loader2 className="w-16 h-16 text-[#0080FF] animate-spin mx-auto mb-4" />
                  <p className="text-white text-lg">טוען את {reporter.name}...</p>
                </div>
              </div>
            )}
            
            <iframe
              ref={iframeRef}
              src={agentUrl}
              allow="microphone; camera; autoplay"
              className="w-full h-full border-0"
              title={`${reporter.name} Live Chat`}
            />
          </div>

          {/* Branded Footer */}
          <div className="bg-gradient-to-r from-black via-[#0080FF]/20 to-black p-3 border-t-2 border-[#0080FF]/50 flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#0080FF] font-bold">הרשת החדשה</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">Powered by D-ID AI</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}