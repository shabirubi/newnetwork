import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video } from 'lucide-react';

export default function DIDLiveChat({ isOpen, onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Remove any existing script first
    const existingScript = document.querySelector('script[src="https://agent.d-id.com/v2/index.js"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Remove any existing widget
    const existingWidget = document.querySelector('did-agent');
    if (existingWidget) {
      existingWidget.remove();
    }

    // Wait a bit then load
    setTimeout(() => {
      if (!containerRef.current) return;

      // Create the widget element
      const widget = document.createElement('did-agent');
      widget.setAttribute('data-mode', 'embed');
      widget.setAttribute('data-client-key', 'Z29vZ2xlLW9hdXRoMnwxMDkwNTAwMjE4NjYwMDc1ODI0OTY6MUl4RzNNdzRLZkRXVGU3TDBfN3d3');
      widget.setAttribute('data-agent-id', 'v2_agt_pW1vqMCQ');
      
      // Add to container
      containerRef.current.appendChild(widget);

      // Load the script
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://agent.d-id.com/v2/index.js';
      document.head.appendChild(script);
    }, 100);

    return () => {
      // Cleanup
      const scriptEl = document.querySelector('script[src="https://agent.d-id.com/v2/index.js"]');
      if (scriptEl) {
        scriptEl.remove();
      }
      const widgetEl = document.querySelector('did-agent');
      if (widgetEl) {
        widgetEl.remove();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl border border-purple-500/30 h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">צ'אט חי עם דמות AI</h2>
                <p className="text-purple-100 text-sm">מופעל על ידי D-ID</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Widget Container */}
          <div 
            ref={containerRef} 
            className="flex-1 bg-black relative overflow-hidden"
            style={{ minHeight: '500px' }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}