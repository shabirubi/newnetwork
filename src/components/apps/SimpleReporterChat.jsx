import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import moment from "moment";

export default function SimpleReporterChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReporter, setSelectedReporter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: reporters = [] } = useQuery({
    queryKey: ['reporters-simple-chat'],
    queryFn: () => base44.entities.Reporter.filter({ is_active: true }, 'name', 20),
    initialData: []
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    const messageText = inputValue;
    if (!messageText.trim() || !selectedReporter || isLoading) return;

    const userMessage = { role: "user", content: messageText, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await base44.functions.invoke('reporterAIChat', {
        message: messageText,
        reporterName: selectedReporter.name,
        reporterRole: selectedReporter.role,
        reporterSpecialty: selectedReporter.specialty,
        reporterBio: selectedReporter.bio,
        userProfile: {}
      });

      const aiMessage = {
        role: "assistant",
        content: response.data.response,
        reporter: selectedReporter.name,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('שגיאה בשליחת ההודעה');
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = (reporter) => {
    setSelectedReporter(reporter);
    setMessages([
      {
        role: "assistant",
        content: `שלום! אני ${reporter.name}. כאן לדיון עם מומחיות ב-${reporter.specialty}. מה מעניין אותך?`,
        reporter: reporter.name,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 cursor-pointer shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-white" />
          <div>
            <h3 className="text-lg font-bold text-white">צ'אט פשוט</h3>
            <p className="text-blue-100 text-sm">שוחח עם כתבים</p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl w-[95vw] h-[80vh] flex flex-col overflow-hidden max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">צ'אט כתבים</h2>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedReporter(null);
                    setMessages([]);
                  }}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {!selectedReporter ? (
                  // Reporters List
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 overflow-y-auto p-4 space-y-2"
                  >
                    <h3 className="font-bold dark:text-white mb-3">בחר כתב/כתבת:</h3>
                    {reporters.map((reporter) => (
                      <motion.button
                        key={reporter.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => startNewChat(reporter)}
                        className="w-full text-left p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={reporter.image}
                            alt={reporter.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 text-left">
                            <p className="font-bold dark:text-white text-sm">{reporter.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{reporter.specialty}</p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                ) : (
                  // Chat Window
                  <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.map((message, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-2 ${
                            message.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            message.role === "user"
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-gray-200 dark:bg-gray-700 dark:text-white rounded-bl-none"
                          }`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.role === "user"
                                ? "text-blue-100"
                                : "text-gray-500 dark:text-gray-400"
                            }`}>
                              {moment(message.timestamp).format("HH:mm")}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="שלח הודעה..."
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                          disabled={isLoading}
                          className="flex-1 text-sm"
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={isLoading || !inputValue.trim()}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isLoading ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedReporter(null);
                          setMessages([]);
                        }}
                        className="text-xs text-gray-600 dark:text-gray-400 mt-2 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        ← חזור לרשימה
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}