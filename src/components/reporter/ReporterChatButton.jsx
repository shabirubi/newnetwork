import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, User, Sparkles, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ReporterChatButton() {
  const [isReportersOpen, setIsReportersOpen] = useState(false);
  const [selectedReporter, setSelectedReporter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    const handleOpenChat = () => setIsReportersOpen(true);
    window.addEventListener('openReporterChat', handleOpenChat);
    return () => window.removeEventListener('openReporterChat', handleOpenChat);
  }, []);

  const { data: reporters = [] } = useQuery({
    queryKey: ['reporters'],
    queryFn: () => base44.entities.Reporter.filter({ is_active: true }),
    initialData: []
  });

  const handleSendMessage = async () => {
    if (!message.trim() || isProcessing || !selectedReporter) return;

    const userMessage = message.trim();
    setMessage("");
    
    const newUserMessage = {
      id: Date.now(),
      content: userMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsProcessing(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `אתה ${selectedReporter.name}, ${selectedReporter.role} מומחה ב${selectedReporter.specialty}.
        
המשתמש שואל: "${userMessage}"

תן תשובה מקצועית, ידידותית וממוקדת (2-4 משפטים). ענה כאילו אתה באמת הכתב ${selectedReporter.name}. השב בעברית בלבד.`,
        add_context_from_internet: true
      });

      const aiMessage = {
        id: Date.now() + 1,
        content: response,
        sender: 'reporter',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (err) {
      console.error("Error:", err);
      toast.error("שגיאה בקבלת תשובה");
      setMessages(prev => prev.filter(m => m.id !== newUserMessage.id));
      setMessage(userMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectReporter = (reporter) => {
    setSelectedReporter(reporter);
    setMessages([]);
    setIsReportersOpen(false);
  };

  const handleCloseChat = () => {
    setSelectedReporter(null);
    setMessages([]);
    setMessage("");
  };

  return (
    <>
      {/* Reporters List Modal */}
      <AnimatePresence>
        {isReportersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={() => setIsReportersOpen(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:w-[500px] max-h-[80vh] bg-gradient-to-b from-gray-900 to-black sm:rounded-2xl overflow-hidden shadow-2xl border-t sm:border border-blue-600/50"
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 p-4 flex items-center justify-between border-b border-blue-600/30">
                <div>
                  <h2 className="text-xl font-bold text-white">בחר כתב לשיחה</h2>
                  <p className="text-sm text-blue-200">{reporters.length} כתבים זמינים</p>
                </div>
                <button
                  onClick={() => setIsReportersOpen(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
                {reporters.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">אין כתבים זמינים כרגע</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {reporters.map((reporter) => (
                      <motion.button
                        key={reporter.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelectReporter(reporter)}
                        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 hover:border-blue-600 transition-all group"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden mb-3 border-2 border-gray-700 group-hover:border-blue-600 transition-colors">
                          <img 
                            src={reporter.image}
                            alt={reporter.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="text-white font-bold text-sm mb-1 line-clamp-1">{reporter.name}</h3>
                        <p className="text-gray-400 text-xs mb-2 line-clamp-1">{reporter.role}</p>
                        <div className="flex items-center justify-center gap-1 text-blue-400 text-xs">
                          <Send className="w-3 h-3" />
                          <span>התחל שיחה</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {selectedReporter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
            onClick={handleCloseChat}
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
                      <img src={selectedReporter.image} alt={selectedReporter.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{selectedReporter.name}</h3>
                      <p className="text-sm text-white/90">{selectedReporter.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseChat}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50 dark:bg-gray-900">
                {messages.length === 0 && !isProcessing && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <Sparkles className="w-12 h-12 mx-auto mb-3 text-[#E31E24]" />
                      <p className="text-sm">שאל את {selectedReporter.name} שאלה...</p>
                    </div>
                  </div>
                )}

                <AnimatePresence mode="popLayout">
                  {messages.map((msg) => {
                    const isUser = msg.sender === 'user';

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
                            <img src={selectedReporter.image} alt={selectedReporter.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        
                        <div className={`max-w-[85%] ${isUser ? 'bg-[#E31E24] text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'} rounded-2xl p-3 shadow-md`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
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
                      <img src={selectedReporter.image} alt={selectedReporter.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-md">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#E31E24]" />
                        <span className="text-xs text-gray-500">{selectedReporter.name} כותב...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#E31E24]" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    צ'אט AI עם {selectedReporter.name} - מומחה ב{selectedReporter.specialty}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isProcessing && message.trim()) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={`שאל את ${selectedReporter.name}...`}
                    disabled={isProcessing}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
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
        )}
      </AnimatePresence>
    </>
  );
}