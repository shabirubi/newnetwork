import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cloud, Loader2, Send, MessageCircle, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

export default function WeatherForecastModal({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(2);
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

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = inputMessage;
    
    setChatMessages(prev => [...prev, {
      text: userMessage,
      timestamp: new Date(),
      sender: 'user'
    }]);
    
    setInputMessage('');
    
    // Simulate weather AI response
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        text: 'התחזית לימים הקרובים מראה על מזג אוויר יציב עם טמפרטורות בטווח של 18-22 מעלות.',
        timestamp: new Date(),
        sender: 'weather',
        userName: 'תחזיתן הרשת'
      }]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const weatherAgentUrl = "https://studio.d-id.com/agents/share?id=v2_agt_cim3LvE9&utm_source=copy&key=WjI5dloyeGxMVzloZFhSb01ud3hNRGt3TlRBd01qRTROall3TURjMU9ESTBPVFk2TVVsNFJ6Tk5kelJMWmtSWFZHVTNUREJmTjNkMw==";

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
          className="bg-black rounded-3xl overflow-hidden w-full max-w-6xl shadow-2xl border-2 border-blue-500/30 h-[95vh] sm:h-[90vh] flex flex-col"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 100, 255, 0.3)'
          }}
        >
          {/* D-ID Style Header */}
          <div className="bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 p-4 flex items-center justify-between shrink-0">
            <div className="text-white font-bold text-sm">הרשת החדשה</div>
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-2">
                <Cloud className="w-5 h-5 text-white" />
                <div className="text-white font-bold">תחזיתן הרשת</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors border border-white/30"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Main Content - Avatar + Chat */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Avatar Section */}
            <div className="w-full md:w-1/2 relative bg-black">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-gray-950 z-20">
                  <div className="text-center">
                    <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg font-bold mb-2">מתחבר לתחזיתן...</p>
                    <p className="text-gray-400 text-sm">מכין שיחה חיה</p>
                  </div>
                </div>
              )}
              <div style={{ overflow: 'hidden', position: 'relative', width: '100%', height: '100%' }}>
                <iframe
                  ref={iframeRef}
                  src={weatherAgentUrl}
                  allow="microphone; camera; autoplay"
                  className="border-0 bg-black"
                  title="Weather Forecast Chat"
                  style={{
                    width: '100%',
                    height: '150%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: '-15%',
                    left: '0',
                    clipPath: 'inset(20% 0 40% 0)'
                  }}
                />
              </div>
            </div>

            {/* Chat Panel */}
            <div className="hidden md:flex md:w-1/2 bg-black border-l border-blue-500/30 flex-col backdrop-blur-xl">
              {/* Chat Header */}
              <div className="p-4 border-b border-blue-500/30 bg-black/80">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="w-5 h-5 text-blue-400" />
                  <h3 className="text-white font-bold text-sm">שיחה עם תחזיתן</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Users className="w-3.5 h-3.5" />
                  <span>{onlineUsers} משתמשים מחוברים</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <Cloud className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">התחל שיחה עם תחזיתן</p>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString('he-IL', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-blue-500/30 bg-black/80">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="שאל על מזג האוויר..."
                    className="flex-1 bg-blue-950/50 border border-blue-500/30 text-white placeholder:text-blue-300/50 focus:border-blue-500 rounded-xl"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* D-ID Style Footer */}
          <div className="bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 p-3 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <span className="text-white font-bold text-sm">תחזיה חיה</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}