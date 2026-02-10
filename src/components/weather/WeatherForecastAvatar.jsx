import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

export default function WeatherForecastAvatar() {
  const messagesEndRef = useRef(null);
  const iframeRef = useRef(null);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'reporter', name: 'כתב תחזוקה', text: 'שלום! אני כאן לעדכן אתכם על תחזיית מזג האוויר החדשה', timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: reporters = [] } = useQuery({
    queryKey: ['reporters-weather'],
    queryFn: async () => {
      return await base44.entities.Reporter.list('name');
    },
    initialData: []
  });

  const weatherAgentUrl = "https://studio.d-id.com/agents/share?id=v2_agt_cim3LvE9&utm_source=copy&key=WjI5dloyeGxMVzloZFhSb01ud3hNRGt3TlRBd01qRTROall3TURjMU9ESTBPVFk2TVVsNFJ6Tk5kelJMWmtSWFZHVTNUREJmTjNkMw==";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      name: 'אתה',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");
    setIsLoading(true);

    setTimeout(() => {
      const reporterResponse = {
        id: messages.length + 2,
        sender: 'reporter',
        name: reporters[0]?.name || 'כתב תחזוקה',
        text: 'תודה על השאלה! זו מידע חשוב אודות תחזיית מזג האוויר. המערכת מעדכנת בזמן אמת.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, reporterResponse]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#001a4d]/80 via-[#0033CC]/70 to-[#0080FF]/60 rounded-3xl overflow-hidden shadow-2xl shadow-[#0080FF]/40 border-2 border-[#0080FF]/60">
      {/* Premium Branded Header */}
      <div className="relative bg-gradient-to-r from-[#0066FF] via-[#0080FF]/90 to-[#0066FF] p-4 sm:p-6 border-b-4 border-[#0080FF]/80 shadow-xl shadow-[#0080FF]/40" style={{ direction: 'rtl' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        <div className="relative flex items-center justify-center gap-4" style={{ direction: 'rtl' }}>
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
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Cloud className="w-6 h-6 text-white drop-shadow-lg" />
              <h2 className="text-white font-bold text-xl sm:text-2xl drop-shadow-lg">תחזיתן הרשת - צ'אט חי</h2>
            </div>
            <p className="text-white/90 text-xs sm:text-sm">שאל את הכתבים בשידור חי</p>
          </div>
        </div>
      </div>

      {/* Main Content - Avatar + Chat */}
      <div className="flex flex-row overflow-hidden" style={{ minHeight: '600px' }}>
        {/* Avatar Section - Left */}
        <div className="flex-1 relative bg-gradient-to-br from-[#001a4d] via-[#0033CC] to-[#0066FF] border-r-4 border-[#0080FF]/40">
          {/* Avatar Label Top Left */}
          <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-[#0080FF] to-[#00D4FF] px-4 py-1.5 rounded-full border-2 border-white/30 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="text-white font-bold text-xs">ON AIR</span>
            </div>
          </div>

          {/* D-ID Agent Iframe */}
          <iframe
            ref={iframeRef}
            src={weatherAgentUrl}
            allow="microphone; camera; autoplay"
            className="w-full h-full border-0"
            title="Weather Forecast Live Chat"
          />
        </div>

        {/* Chat Panel - Right */}
        <div className="w-96 bg-gradient-to-b from-[#001a4d] via-[#0033CC] to-[#001a4d] flex flex-col border-r-4 border-[#0080FF]/40">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-black/20 to-transparent">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-xs ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${msg.sender === 'user' ? 'bg-[#0080FF]' : 'bg-green-600'}`}>
                      {msg.sender === 'user' ? '👤' : '🎙️'}
                    </div>
                    <div className={`rounded-lg px-3 py-2 ${msg.sender === 'user' ? 'bg-[#0080FF]/80 text-white' : 'bg-gray-700/60 text-white'}`}>
                      <p className="text-xs font-bold mb-1">{msg.name}</p>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm">🎙️</div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-[#0080FF]/40 p-4 space-y-2 bg-black/30">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="שאל את הכתבים..."
                className="bg-black/60 border-[#0080FF]/40 text-white placeholder:text-white/50"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-[#0080FF] to-[#00D4FF] hover:from-[#00D4FF] hover:to-[#0080FF] text-white shadow-lg shadow-[#0080FF]/50"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative bg-gradient-to-r from-[#0066FF] via-[#0080FF]/80 to-[#0066FF] p-3 border-t-4 border-[#00D4FF]/60 shadow-lg shadow-[#0080FF]/40">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
        <div className="relative flex items-center justify-center gap-2 text-white text-xs font-bold">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          שידור חי • עדכון אחרון: {new Date().toLocaleTimeString('he-IL')}
        </div>
      </div>
    </div>
  );
}