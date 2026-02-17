import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Send, Video, Loader2, Home, Shield, Download, History, X, Play, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function VideoCreator() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const fileInputRef = useRef(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const messagesEndRef = useRef(null);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem('videoDownloadHistory');
    if (saved) {
      try {
        setGeneratedVideos(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Subscribe to conversation
  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages);
      const lastMsg = data.messages[data.messages.length - 1];
      if (lastMsg?.tool_calls) {
        lastMsg.tool_calls.forEach(tc => {
          if (tc.status === 'completed' && tc.results) {
            try {
              const result = typeof tc.results === 'string' ? JSON.parse(tc.results) : tc.results;
              if (result.video_url) {
                setCurrentVideo(result.video_url);
                const userMsg = data.messages.find(m => m.role === 'user');
                const title = userMsg?.content?.substring(0, 50) || "סרטון AI";
                const newVideo = {
                  id: Date.now(),
                  title,
                  videoUrl: result.video_url,
                  timestamp: new Date().toISOString()
                };
                const updated = [newVideo, ...generatedVideos].slice(0, 20);
                setGeneratedVideos(updated);
                localStorage.setItem('videoDownloadHistory', JSON.stringify(updated));
                setLoading(false);
                toast.success('✅ הסרטון מוכן!', { id: 'creating' });
              }
            } catch (e) {}
          }
        });
      }
    });
    return () => unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('רק תמונות מותרות');
      return;
    }

    setUploadingFile(true);
    toast.loading('מעלה...', { id: 'upload' });

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      let conv = conversationId ? await base44.agents.getConversation(conversationId) : null;
      if (!conv) {
        conv = await base44.agents.createConversation({
          agent_name: "video_creator",
          metadata: { name: "סרטון" }
        });
        setConversationId(conv.id);
      }

      await base44.agents.addMessage(conv, {
        role: "user",
        content: input.trim() || "צור סרטון מהתמונה הזו",
        file_urls: [file_url]
      });

      setInput('');
      toast.success('מעבד...', { id: 'upload' });
    } catch (err) {
      toast.error(err.message, { id: 'upload' });
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);
    setCurrentVideo(null);
    
    toast.loading('יוצר סרטון קולנועי...', { id: 'creating' });

    try {
      let conv;
      if (!conversationId) {
        conv = await base44.agents.createConversation({
          agent_name: "video_creator",
          metadata: { name: "סרטון" }
        });
        setConversationId(conv.id);
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
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col overflow-hidden" dir="rtl">
      {/* Header - Mobile Optimized */}
      <div className="bg-black/80 backdrop-blur-xl border-b border-gray-800 px-3 sm:px-4 py-3 flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <Video className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
          <div>
            <h1 className="text-sm sm:text-lg font-bold text-white">יוצר סרטונים AI</h1>
            <p className="text-gray-500 text-[10px] sm:text-xs hidden sm:block">תאר והמערכת יוצרת</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            onClick={() => setHistoryOpen(true)}
            variant="outline"
            size="sm"
            className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
          >
            <History className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">היסטוריה</span>
            <span className="sm:hidden">({generatedVideos.length})</span>
          </Button>
          <Link to={createPageUrl("Home")}>
            <Button variant="outline" size="sm" className="gap-1 px-2 sm:px-3">
              <Home className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">חזרה</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main - Mobile Optimized */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Center - Video Display */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 overflow-y-auto">
          {!loading && !currentVideo && (
            <div className="text-center max-w-2xl px-4">
              <Video className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-gray-600 mx-auto mb-4 sm:mb-6" />
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">תאר והמערכת יוצרת</h2>
              <p className="text-gray-400 text-sm sm:text-base lg:text-lg">כתוב מה אתה רוצה בתיבת הטקסט למטה והסרטון ייווצר תוך דקה</p>
            </div>
          )}

          {loading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-full max-w-4xl">
                {/* Professional Loading Container */}
                <div className="relative aspect-video bg-gradient-to-br from-black via-purple-950/40 to-black rounded-3xl border-2 border-purple-500/50 overflow-hidden shadow-2xl">
                  {/* Animated Grid Background */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.4) 1px, transparent 1px)',
                      backgroundSize: '50px 50px'
                    }} />
                  </div>

                  {/* Scanning Line Effect */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                    animate={{ y: [0, 1080, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Center Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    {/* Spinning Circle */}
                    <motion.div
                      className="relative w-32 h-32 mb-8"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="absolute inset-0 rounded-full border-4 border-purple-500/30" />
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-purple-500" />
                      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-600/50 to-pink-600/50 flex items-center justify-center">
                        <Video className="w-12 h-12 text-white" />
                      </div>
                    </motion.div>

                    {/* Status Text */}
                    <div className="text-center px-6">
                      <motion.h3
                        className="text-3xl font-bold text-white mb-3"
                        animate={{ opacity: [1, 0.7, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        🎬 מייצר סרטון מקצועי...
                      </motion.h3>
                      <p className="text-purple-200 text-lg mb-6">HeyGen AI מעבד את הבקשה שלך</p>

                      {/* Progress Steps */}
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <motion.div
                          className="flex items-center gap-2"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                        >
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm text-gray-400">סקריפט</span>
                        </motion.div>
                        <div className="w-8 h-0.5 bg-purple-500/30" />
                        <motion.div
                          className="flex items-center gap-2"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        >
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          <span className="text-sm text-gray-400">רקע</span>
                        </motion.div>
                        <div className="w-8 h-0.5 bg-purple-500/30" />
                        <motion.div
                          className="flex items-center gap-2"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          <span className="text-sm text-white font-bold">מגישה</span>
                        </motion.div>
                      </div>

                      {/* Time Estimate */}
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 rounded-full border border-purple-500/30">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                        <span className="text-sm text-purple-200">זמן משוער: 1-2 דקות</span>
                      </div>
                    </div>
                  </div>

                  {/* Corner Decorations */}
                  <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-purple-500/50 rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-purple-500/50 rounded-tr-lg" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-purple-500/50 rounded-bl-lg" />
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-purple-500/50 rounded-br-lg" />
                </div>

                {/* Additional Info Below */}
                <motion.div
                  className="mt-6 text-center"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <p className="text-gray-400 text-sm">
                    💡 הסרטון יכלול מגישה מקצועית, רקע סטודיו וסקריפט בעברית
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {currentVideo && !loading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-4xl px-2 sm:px-0"
            >
              <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl sm:rounded-2xl border-2 border-green-500/30 overflow-hidden">
                <video 
                  src={currentVideo} 
                  controls 
                  autoPlay
                  playsInline
                  className="w-full aspect-video bg-black"
                />
                <div className="p-3 sm:p-4 lg:p-6 bg-black/40 backdrop-blur-sm">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <a 
                      href={currentVideo} 
                      download 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base lg:text-lg flex items-center justify-center gap-2 sm:gap-3 transition-all"
                    >
                      <Download className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                      הורד סרטון
                    </a>
                    <Button
                      onClick={() => setCurrentVideo(null)}
                      variant="outline"
                      className="px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base lg:text-lg"
                    >
                      צור חדש
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Sidebar - Timeline - Hidden on Mobile */}
        <div className="hidden lg:flex lg:w-80 bg-black/50 border-r border-gray-800 flex-col">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-bold">ציר הזמן</h3>
            <p className="text-gray-500 text-xs">כל הסרטונים שנוצרו</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {generatedVideos.length === 0 && (
              <div className="text-center py-12">
                <Video className="w-10 h-10 text-gray-700 mx-auto mb-2" />
                <p className="text-gray-600 text-xs">עדיין לא נוצרו</p>
              </div>
            )}

            {generatedVideos.map((video, idx) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setCurrentVideo(video.videoUrl)}
                className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all cursor-pointer"
              >
                <div className="relative aspect-video bg-black">
                  <video 
                    src={video.videoUrl} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-purple-600 px-1.5 py-0.5 rounded text-white text-xs font-bold">
                    #{idx + 1}
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-white text-xs font-medium truncate">{video.title}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">{new Date(video.timestamp).toLocaleDateString('he-IL')}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Input - Mobile Optimized */}
      <div className="flex-shrink-0 p-3 sm:p-4 lg:p-6 bg-black/90 backdrop-blur-xl border-t border-gray-800 safe-area-inset-bottom">
        <div className="max-w-4xl mx-auto flex gap-2 sm:gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile || loading}
            variant="outline"
            size="sm"
            className="bg-gray-900 border-gray-700 px-2 sm:px-3"
          >
            {uploadingFile ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
          </Button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="תאר סרטון... (לדוגמה: 'חדשות טכנולוגיה')"
            className="flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl bg-gray-900 border-2 border-gray-700 text-white text-sm sm:text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={1}
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            size="sm"
            className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-3 sm:px-6 lg:px-10 text-sm sm:text-base lg:text-lg font-bold"
          >
            {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />}
          </Button>
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
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-5xl max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">היסטוריית סרטונים</h2>
                <button
                  onClick={() => setHistoryOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
                {generatedVideos.length === 0 ? (
                  <div className="text-center py-16">
                    <Video className="w-20 h-20 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">עדיין לא נוצרו סרטונים</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {generatedVideos.map((video) => (
                      <div key={video.id} className="bg-black rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all">
                        <video 
                          src={video.videoUrl} 
                          controls 
                          className="w-full aspect-video bg-black"
                        />
                        <div className="p-3">
                          <p className="text-white font-medium text-sm mb-2">{video.title}</p>
                          <p className="text-gray-500 text-xs mb-3">{new Date(video.timestamp).toLocaleString('he-IL')}</p>
                          <a
                            href={video.videoUrl}
                            download
                            className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
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