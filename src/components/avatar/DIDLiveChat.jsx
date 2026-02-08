import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video } from 'lucide-react';

export default function DIDLiveChat({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    // Load D-ID agent script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://agent.d-id.com/v2/index.js';
    script.setAttribute('data-mode', 'fabio');
    script.setAttribute('data-client-key', 'Z29vZ2xlLW9hdXRoMnwxMDkwNTAwMjE4NjYwMDc1ODI0OTY6MUl4RzNNdzRLZkRXVGU3TDBfN3d3');
    script.setAttribute('data-agent-id', 'v2_agt_pW1vqMCQ');
    script.setAttribute('data-name', 'did-agent');
    script.setAttribute('data-monitor', 'true');
    script.setAttribute('data-orientation', 'horizontal');
    script.setAttribute('data-position', 'right');

    document.body.appendChild(script);

    return () => {
      // Cleanup script when modal closes
      const existingScript = document.querySelector('script[src="https://agent.d-id.com/v2/index.js"]');
      if (existingScript) {
        existingScript.remove();
      }
      // Remove the agent widget
      const widget = document.querySelector('did-agent');
      if (widget) {
        widget.remove();
      }
    };
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
            className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl border border-purple-500/30"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">צ'אט חי עם דמות AI</h2>
                  <p className="text-purple-100 text-sm">הווידג'ט ייטען בעוד רגע...</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content - Widget will appear here */}
            <div className="p-4 bg-black min-h-[500px] flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50 animate-pulse" />
                <p>טוען ווידג'ט צ'אט...</p>
                <p className="text-xs mt-2">הווידג'ט של D-ID יופיע באתר</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}