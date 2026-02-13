import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Send, Mic, Video, MessageCircle, Paperclip, FileText, Image as ImageIcon, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

export default function ReporterLiveChat({ isOpen, onClose, reporter }) {
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(3);
  const messagesEndRef = useRef(null);
  const iframeRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(false);
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
      sender: 'user',
      userName: 'אתה'
    }]);
    
    setInputMessage('');
    
    // קריאה לאגנט AI לקבל תשובה מהכתבת
    try {
      const response = await base44.functions.invoke('reporterAIChat', {
        reporterId: reporter.id || reporter.name,
        reporterName: reporter.name,
        message: userMessage
      });
      
      if (response.data?.response) {
        setChatMessages(prev => [...prev, {
          text: response.data.response,
          timestamp: new Date(),
          sender: 'reporter',
          userName: reporter.name
        }]);
      }
    } catch (error) {
      console.error('Error getting reporter response:', error);
      setChatMessages(prev => [...prev, {
        text: 'מצטער, יש לי בעיה טכנית כרגע. נסה שוב בעוד רגע.',
        timestamp: new Date(),
        sender: 'reporter',
        userName: reporter.name
      }]);
    }
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
        const formData = new FormData();
        formData.append('file', file);
        
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

  if (!isOpen || !reporter) return null;

  const reporterAgents = {
    'עדי': "https://studio.d-id.com/agents/share?id=v2_agt_DMY3wZsg&key=WjI5dloyeGxMVzloZFhSb01ud3hNRGt3TlRBd01qRTROall3TURjMU9ESTBPVFk2TVVsNFJ6Tk5kelJMWmtSWFZHVTNUREJmTjNkMw==",
    'רון כהן': "https://studio.d-id.com/agents/share?id=v2_agt_vpw--KK0&key=WjI5dloyeGxMVzloZFhSb01ud3hNRGt3TlRBd01qRTROall3TURjMU9ESTBPVFk2TVVsNFJ6Tk5kelJMWmtSWFZHVTNUREJmTjNkMw==",
    'רבי ברק': "https://studio.d-id.com/agents/share?id=v2_agt_Wa8Oa2N-&utm_source=copy&key=WjI5dloyeGxMVzloZFhSb01ud3hNRGt3TlRBd01qRTROall3TURjMU9ESTBPVFk2TVVsNFJ6Tk5kelJMWmtSWFZHVTNUREJmTjNkMw==",
  };

  const agentUrl = reporterAgents[reporter.name] || reporterAgents['עדי'];

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: isMobile ? '100%' : 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: isMobile ? '100%' : 20 }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-black overflow-hidden flex flex-col shadow-2xl ${
            isMobile ? 'w-full h-full rounded-none' : 'rounded-3xl border-2 border-blue-500/30'
          }`}
          style={{
            width: isMobile ? '100%' : '1000px',
            height: isMobile ? '100%' : '550px',
            maxWidth: isMobile ? '100%' : '90vw',
            maxHeight: isMobile ? '100%' : '90vh',
            direction: 'rtl',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 255, 0.3)'
          }}
        >
          {/* D-ID Style Header */}
          <div className="relative bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 p-4 backdrop-blur-xl" style={{ direction: 'rtl' }}>
            <div className="relative flex items-center justify-between gap-4 w-full" style={{ direction: 'rtl' }}>
              <div className="flex items-center gap-2 flex-1">
                <div className="text-white font-bold text-sm">הרשת החדשה</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-white font-bold text-base">{reporter.name}</div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center transition-all shrink-0 backdrop-blur-sm"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Main Content - Avatar + Chat */}
          <div className="flex-1 flex overflow-hidden">
            {/* Avatar Section */}
            <div className={`relative bg-black ${isMobile ? 'w-full' : 'w-1/2'}`}>
              {/* Loading State */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-gray-950 z-20">
                  <div className="text-center">
                    <div className="relative">
                      <div className="absolute inset-0 blur-2xl bg-white/10 rounded-full"></div>
                      <Loader2 className="w-16 sm:w-20 h-16 sm:h-20 text-white animate-spin mx-auto mb-4 sm:mb-6 relative" />
                    </div>
                    <p className="text-white text-lg sm:text-xl font-bold mb-2">מתחבר ל{reporter.name}...</p>
                    <p className="text-gray-400 text-sm">מכין שיחת וידאו חיה</p>
                  </div>
                </div>
              )}

              {/* D-ID Agent Iframe - Cropped Head & Shoulders */}
                <div className="w-full h-full bg-black flex items-center justify-center" style={{ overflow: 'hidden', position: 'relative' }}>
                  <iframe
                    ref={iframeRef}
                    src={agentUrl}
                    allow="microphone; camera; autoplay"
                    className="border-0 bg-black"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      position: 'absolute',
                      top: '-10%',
                      left: '0',
                      transform: 'scale(1.2)',
                      transformOrigin: 'top center',
                      clipPath: 'inset(15% 0 35% 0)'
                    }}
                    title={`${reporter.name} Live Chat`}
                  />
                </div>
            </div>

            {/* Chat Panel - Desktop */}
            {!isMobile && (
              <div className="w-1/2 bg-black border-l border-blue-500/30 flex flex-col backdrop-blur-xl">
                {/* Chat Header */}
                <div className="p-4 border-b border-blue-500/30 bg-black/80">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white font-bold text-sm">שיחה עם {reporter.name}</h3>
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
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">התחל שיחה עם {reporter.name}</p>
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
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="שאל שאלה..."
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-blue-950/50 border-blue-500/30 text-blue-300 hover:bg-blue-900/50 rounded-lg"
                      disabled
                    >
                      <Mic className="w-4 h-4 mr-1" />
                      הקלטה קולית
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-blue-950/50 border-blue-500/30 text-blue-300 hover:bg-blue-900/50 rounded-lg"
                      disabled
                    >
                      <Video className="w-4 h-4 mr-1" />
                      וידאו
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Panel - Mobile (Bottom) */}
            {isMobile && (
              <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-950 via-black to-transparent border-t-2 border-gray-800/50 z-[99999999] backdrop-blur-2xl" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
                <div className="p-4 space-y-3">
                  {/* Main Input Row */}
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="שאל את רבי ברק..."
                      className="flex-1 bg-gray-900/95 border-2 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500 rounded-xl text-base h-14 px-4 backdrop-blur-sm shadow-2xl"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-14 w-14 p-0 disabled:opacity-50 shadow-2xl"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-gray-900/80 border-2 border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl h-12 backdrop-blur-sm shadow-xl"
                      disabled
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      הקלטה קולית
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-gray-900/80 border-2 border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl h-12 backdrop-blur-sm shadow-xl"
                      disabled
                    >
                      <Video className="w-5 h-5 mr-2" />
                      שיחת וידאו
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Premium Footer - Hidden on Mobile */}
          {!isMobile && (
            <div className="bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 p-3 backdrop-blur-xl">
              <div className="flex items-center justify-center gap-3 text-sm">
                <span className="text-white font-bold">צ'אט חי עם {reporter.name}</span>
                <span className="text-white/80">•</span>
                <span className="text-white/80 text-xs">Powered by D-ID</span>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}