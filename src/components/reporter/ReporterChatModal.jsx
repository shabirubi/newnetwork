import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, Loader2, User, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ReporterChatModal({ reporter, article, onClose, isOpen = true }) {
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef(null);
  const chatEndRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

  if (!isOpen) return null;

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

  const { data: chatMessages = [] } = useQuery({
    queryKey: ['reporter-chat', reporter?.id, article?.id],
    queryFn: async () => {
      const msgs = await base44.entities.ReporterChat.filter({
        reporter_id: reporter.id,
        article_id: article?.id || null
      }, '-created_date', 100);
      return msgs;
    },
    enabled: !!reporter,
    refetchInterval: 2000,
    refetchOnMount: true
  });



  const handleSendMessage = async () => {
    if (!message.trim() || isProcessing || !currentUser) return;

    const userMessage = message.trim();
    setMessage("");
    setIsProcessing(true);

    try {
      await base44.entities.ReporterChat.create({
        reporter_id: reporter.id,
        reporter_name: reporter.name,
        article_id: article?.id || null,
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        message: userMessage,
        sender_type: "user"
      });
      inputRef.current?.focus();
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("שגיאה בשליחת ההודעה");
      setMessage(userMessage);
    } finally {
      setIsProcessing(false);
    }
  };



  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-2xl bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[95vh] sm:max-h-[85vh]"
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
        <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50 dark:bg-gray-900">
          {chatMessages.length === 0 && !isProcessing && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-[#E31E24]" />
                <p className="text-sm">שאל את {reporter.name} שאלה...</p>
              </div>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {chatMessages.map((msg) => {
              const isUser = msg.sender_type === 'user';

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#E31E24] shrink-0">
                      <img src={reporter.image} alt={reporter.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] ${isUser ? 'bg-[#E31E24] text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'} rounded-2xl p-3 shadow-md`}>
                    <p className="text-sm leading-relaxed">{msg.message || msg.response_text}</p>
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
                  <span className="text-xs text-gray-500">שליחת הודעה...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 safe-area-inset-bottom">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#E31E24]" />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              צ'אט מופעל ע"י AI - {reporter.name} מומחה ב{reporter.specialty}
            </p>
          </div>
          
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isProcessing && message.trim()) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`שאל את ${reporter.name}...`}
              disabled={isProcessing}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              autoComplete="off"
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isProcessing}
              className="bg-[#E31E24] hover:bg-[#B91C1C] shrink-0 w-10 h-10 p-0"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}