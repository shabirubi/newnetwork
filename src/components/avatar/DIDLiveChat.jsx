import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DIDLiveChat({ isOpen, onClose }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    let scriptLoaded = false;

    const initDID = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get D-ID config from backend
        const response = await base44.functions.invoke('getDIDConfig');
        const { agentId, clientKey } = response.data;

        if (!agentId || !clientKey) {
          throw new Error('Missing D-ID configuration');
        }

        // Remove existing scripts and widgets
        const existingScripts = document.querySelectorAll('script[src*="agent.d-id.com"]');
        existingScripts.forEach(s => s.remove());
        const existingWidgets = document.querySelectorAll('did-agent');
        existingWidgets.forEach(w => w.remove());

        // Load D-ID script
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://agent.d-id.com/v2/index.js';
        
        script.onload = () => {
          scriptLoaded = true;
          if (containerRef.current) {
            // Create the D-ID widget
            const widgetHTML = `
              <did-agent 
                data-mode="embed" 
                data-client-key="${clientKey}"
                data-agent-id="${agentId}">
              </did-agent>
            `;
            containerRef.current.innerHTML = widgetHTML;
            setLoading(false);
          }
        };

        script.onerror = () => {
          setError('Failed to load D-ID script');
          setLoading(false);
        };

        document.head.appendChild(script);

      } catch (err) {
        console.error('D-ID init error:', err);
        setError(err.message);
        setLoading(false);
        toast.error('שגיאה בטעינת D-ID');
      }
    };

    initDID();

    return () => {
      // Cleanup
      const scripts = document.querySelectorAll('script[src*="agent.d-id.com"]');
      scripts.forEach(s => s.remove());
      const widgets = document.querySelectorAll('did-agent');
      widgets.forEach(w => w.remove());
    };
  }, [isOpen]);

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
          className="bg-black rounded-2xl overflow-hidden w-full max-w-5xl shadow-2xl border border-purple-500/50 h-[85vh] flex flex-col"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">צ'אט חי עם דמות AI</h2>
                <p className="text-purple-100 text-sm">D-ID Agent</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex-1 bg-black relative overflow-hidden flex items-center justify-center">
            {loading && (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
                <p className="text-white">טוען D-ID Agent...</p>
              </div>
            )}
            {error && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-red-400">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  נסה שוב
                </button>
              </div>
            )}
            <div 
              ref={containerRef} 
              className={`w-full h-full ${loading || error ? 'hidden' : ''}`}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}