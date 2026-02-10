import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

export default function ReporterLiveChat({ isOpen, onClose, reporter }) {
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

  if (!isOpen || !reporter) return null;

  // Map reporters to their specific D-ID agents
  const reporterAgents = {
    'עדי': "https://studio.d-id.com/agents/share?id=v2_agt_DMY3wZsg&utm_source=copy&key=WjI5dloyeGxMVzloZFhSb01ud3hNRGt3TlRBd01qRTROall3TURjMU9ESTBPVFk2TVVsNFJ6Tk5kelJMWmtSWFZHVTNUREJmTjNkMw==",
    'רון כהן': "https://studio.d-id.com/agents/share?id=v2_agt_vpw--KK0&utm_source=copy&key=WjI5dloyeGxMVzloZFhSb01ud3hNRGt3TlRBd01qRTROall3TURjMU9ESTBPVFk2TVVsNFJ6Tk5kelJMWmtSWFZHVTNUREJmTjNkMw==",
    // הוסף כאן כתבים נוספים עם ה-agents שלהם
  };

  // Get agent URL for current reporter, fallback to Adi's agent if not found
  const agentUrl = reporterAgents[reporter.name] || reporterAgents['עדי'];

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
          className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden w-full max-w-6xl shadow-2xl border-2 border-[#0080FF]/50 h-[90vh] flex flex-col"
          style={{
            boxShadow: '0 0 60px rgba(0, 128, 255, 0.5)'
          }}
        >
          {/* Branded Header with Logo */}
          <div className="bg-black p-4 flex items-center justify-between shrink-0 border-b-2 border-[#0080FF]/50"
            style={{
              boxShadow: '0 4px 30px rgba(0, 128, 255, 0.4)'
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
              <div className="text-white font-bold text-xl drop-shadow-lg">{reporter.name}</div>
              <div className="text-[#0080FF] font-bold text-sm flex items-center justify-end gap-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0080FF] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0080FF]"></span>
                </span>
                {isLoading ? 'מכין אווטר חי...' : 'צ\'אט חי עם אווטר AI'}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#0080FF]/20 hover:bg-[#0080FF]/40 flex items-center justify-center transition-colors border-2 border-[#0080FF]/50"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* D-ID Agent Iframe */}
          <div className="flex-1 bg-black relative overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-[#0080FF] animate-spin mx-auto mb-4" />
                  <p className="text-white">טוען את {reporter.name}...</p>
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
          <div className="bg-black p-4 border-t-2 border-[#0080FF]/50 flex items-center justify-center"
            style={{
              boxShadow: '0 -4px 30px rgba(0, 128, 255, 0.4)'
            }}
          >
            <div className="flex items-center gap-2 bg-[#0080FF]/20 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-[#0080FF]/50">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0080FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0080FF]"></span>
              </span>
              <span className="text-white font-bold">שיחה חיה עם {reporter.name}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}