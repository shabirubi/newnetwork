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
    'רבי ברק': "https://studio.d-id.com/agents/share?id=v2_agt_Wa8Oa2N-&key=WjI5dloyeGxMVzloZFhSb01ud3hNRGt3TlRBd01qRTROall3TURjMU9ESTBPVFk2TVVsNFJ6Tk5kelJMWmtSWFZHVTNUREJmTjNkMw==",
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
          className={`bg-black overflow-hidden flex flex-col ${
            isMobile ? 'w-full h-full rounded-none' : 'rounded-2xl border border-gray-800'
          }`}
          style={{
            width: isMobile ? '100%' : '1000px',
            height: isMobile ? '100%' : '550px',
            maxWidth: isMobile ? '100%' : '90vw',
            maxHeight: isMobile ? '100%' : '90vh',
            direction: 'rtl'
          }}
        >
          {/* Premium Branded Header */}
          <div className="relative bg-black p-3 border-b border-gray-800" style={{ direction: 'rtl' }}>
            <div className="relative flex items-center justify-between gap-4 w-full" style={{ direction: 'rtl' }}>
              <motion.img 
                src={LOGO_URL}
                alt="הרשת החדשה"
                className="h-10 sm:h-12 w-auto shrink-0"
              />
              <div className="text-center flex-1 px-2">
                <div className="text-white font-bold text-base sm:text-lg">{reporter.name}</div>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <Video className="w-3 h-3 text-red-500 animate-pulse" />
                  <span className="text-gray-400">שיחת וידאו חיה</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-900 hover:bg-gray-800 flex items-center justify-center transition-all shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Main Content - Avatar + Chat */}
          <div className="flex-1 flex overflow-hidden">
            {/* Avatar Section */}
            <div className="flex-1 relative">
              {/* Loading State */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
                  <div className="text-center">
                    <Loader2 className="w-16 sm:w-20 h-16 sm:h-20 text-white animate-spin mx-auto mb-4 sm:mb-6" />
                    <p className="text-white text-lg sm:text-xl font-bold mb-2">מתחבר ל{reporter.name}...</p>
                    <p className="text-gray-400 text-sm">מכין שיחת וידאו חיה</p>
                  </div>
                </div>
              )}

              {/* D-ID Agent Iframe */}
              <div className="absolute inset-0 overflow-hidden" style={{ paddingBottom: isMobile ? '60px' : '0' }}>
                <iframe
                  ref={iframeRef}
                  src={agentUrl}
                  allow="microphone; camera; autoplay"
                  className="w-full h-full border-0 bg-black"
                  style={{
                    transform: isMobile ? 'scale(1)' : 'scale(1.5)',
                    transformOrigin: 'top center'
                  }}
                  title={`${reporter.name} Live Chat`}
                />
              </div>
            </div>

            {/* Chat Panel - Desktop */}
            {!isMobile && (
              <div className="w-80 sm:w-96 bg-black border-l border-gray-800 flex flex-col absolute left-0 top-0 bottom-0">
...
...
            </div>
            )}

            {/* Chat Panel - Mobile (Bottom) */}
            {isMobile && (
              <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-[999999] pb-safe">
                <div className="p-3 bg-black">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="שאל שאלה..."
                      className="flex-1 bg-gray-900 border border-gray-800 text-white placeholder:text-gray-500 focus:border-gray-700 rounded-lg text-sm h-11 px-4"
                    />

                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg border border-gray-800 h-11 w-11 p-0 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Premium Footer - Hidden on Mobile */}
          {!isMobile && (
            <div className="bg-black p-3 border-t border-gray-800">
              <div className="flex items-center justify-center gap-3 text-sm">
                <motion.img 
                  src={LOGO_URL}
                  alt="הרשת החדשה"
                  className="h-6 w-auto"
                />
                <span className="text-white font-bold">הרשת החדשה</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400 text-xs">Powered by Digital Dreams</span>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}