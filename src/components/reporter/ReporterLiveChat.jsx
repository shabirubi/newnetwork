import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Send, Mic, Video, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

export default function ReporterLiveChat({ isOpen, onClose, reporter }) {
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    setChatMessages(prev => [...prev, {
      text: inputMessage,
      timestamp: new Date(),
      sender: 'user'
    }]);
    
    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen || !reporter) return null;

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
        className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl overflow-hidden w-full max-w-7xl shadow-2xl border-4 border-[#0080FF]/60 h-[95vh] flex flex-col"
          style={{
            boxShadow: '0 0 80px rgba(0, 128, 255, 0.6), inset 0 0 40px rgba(0, 128, 255, 0.1)'
          }}
        >
          {/* Premium Branded Header */}
          <div className="relative bg-gradient-to-r from-black via-[#0080FF]/30 to-black p-3 sm:p-5 border-b-4 border-[#0080FF]/50 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0080FF]/20 to-transparent animate-pulse"></div>
            <div className="relative flex items-center justify-between">
              <motion.img 
                src={LOGO_URL}
                alt="הרשת החדשה"
                className="h-10 sm:h-14 w-auto drop-shadow-2xl"
                animate={{ 
                  scale: [1, 1.08, 1],
                  filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)']
                }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="text-center flex-1 px-2 sm:px-6">
                <div className="text-white font-bold text-xl sm:text-2xl drop-shadow-lg mb-1">{reporter.name}</div>
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm">
                  <Video className="w-4 h-4 text-[#0080FF] animate-pulse" />
                  <span className="text-[#0080FF] font-bold">שיחת וידאו חיה</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-red-500/30 to-red-600/30 hover:from-red-500/50 hover:to-red-600/50 flex items-center justify-center transition-all border-2 border-red-500/50 shadow-lg shadow-red-500/30"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg" />
              </button>
            </div>
          </div>

          {/* Main Content - Avatar + Chat */}
          <div className="flex-1 flex overflow-hidden">
            {/* Avatar Section - Focused & Branded */}
            <div className="flex-1 relative">
              {/* Avatar Label Top Left */}
              <div className="absolute top-8 left-8 z-10 bg-gradient-to-r from-[#0080FF] to-[#0066FF] px-6 py-2 rounded-full border-2 border-white/20 shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <span className="text-white font-bold text-sm">ON AIR</span>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black z-20">
                  <div className="text-center">
                    <Loader2 className="w-20 h-20 text-[#0080FF] animate-spin mx-auto mb-6" />
                    <p className="text-white text-xl font-bold mb-2">מתחבר ל{reporter.name}...</p>
                    <p className="text-[#0080FF] text-sm">מכין שיחת וידאו חיה</p>
                  </div>
                </div>
              )}

              {/* D-ID Agent Iframe */}
              <iframe
                ref={iframeRef}
                src={agentUrl}
                allow="microphone; camera; autoplay"
                className="w-full h-full border-0 bg-black"
                title={`${reporter.name} Live Chat`}
              />

              {/* Branding Overlay Bottom */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#0080FF]/50">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white font-bold">{reporter.name}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-[#0080FF]">הרשת החדשה</span>
                </div>
              </div>
            </div>

            {/* Chat Panel - Side */}
            <div className="w-80 sm:w-96 bg-gradient-to-b from-gray-900 via-black to-gray-900 border-r-4 border-[#0080FF]/30 flex flex-col">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-[#0080FF]/20 to-transparent p-4 border-b-2 border-[#0080FF]/30">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-5 h-5 text-[#0080FF]" />
                  <span className="text-white font-bold">צ'אט עם {reporter.name}</span>
                </div>
                <p className="text-gray-400 text-xs">שלח הודעות והאווטר יקרא אותן בקול</p>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-12">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">התחל שיחה עם {reporter.name}</p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-br from-[#0080FF] to-[#0066FF] text-white shadow-lg shadow-[#0080FF]/30'
                            : 'bg-gray-800 text-gray-100 border border-gray-700'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {msg.timestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-gradient-to-t from-black to-transparent border-t-2 border-[#0080FF]/30">
                <div className="flex gap-2 mb-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-gray-900 border-[#0080FF]/30 hover:bg-[#0080FF]/20 text-white rounded-xl"
                    title="הקלטה קולית"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-gray-900 border-[#0080FF]/30 hover:bg-[#0080FF]/20 text-white rounded-xl"
                    title="אמוג'י"
                  >
                    😊
                  </Button>
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="הקלד הודעה..."
                    className="flex-1 bg-gray-900 border-[#0080FF]/30 text-white placeholder:text-gray-500 focus:border-[#0080FF] rounded-xl"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="bg-gradient-to-r from-[#0080FF] to-[#0066FF] hover:from-[#0066FF] hover:to-[#0080FF] text-white rounded-xl shadow-lg shadow-[#0080FF]/30 px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center">ההודעות נשלחות לאווטר בזמן אמת</p>
              </div>
            </div>
          </div>

          {/* Premium Footer */}
          <div className="relative bg-gradient-to-r from-black via-[#0080FF]/20 to-black p-3 border-t-4 border-[#0080FF]/50 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0080FF]/10 to-transparent"></div>
            <div className="relative flex items-center justify-center gap-3 text-sm">
              <motion.img 
                src={LOGO_URL}
                alt="הרשת החדשה"
                className="h-6 w-auto"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-[#0080FF] font-bold">הרשת החדשה</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400 text-xs">Powered by Digital Dreams</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}