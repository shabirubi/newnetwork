import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Video, Loader2, Sparkles, Download, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function VideoCreator() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const initConversation = async () => {
      try {
        const conv = await base44.agents.createConversation({
          agent_name: "video_creator",
          metadata: { name: "צור סרטון חדש" }
        });
        setConversationId(conv.id);
      } catch (err) {
        console.error(err);
        toast.error("שגיאה ביצירת שיחה");
      }
    };
    initConversation();
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
      setLoading(false);
    });

    return unsubscribe;
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !conversationId || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    try {
      const conversation = await base44.agents.getConversation(conversationId);
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: userMessage
      });
    } catch (err) {
      console.error(err);
      toast.error("שגיאה בשליחת הודעה");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col" dir="rtl">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-[#E31E24]/30 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E31E24] to-[#B91C1C] flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">מחולל סרטונים AI</h1>
              <p className="text-gray-400 text-sm">צור סרטונים מקצועיים עם אווטרים מדברים</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E31E24] to-[#B91C1C] flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">ברוכים הבאים למחולל הסרטונים</h2>
              <p className="text-gray-400 mb-6">ספר לי מה תרצה ליצור ואני אעזור לך</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[
                  "צור סרטון חדשות על טכנולוגיה",
                  "הכן דיווח מזג אוויר",
                  "צור פרסומת למוצר חדש",
                  "הכן סיכום חדשות יומי"
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-[#E31E24]/50 transition-all text-right text-gray-300 hover:text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.role === "user"
                      ? "bg-gray-800 text-white"
                      : "bg-gradient-to-br from-[#E31E24] to-[#B91C1C] text-white"
                  }`}
                >
                  {msg.content && (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  )}

                  {msg.tool_calls?.map((tool, i) => (
                    <div key={i} className="mt-3 p-3 bg-black/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="w-4 h-4" />
                        <span className="text-xs font-bold">
                          {tool.status === "completed" ? "✅ סרטון מוכן!" : "⏳ יוצר סרטון..."}
                        </span>
                      </div>
                      
                      {tool.status === "completed" && tool.results && (
                        <div className="space-y-2">
                          {(() => {
                            try {
                              const result = typeof tool.results === "string" ? JSON.parse(tool.results) : tool.results;
                              if (result.video_url) {
                                return (
                                  <div className="space-y-2">
                                    <video
                                      src={result.video_url}
                                      controls
                                      className="w-full rounded-lg"
                                    />
                                    <div className="flex gap-2">
                                      <a
                                        href={result.video_url}
                                        download
                                        className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all text-xs"
                                      >
                                        <Download className="w-4 h-4" />
                                        הורד סרטון
                                      </a>
                                    </div>
                                  </div>
                                );
                              }
                            } catch (e) {
                              return null;
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-end"
            >
              <div className="bg-gradient-to-br from-[#E31E24] to-[#B91C1C] text-white rounded-2xl p-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">מייצר תשובה...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-black/50 backdrop-blur-xl border-t border-[#E31E24]/30 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="תאר מה תרצה ליצור... (Shift+Enter לשורה חדשה)"
              className="flex-1 min-h-[60px] bg-gray-900 border-gray-700 text-white resize-none"
              disabled={loading || !conversationId}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading || !conversationId}
              className="bg-gradient-to-br from-[#E31E24] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#E31E24] h-[60px] px-6"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 טיפ: תאר בפירוט מה תרצה - כולל הסקריפט, האווטר והסגנון
          </p>
        </div>
      </div>
    </div>
  );
}