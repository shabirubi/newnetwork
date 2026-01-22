import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ReporterChatModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReporter, setSelectedReporter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: reporters = [] } = useQuery({
    queryKey: ['reporters'],
    queryFn: () => base44.entities.Reporter.filter({ is_active: true }),
    initialData: []
  });

  const handleSelectReporter = (reporter) => {
    setSelectedReporter(reporter);
    setMessages([
      {
        id: 'intro',
        role: 'assistant',
        text: `היי! אני ${reporter.name}, כתב/כתבת חדשות. אני מתמחה ב${reporter.specialty}. איך אוכל לעזור?`,
        reporter: reporter.name
      }
    ]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedReporter) return;

    const userMsg = { id: Date.now(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await base44.functions.invoke('reporterAIChat', {
        message: input,
        reporterName: selectedReporter.name,
        reporterRole: selectedReporter.role,
        reporterSpecialty: selectedReporter.specialty,
      });

      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        text: response.data.response,
        reporter: selectedReporter.name
      }]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl font-bold flex items-center gap-3 shadow-lg"
      >
        <MessageCircle className="w-5 h-5" />
        צ'אט עם כתבים
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl h-[70vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex justify-between items-center">
                <h2 className="font-bold text-lg">צ'אט כתבים</h2>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden flex">
                {!selectedReporter ? (
                  // Reporters List
                  <div className="w-full overflow-y-auto p-4 space-y-2">
                    <h3 className="font-bold text-sm mb-3 dark:text-white">בחר כתב/כתבת:</h3>
                    {reporters.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleSelectReporter(r)}
                        className="w-full text-left p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3"
                      >
                        <img src={r.image} alt={r.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-sm dark:text-white">{r.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{r.specialty}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  // Chat
                  <div className="w-full flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
                          }`}>
                            <p className="text-sm">{msg.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="שלח הודעה..."
                          disabled={loading}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={loading || !input.trim()}
                          className="bg-indigo-600 hover:bg-indigo-700"
                          size="icon"
                        >
                          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedReporter(null);
                          setMessages([]);
                        }}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-indigo-600"
                      >
                        ← חזור לרשימה
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}