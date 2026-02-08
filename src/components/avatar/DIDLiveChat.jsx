import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video } from 'lucide-react';

export default function DIDLiveChat({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    // Remove any existing agent
    const existingWidget = document.querySelector('did-agent');
    if (existingWidget) {
      existingWidget.remove();
    }

    // Load D-ID agent script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://agent.d-id.com/v2/index.js';
    script.setAttribute('data-mode', 'fabio');
    script.setAttribute('data-client-key', 'Z29vZ2xlLW9hdXRoMnwxMDkwNTAwMjE4NjYwMDc1ODI0OTY6MUl4RzNNdzRLZkRXVGU3TDBfN3d3');
    script.setAttribute('data-agent-id', 'v2_agt_pW1vqMCQ');
    script.setAttribute('data-name', 'did-agent');
    script.setAttribute('data-monitor', 'false');
    
    document.body.appendChild(script);

    // Wait for script to load and trigger the agent
    script.onload = () => {
      setTimeout(() => {
        const agent = document.querySelector('did-agent');
        if (agent) {
          agent.style.zIndex = '10000';
        }
      }, 500);
    };

    return () => {
      // Cleanup when closing
      const scriptToRemove = document.querySelector('script[src="https://agent.d-id.com/v2/index.js"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
      const widgetToRemove = document.querySelector('did-agent');
      if (widgetToRemove) {
        widgetToRemove.remove();
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
                <p className="text-purple-100 text-sm">סגור את המודל - הצ'אט יופיע בצד</p>
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
          <div className="p-6 bg-black">
            <div className="text-center text-gray-300 space-y-4">
              <Video className="w-20 h-20 mx-auto text-purple-400 animate-pulse" />
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">צ'אט D-ID פעיל!</h3>
                <p className="text-lg">סגור את החלון הזה כדי לראות את הצ'אט</p>
                <p className="text-sm text-gray-400">הצ'אט יופיע בפינה השמאלית של המסך</p>
              </div>
              <button
                onClick={onClose}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg"
              >
                סגור והתחל לדבר
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}