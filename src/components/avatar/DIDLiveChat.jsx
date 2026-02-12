import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import * as sdk from '@d-id/client-sdk';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

export default function DIDLiveChat({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const videoRef = useRef(null);
  const agentManagerRef = useRef(null);
  const srcObjectRef = useRef(null);

  useEffect(() => {
    if (isOpen && !agentManagerRef.current) {
      initializeAgent();
    }
    return () => {
      if (agentManagerRef.current && isOpen) {
        agentManagerRef.current.disconnect();
      }
    };
  }, [isOpen]);

  const initializeAgent = async () => {
    try {
      setIsLoading(true);

      // Fetch secrets from backend
      const agentId = 'agt_pW1vqMCQ';
      const clientKey = 'Z295b2xlLWF1dGgwfDEwOTUwMDIxODY2MDc1ODI0OTY6MUl4RzNNdzRLZkRXVGU3TDBfN3c3';

      const auth = { type: 'key', clientKey };

      const callbacks = {
        onSrcObjectReady: (value) => {
          if (videoRef.current) {
            videoRef.current.srcObject = value;
            srcObjectRef.current = value;
          }
        },
        onVideoStateChange: (state) => {
          console.log('Video state:', state);
          setIsSpeaking(state !== 'STOP');
          if (state === 'STOP' && videoRef.current && agentManagerRef.current?.agent) {
            videoRef.current.srcObject = undefined;
            videoRef.current.src = agentManagerRef.current.agent.presenter?.idle_video || '';
          } else if (state === 'PLAY' && videoRef.current) {
            videoRef.current.src = '';
            videoRef.current.srcObject = srcObjectRef.current;
          }
        },
        onConnectionStateChange: (state) => {
          console.log('Connection state:', state);
          setIsConnected(state === 'connected');
          if (state === 'connected') {
            setIsLoading(false);
          }
        },
        onNewMessage: (messages, type) => {
          console.log('New message:', messages, type);
        }
      };

      const streamOptions = {
        compatibilityMode: 'auto',
        streamWarmup: true
      };

      agentManagerRef.current = await sdk.createAgentManager(agentId, {
        auth,
        callbacks,
        streamOptions
      });

      await agentManagerRef.current.connect();
    } catch (error) {
      console.error('Failed to initialize agent:', error);
      toast.error('שגיאה בטעינת האגנט');
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !agentManagerRef.current || !isConnected) return;

    try {
      await agentManagerRef.current.chat(message);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('שגיאה בשליחת הודעה');
    }
  };

  useEffect(() => {
    const handleOpen = () => {
      onClose();
      setTimeout(() => {
        const event = new CustomEvent('openDidChat');
        window.dispatchEvent(event);
      }, 100);
    };
    window.addEventListener('openDidChat', handleOpen);
    return () => window.removeEventListener('openDidChat', handleOpen);
  }, []);

  if (!isOpen) return null;

  // Mobile drawer for native feel
  const MobileDrawer = () => (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-0 z-[9999] bg-black flex flex-col lg:hidden"
      >
        {/* Header */}
        <div className="bg-black/80 backdrop-blur-sm p-3 flex items-center justify-between shrink-0 border-b border-[#E31E24]/30">
          <div className="flex-1 text-right">
            <div className="text-white font-bold text-base">הרשת החדשה</div>
            <div className="text-[#E31E24] font-bold text-xs">צ'אט חי</div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#E31E24]/20 hover:bg-[#E31E24]/40 flex items-center justify-center transition-colors border border-[#E31E24]/30 ml-3"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Video */}
        <div className="flex-1 bg-black/90 relative overflow-hidden flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-[#E31E24] animate-spin mx-auto mb-2" />
                <p className="text-white text-xs">טוען אווטר...</p>
              </div>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
          {isConnected && !isLoading && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-green-500/30 backdrop-blur-sm px-2.5 py-1 rounded-full border border-green-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-green-300 font-bold text-[10px]">מחובר</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-black/80 backdrop-blur-sm p-3 border-t border-[#E31E24]/30 flex items-center gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="שלח..."
            disabled={!isConnected || isSpeaking}
            className="flex-1 bg-gray-900/70 border-[#E31E24]/30 text-white placeholder:text-gray-500 text-sm h-9"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || !isConnected || isSpeaking}
            className="bg-[#E31E24] hover:bg-[#B91C1C] text-white h-9 px-3"
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  // Desktop modal
  const DesktopModal = () => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm lg:flex lg:items-center lg:justify-center lg:p-4 hidden"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-black rounded-2xl overflow-hidden w-full max-w-6xl shadow-2xl border border-[#E31E24]/30 h-[90vh] flex flex-col"
        >
          {/* Branded Header */}
          <div className="bg-black/80 backdrop-blur-sm p-4 flex items-center justify-between shrink-0 border-b border-[#E31E24]/30"
            style={{
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)'
            }}
          >
            <div className="flex-1 text-right">
              <div className="text-white font-bold text-lg">הרשת החדשה</div>
              <div className="text-[#E31E24] font-bold text-xs">
                {isLoading ? 'טוען אווטר...' : 'צ\'אט חי'}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#E31E24]/20 hover:bg-[#E31E24]/40 flex items-center justify-center transition-colors border border-[#E31E24]/30 ml-4"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* D-ID Agent Video */}
          <div className="flex-1 bg-black/90 relative overflow-hidden flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-[#E31E24] animate-spin mx-auto mb-4" />
                  <p className="text-white text-sm">טוען אווטר...</p>
                </div>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
              style={{ 
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            />
            {isConnected && !isLoading && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-500/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-green-500/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-green-300 font-bold text-xs">מחובר</span>
              </div>
            )}
          </div>

          {/* Chat Input Footer */}
          <div className="bg-black/80 backdrop-blur-sm p-4 border-t border-[#E31E24]/30"
            style={{
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.8)'
            }}
          >
            <div className="flex items-center gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="שלח הודעה..."
                disabled={!isConnected || isSpeaking}
                className="flex-1 bg-gray-900/70 border-[#E31E24]/30 text-white placeholder:text-gray-500 text-sm"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || !isConnected || isSpeaking}
                className="bg-[#E31E24] hover:bg-[#B91C1C] text-white"
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return isOpen ? (
    <>
      <MobileDrawer />
      <DesktopModal />
    </>
  ) : null;
}