import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Send, Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import * as did from '@d-id/client-sdk';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

export default function ReporterLiveChat({ isOpen, onClose, reporter }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const videoRef = useRef(null);
  const agentRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Map reporters to their specific D-ID agent IDs
  const reporterAgentIds = {
    'עדי': 'v2_agt_DMY3wZsg',
    'רון כהן': 'v2_agt_vpw--KK0',
  };

  const agentId = reporterAgentIds[reporter?.name] || reporterAgentIds['עדי'];

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize D-ID Agent
  useEffect(() => {
    if (!isOpen || !reporter) return;

    let agent = null;

    const initAgent = async () => {
      try {
        setIsConnecting(true);
        setIsLoading(true);

        const auth = { 
          type: 'key', 
          clientKey: 'WjI5dloyeGxMVzloZFhSb01ud3hNRGt3TlRBd01qRTROall3TURjMU9ESTBPVFk2TVVsNFJ6Tk5kelJMWmtSWFZHVTNUREJmTjNkMw==' 
        };

        const callbacks = {
          onSrcObjectReady: (srcObject) => {
            if (videoRef.current) {
              videoRef.current.srcObject = srcObject;
            }
            setIsLoading(false);
          },
          onConnectionStateChange: (state) => {
            console.log('Connection state:', state);
            setConnectionState(state);
            if (state === 'connected') {
              setIsConnecting(false);
              toast.success(`התחברת ל${reporter.name}!`);
            }
          },
          onNewMessage: (msgs, type) => {
            console.log('New messages:', msgs, type);
            if (type === 'agent') {
              setMessages(prev => [...prev, { 
                type: 'agent', 
                text: msgs[msgs.length - 1]?.content || '',
                timestamp: new Date()
              }]);
            }
          }
        };

        agent = await did.createAgentManager(agentId, { auth, callbacks });
        agentRef.current = agent;

        await agent.connect();
        
      } catch (error) {
        console.error('Failed to initialize agent:', error);
        toast.error('שגיאה בהתחברות לאגנט');
        setIsLoading(false);
        setIsConnecting(false);
      }
    };

    initAgent();

    return () => {
      if (agent) {
        agent.disconnect().catch(console.error);
      }
    };
  }, [isOpen, reporter, agentId]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !agentRef.current || isSending) return;

    try {
      setIsSending(true);
      const userMsg = inputMessage.trim();
      
      setMessages(prev => [...prev, { 
        type: 'user', 
        text: userMsg,
        timestamp: new Date()
      }]);
      
      setInputMessage('');
      
      await agentRef.current.chat(userMsg);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('שגיאה בשליחת הודעה');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen || !reporter) return null;

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
          className="bg-black rounded-2xl overflow-hidden w-full max-w-6xl shadow-2xl border-2 border-[#0080FF]/50 h-[90vh] flex flex-col"
          style={{
            boxShadow: '0 0 60px rgba(0, 128, 255, 0.5)'
          }}
        >
          {/* Branded Header */}
          <div className="bg-gradient-to-r from-black via-[#0080FF]/20 to-black p-4 flex items-center justify-between shrink-0 border-b-2 border-[#0080FF]/50">
            <motion.img 
              src={LOGO_URL}
              alt="הרשת החדשה"
              className="h-12 w-auto drop-shadow-2xl"
              animate={{ 
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="text-center flex-1 px-4">
              <div className="text-white font-bold text-xl drop-shadow-lg">{reporter.name}</div>
              <div className="text-[#0080FF] font-bold text-sm flex items-center justify-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0080FF] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0080FF]"></span>
                </span>
                {connectionState === 'connected' ? 'מחובר' : isConnecting ? 'מתחבר...' : 'ממתין'}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center transition-colors border-2 border-red-500/50"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Video Area - Large Avatar */}
            <div className="flex-1 bg-black relative flex items-center justify-center">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                  <div className="text-center">
                    <Loader2 className="w-16 h-16 text-[#0080FF] animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg">מתחבר ל{reporter.name}...</p>
                  </div>
                </div>
              )}
              
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            {/* Chat Area - Side Panel */}
            <div className="w-96 bg-gradient-to-b from-gray-900 to-black border-r-2 border-[#0080FF]/30 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 mt-8">
                    <p className="mb-2">👋 שלום!</p>
                    <p className="text-sm">שלח הודעה כדי להתחיל שיחה</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          msg.type === 'user'
                            ? 'bg-[#0080FF] text-white'
                            : 'bg-gray-800 text-gray-100 border border-[#0080FF]/30'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t-2 border-[#0080FF]/30 bg-black">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="הקלד הודעה..."
                    disabled={connectionState !== 'connected' || isSending}
                    className="flex-1 bg-gray-900 border-[#0080FF]/30 text-white placeholder:text-gray-500 focus:border-[#0080FF]"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || connectionState !== 'connected' || isSending}
                    className="bg-[#0080FF] hover:bg-[#0066FF] text-white"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Branded Footer */}
          <div className="bg-gradient-to-r from-black via-[#0080FF]/20 to-black p-3 border-t-2 border-[#0080FF]/50 flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#0080FF] font-bold">הרשת החדשה</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">Powered by D-ID AI</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}