import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Send, Video, Loader2, Home, Shield, Download, History, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function VideoCreator() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem('videoDownloadHistory');
    if (saved) {
      try {
        setGeneratedVideos(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // Subscribe to conversation
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages);
      
      // Save completed videos
      const lastMsg = data.messages[data.messages.length - 1];
      if (lastMsg?.tool_calls) {
        lastMsg.tool_calls.forEach(tc => {
          if (tc.status === 'completed' && tc.results) {
            try {
              const result = typeof tc.results === 'string' ? JSON.parse(tc.results) : tc.results;
              if (result.video_url) {
                const userMsg = data.messages.find(m => m.role === 'user');
                const title = userMsg?.content?.substring(0, 50) || "סרטון AI";
                
                const newVideo = {
                  id: Date.now(),
                  title,
                  videoUrl: result.video_url,
                  timestamp: new Date().toISOString(),
                  scriptPreview: title
                };
                
                setGeneratedVideos(prev => {
                  const updated = [newVideo, ...prev].slice(0, 20);
                  localStorage.setItem('videoDownloadHistory', JSON.stringify(updated));
                  return updated;
                });
                
                setLoading(false);
                toast.success('✅ הסרטון מוכן!', { id: 'creating' });
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        });
      }
    });

    return () => unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);
    toast.loading('יוצר סרטון...', { id: 'creating' });

    try {
      let conv;
      if (!conversationId) {
        conv = await base44.agents.createConversation({
          agent_name: "video_creator",
          metadata: { name: "Video" }
        });
        setConversationId(conv.id);

        base44.agents.subscribeToConversation(conv.id, (data) => {
          setMessages(data.messages);
        });
      } else {
        conv = await base44.agents.getConversation(conversationId);
      }

      await base44.agents.addMessage(conv, {
        role: "user",
        content: userMessage
      });
      
    } catch (err) {
      console.error(err);
      toast.error('שגיאה: ' + err.message, { id: 'creating' });
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-b border-gray-800 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Video className="w-6 h-6 text-purple-500" />
          <div>
            <h1 className="text-lg font-bold text-white">יוצר סרטונים AI</h1>
            <p className="text-gray-500 text-xs">תאר והאג'נט יוצר</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setHistoryOpen(true)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <History className="w-4 h-4" />
            היסטוריה ({generatedVideos.length})
          </Button>
          <Link to={createPageUrl("Home")}>
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="w-4 h-4" />
              חזרה
            </Button>
          </Link>
          <a href={createPageUrl("AdminPanel")} target="_blank">
            <Button variant="outline" size="sm" className="gap-2 bg-purple-600/20 border-purple-500/50">
              <Shield className="w-4 h-4" />
              Admin
            </Button>
          </a>
        </div>
      </div>

      {/* Main: Chat + Timeline */}
      <div className="flex-1 flex pt-16">
        {/* Chat */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">תאר סרטון והאג'נט יוצר</h2>
                <p className="text-gray-400">פשוט כתוב מה אתה רוצה והמערכת תיצור בשבילך סרטון מקצועי</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-2xl rounded-2xl p-4 ${
                  msg.role === "user"
                    ? "bg-gray-800 text-white"
                    : "bg-gradient-to-br from-purple-600 to-pink-600 text-white"
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {msg.tool_calls?.map((toolCall, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mt-4"
                    >
                      {(toolCall.status === 'running' || toolCall.status === 'in_progress') && (
                        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-6 border border-purple-500/30">
                          <div className="flex items-center gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                            <div>
                              <p className="text-white font-bold">🎬 יוצר סרטון AI...</p>
                              <p className="text-purple-200 text-sm">עד 2 דקות</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {toolCall.status === 'completed' && toolCall.results && (() => {
                        try {
                          const result = typeof toolCall.results === 'string' ? JSON.parse(toolCall.results) : toolCall.results;
                          if (result.video_url) {
                            return (
                              <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-xl p-4 border border-green-500/30">
                                <video 
                                  src={result.video_url} 
                                  controls 
                                  className="w-full rounded-lg mb-3"
                                />
                                <a 
                                  href={result.video_url} 
                                  download 
                                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                                >
                                  <Download className="w-5 h-5" />
                                  הורד סרטון
                                </a>
                              </div>
                            );
                          }
                        } catch (e) {
                          return null;
                        }
                      })()}

                      {toolCall.status === 'failed' && (
                        <div className="bg-red-900/50 rounded-xl p-4 border border-red-500/30">
                          <p className="text-red-300 font-bold">❌ שגיאה ביצירת הסרטון</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl p-6 flex items-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <div>
                    <p className="font-bold text-lg">🎬 יוצר סרטון AI...</p>
                    <p className="text-purple-200 text-sm">עד 2 דקות</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-gray-800">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="תאר את הסרטון שאתה רוצה ליצור..."
                className="flex-1 px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={3}
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-auto px-8"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Timeline Sidebar */}
        <div className="w-96 bg-black/50 border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-bold">ציר הזמן</h3>
            <p className="text-gray-500 text-xs">כל הסרטונים שנוצרו</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {generatedVideos.length === 0 && (
              <div className="text-center py-12">
                <Video className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">עדיין לא נוצרו סרטונים</p>
              </div>
            )}

            {generatedVideos.map((video, idx) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all group"
              >
                <div className="relative aspect-video bg-black">
                  <video 
                    src={video.videoUrl} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-purple-600 px-2 py-0.5 rounded text-white text-xs font-bold">
                    #{idx + 1}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-white text-sm font-medium truncate">{video.title}</p>
                  <p className="text-gray-500 text-xs mt-1">{new Date(video.timestamp).toLocaleString('he-IL')}</p>
                  <a
                    href={video.videoUrl}
                    download
                    className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <Download className="w-3 h-3" />
                    הורד
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {historyOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setHistoryOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-4xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">היסטוריית סרטונים</h2>
                <button
                  onClick={() => setHistoryOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                {generatedVideos.length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500">עדיין לא נוצרו סרטונים</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {generatedVideos.map((video) => (
                      <div key={video.id} className="bg-black rounded-lg overflow-hidden border border-gray-800">
                        <video src={video.videoUrl} controls className="w-full aspect-video" />
                        <div className="p-3">
                          <p className="text-white font-medium text-sm">{video.title}</p>
                          <p className="text-gray-500 text-xs mt-1">{new Date(video.timestamp).toLocaleString('he-IL')}</p>
                          <a
                            href={video.videoUrl}
                            download
                            className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
                          >
                            <Download className="w-4 h-4" />
                            הורד
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}