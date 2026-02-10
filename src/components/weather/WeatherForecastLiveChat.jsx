import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Send, Mic, Video, MessageCircle, Paperclip, FileText, Image as ImageIcon, Users, Cloud } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

export default function WeatherForecastLiveChat({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(5);
  const messagesEndRef = useRef(null);
  const iframeRef = useRef(null);
  const fileInputRef = useRef(null);

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
      sender: 'user',
      userName: 'אתה'
    }]);
    
    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const response = await base44.integrations.Core.UploadFile({ file });
        
        return {
          name: file.name,
          url: response.file_url,
          type: file.type,
          size: file.size
        };
      });

      const uploaded = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...uploaded]);
      
      setChatMessages(prev => [...prev, {
        text: `העלה ${uploaded.length} קבצים`,
        files: uploaded,
        timestamp: new Date(),
        sender: 'user'
      }]);

      toast.success(`${uploaded.length} קבצים הועלו בהצלחה`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('שגיאה בהעלאת קבצים');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Simulate other users joining
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setOnlineUsers(prev => Math.max(1, prev + Math.floor(Math.random() * 3 - 1)));
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Weather Forecast Agent URL from user's D-ID studio
  const weatherAgentUrl = "https://studio.d-id.com/agents/share?id=v2_agt_cim3LvE9&utm_source=copy&key=WjI5dloyeGxMVzloZFhSb01ud3hNRGt3TlRBd01qRTROall3TURjMU9ESTBPVFk2TVVsNFJ6Tk5kelJMWmtSWFZHVTNUREJmTjNkMw==";

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
          className="bg-gradient-to-br from-[#001a4d] via-[#003d99] to-[#001a4d] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#0080FF]/60 flex flex-col"
          style={{
            width: '1000px',
            height: '550px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            boxShadow: '0 0 80px rgba(0, 128, 255, 0.6), inset 0 0 60px rgba(0, 128, 255, 0.1)',
            direction: 'rtl'
          }}
        >
          {/* Premium Branded Header */}
          <div className="relative bg-gradient-to-r from-[#0066FF] via-[#0080FF]/90 to-[#0066FF] p-3 sm:p-5 border-b-4 border-[#0080FF]/80 shadow-xl shadow-[#0080FF]/40" style={{ direction: 'rtl' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
            <div className="relative flex items-center justify-between gap-4 w-full" style={{ direction: 'rtl' }}>
              <motion.img 
                src={LOGO_URL}
                alt="הרשת החדשה"
                className="h-10 sm:h-14 w-auto drop-shadow-2xl shrink-0"
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
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Cloud className="w-6 h-6 text-white drop-shadow-lg" />
                  <div className="text-white font-bold text-xl sm:text-2xl drop-shadow-lg">תחזיתן הרשת</div>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm">
                  <Video className="w-4 h-4 text-white animate-pulse" />
                  <span className="text-white font-bold">תחזיית מזג אוויר חיה</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-red-500/30 to-red-600/30 hover:from-red-500/50 hover:to-red-600/50 flex items-center justify-center transition-all border-2 border-red-500/50 shadow-lg shadow-red-500/30 shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg" />
              </button>
            </div>
          </div>

          {/* Main Content - Avatar + Chat */}
          <div className="flex-1 flex overflow-hidden">
            {/* Avatar Section - Focused & Branded */}
            <div className="flex-1 relative bg-gradient-to-br from-[#001a4d] via-[#0033CC] to-[#0066FF]">
              {/* Avatar Label Top Left */}
              <div className="absolute top-8 left-8 z-10 bg-gradient-to-r from-[#0080FF] to-[#00D4FF] px-6 py-2 rounded-full border-2 border-white/30 shadow-xl">
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
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#001a4d] via-[#003d99] to-[#001a4d] z-20">
                  <div className="text-center">
                    <Loader2 className="w-20 h-20 text-[#0080FF] animate-spin mx-auto mb-6" />
                    <p className="text-white text-xl font-bold mb-2">מתחבר לתחזיתן...</p>
                    <p className="text-[#00D4FF] text-sm">מכין תחזיית מזג אוויר חיה</p>
                  </div>
                </div>
              )}

              {/* D-ID Agent Iframe */}
              <iframe
                ref={iframeRef}
                src={weatherAgentUrl}
                allow="microphone; camera; autoplay"
                className="w-full h-full border-0"
                title="Weather Forecast Live Chat"
              />
            </div>

            {/* Chat Panel - Side */}
            <div className="w-80 sm:w-96 bg-gradient-to-b from-[#001a4d] via-[#0033CC] to-[#001a4d] border-r-4 border-[#0080FF]/40 flex flex-col">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-[#0080FF]/30 to-transparent p-4 border-b-2 border-[#0080FF]/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#00D4FF]" />
                    <span className="text-white font-bold">צ'אט חיה</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs bg-[#0080FF]/40 px-2 py-1 rounded-full border border-[#0080FF]/60">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                    </span>
                    <span className="text-white font-bold">{onlineUsers} צופים</span>
                  </div>
                </div>
                <p className="text-[#00D4FF] text-xs">שאלו שאלות על מזג האוויר</p>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-400 mt-12">
                    <Cloud className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">היה הראשון להגיב</p>
                    <p className="text-xs mt-2">שאל שאלות על התחזיה</p>
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
                            ? 'bg-gradient-to-br from-[#0080FF] to-[#0066FF] text-white shadow-lg shadow-[#0080FF]/40'
                            : 'bg-[#0033CC]/60 text-gray-100 border border-[#0080FF]/40'
                        }`}
                      >
                        {msg.userName && (
                          <p className="text-xs font-bold mb-1 opacity-80">{msg.userName}</p>
                        )}
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        
                        {/* Display uploaded files */}
                        {msg.files && msg.files.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {msg.files.map((file, fileIdx) => (
                              <div key={fileIdx} className="flex items-center gap-2 text-xs bg-black/30 rounded-lg p-2">
                                {file.type.startsWith('image/') ? (
                                  <ImageIcon className="w-4 h-4" />
                                ) : (
                                  <FileText className="w-4 h-4" />
                                )}
                                <span className="flex-1 truncate">{file.name}</span>
                                <span className="text-xs opacity-60">{(file.size / 1024).toFixed(1)}KB</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
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
              <div className="p-4 bg-gradient-to-t from-[#001a4d] to-transparent border-t-2 border-[#0080FF]/40">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {/* Action Buttons Row */}
                <div className="flex gap-2 mb-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-[#0033CC] border-[#0080FF]/40 hover:bg-[#0080FF]/30 text-white rounded-xl"
                    title="העלה קבצים"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Paperclip className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-[#0033CC] border-[#0080FF]/40 hover:bg-[#0080FF]/30 text-white rounded-xl"
                    title="הקלטה קולית"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-[#0033CC] border-[#0080FF]/40 hover:bg-[#0080FF]/30 text-white rounded-xl"
                    title="אמוג'י"
                  >
                    ☀️
                  </Button>
                  
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="שאל שאלה..."
                    className="flex-1 bg-[#0033CC] border-[#0080FF]/40 text-white placeholder:text-gray-400 focus:border-[#0080FF] rounded-xl"
                  />
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="bg-gradient-to-r from-[#0080FF] to-[#00D4FF] hover:from-[#00D4FF] hover:to-[#0080FF] text-white rounded-xl shadow-lg shadow-[#0080FF]/50 px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Status Messages */}
                {uploadedFiles.length > 0 && (
                  <div className="text-xs text-[#00D4FF] text-center mb-2">
                    {uploadedFiles.length} קבצים הועלו
                  </div>
                )}
                
                <p className="text-xs text-gray-400 text-center">שוחח עם {onlineUsers} צופים מחוברים</p>
              </div>
            </div>
          </div>

          {/* Premium Footer */}
          <div className="relative bg-gradient-to-r from-[#0066FF] via-[#0080FF]/80 to-[#0066FF] p-3 border-t-4 border-[#00D4FF]/60 shadow-lg shadow-[#0080FF]/40">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
            <div className="relative flex items-center justify-center gap-3 text-sm">
              <Cloud className="w-5 h-5 text-white" />
              <span className="text-white font-bold">הרשת החדשה - תחזיות</span>
              <span className="text-white/60">•</span>
              <span className="text-white/80 text-xs">שידור חי מהשירות המטאורולוגי</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}