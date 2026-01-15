import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  X, Send, Mic, MicOff, Volume2, VolumeX, Loader2, User, Radio, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ReporterChatModal({ reporter, article, onClose }) {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const chatEndRef = useRef(null);
  const queryClient = useQueryClient();

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (err) {
        setCurrentUser({ email: "guest@example.com", full_name: "אורח" });
      }
    };
    getUser();
  }, []);

  // Create conversation on mount
  useEffect(() => {
    const initConversation = async () => {
      if (!currentUser) return;

      try {
        const conv = await base44.agents.createConversation({
          agent_name: "general_reporter",
          metadata: {
            name: `שיחה עם ${reporter.name}`,
            reporter_id: reporter.id,
            reporter_name: reporter.name,
            reporter_role: reporter.role,
            reporter_specialty: reporter.specialty,
            reporter_gender: reporter.gender,
            article_id: article?.id || null,
            article_title: article?.title || null,
            user_email: currentUser.email
          }
        });
        setConversation(conv);

        // Send initial context message
        const contextMessage = article 
          ? `היי! אני ${reporter.name}, ${reporter.role}. אני מתמחה ב${reporter.specialty}. אני כאן כדי לדבר איתך על הכתבה "${article.title}". ${article.subtitle || ''}\n\nמה תרצה לדעת?`
          : `שלום! אני ${reporter.name}, ${reporter.role}. אני מתמחה ב${reporter.specialty}. במה אוכל לעזור לך היום?`;

        await base44.agents.addMessage(conv, {
          role: "assistant",
          content: contextMessage
        });

      } catch (err) {
        console.error("Error creating conversation:", err);
        toast.error("שגיאה ביצירת השיחה");
      }
    };

    initConversation();
  }, [currentUser, reporter, article]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversation) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });

    return () => unsubscribe();
  }, [conversation]);



  const handleSendMessage = async () => {
    if (!message.trim() || !conversation || isProcessing) return;

    const userMessage = message.trim();
    setMessage("");
    setIsProcessing(true);

    try {
      // Add context about the article if exists
      let fullMessage = userMessage;
      if (article) {
        fullMessage = `[הקשר: הכתבה "${article.title}" - ${article.category}]\n\nשאלת המשתמש: ${userMessage}`;
      }

      await base44.agents.addMessage(conversation, {
        role: "user",
        content: fullMessage
      });

    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("שגיאה בשליחת ההודעה");
    } finally {
      setIsProcessing(false);
    }
  };



  const playVoiceResponse = (text, messageId) => {
    if (playingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setPlayingMessageId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL';
    utterance.volume = 1.0;
    
    const getReporterVoiceIndex = (name) => {
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) - hash) + name.charCodeAt(i);
        hash = hash & hash;
      }
      return Math.abs(hash);
    };
    
    const reporterIndex = getReporterVoiceIndex(reporter.name);
    const voices = window.speechSynthesis.getVoices();
    
    console.log('🎙️ צ\'אט - קולות זמינים:', voices.filter(v => v.lang.includes('he')).map(v => v.name));
    console.log('👤 כתב:', reporter.name, '| מין:', reporter.gender);
    
    if (reporter.gender === 'female') {
      // EXTREME high pitch for females
      const femalePitches = [2.0, 2.1, 2.2, 1.95, 2.05];
      utterance.pitch = femalePitches[reporterIndex % femalePitches.length];
      utterance.rate = 1.05 + (reporterIndex % 3) * 0.02;
      
      const femaleVoices = voices.filter(v => 
        (v.lang.includes('he') || v.lang.includes('iw')) && 
        (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') ||
         v.name.toLowerCase().includes('hadar') || v.name.toLowerCase().includes('carmit'))
      );
      if (femaleVoices.length > 0) {
        utterance.voice = femaleVoices[reporterIndex % femaleVoices.length];
      }
      console.log('✅ נקבה - Pitch:', utterance.pitch, '| Rate:', utterance.rate);
    } else {
      // EXTREME low pitch for males
      const malePitches = [0.5, 0.55, 0.6, 0.48, 0.52];
      utterance.pitch = malePitches[reporterIndex % malePitches.length];
      utterance.rate = 0.85 + (reporterIndex % 3) * 0.02;
      
      const maleVoices = voices.filter(v => 
        (v.lang.includes('he') || v.lang.includes('iw')) && 
        (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('man') ||
         v.name.toLowerCase().includes('asaf') || v.name.toLowerCase().includes('david'))
      );
      if (maleVoices.length > 0) {
        utterance.voice = maleVoices[reporterIndex % maleVoices.length];
      }
      console.log('✅ זכר - Pitch:', utterance.pitch, '| Rate:', utterance.rate);
    }

    utterance.onend = () => setPlayingMessageId(null);
    
    setPlayingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                <img src={reporter.image} alt={reporter.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{reporter.name}</h3>
                <p className="text-sm text-white/90">{reporter.role}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {article && (
            <div className="bg-white/10 rounded-lg p-2 text-xs">
              <p className="line-clamp-1">{article.title}</p>
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {!conversation && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <Sparkles className="w-8 h-8 animate-pulse text-[#E31E24]" />
                <p className="text-sm">מאתחל שיחה חכמה עם הכתב...</p>
              </div>
            </div>
          )}

          {conversation && messages.length === 0 && !isProcessing && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-[#E31E24]" />
                <p className="text-sm">שאל את {reporter.name} שאלה...</p>
              </div>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const isAssistant = msg.role === 'assistant';
              
              // Skip system messages
              if (msg.role === 'system') return null;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#E31E24] shrink-0">
                      <img src={reporter.image} alt={reporter.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] ${isUser ? 'bg-[#E31E24] text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'} rounded-2xl p-3 shadow-md`}>
                    {isUser ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content.replace(/\[הקשר:.*?\]\n\n/g, '').replace('שאלת המשתמש: ', '')}
                      </p>
                    ) : (
                      <ReactMarkdown 
                        className="text-sm prose prose-sm prose-slate dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold text-[#E31E24]">{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc mr-4 mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal mr-4 mb-2">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                    
                    {isAssistant && (
                      <button
                        onClick={() => playVoiceResponse(msg.content, idx)}
                        className="mt-2 flex items-center gap-1 text-xs text-[#E31E24] hover:text-[#B91C1C] transition-colors"
                      >
                        {playingMessageId === idx ? (
                          <>
                            <VolumeX className="w-3 h-3" />
                            עצור
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            שמע תשובה
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isProcessing && (
            <div className="flex justify-start gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#E31E24]">
                <img src={reporter.image} alt={reporter.name} className="w-full h-full object-cover" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-md">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#E31E24]" />
                  <span className="text-xs text-gray-500">{reporter.name} חושב...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#E31E24]" />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              צ'אט מופעל ע"י AI מתקדם - תשובות מקצועיות ומעמיקות
            </p>
          </div>
          
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSendMessage()}
              placeholder={`שאל את ${reporter.name} שאלה...`}
              disabled={isProcessing || !conversation}
              className="flex-1 dark:bg-gray-700 dark:border-gray-600"
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isProcessing || !conversation}
              className="bg-[#E31E24] hover:bg-[#B91C1C] shrink-0"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            {reporter.name} מומחה ב{reporter.specialty}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}