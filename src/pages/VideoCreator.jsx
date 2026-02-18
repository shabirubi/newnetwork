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

  const pollVideoStatus = async (videoId) => {
    let attempts = 0;
    const maxAttempts = 100; // 5 minutes

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000));

      try {
        const { data } = await base44.functions.invoke('checkHeyGenVideoStatus', { video_id: videoId });

        console.log('✅ Status:', data.status, 'Attempt:', attempts + 1);

        if (data.status === 'completed' && data.video_url) {
          setCurrentVideo(data.video_url);
          const userMessage = input.trim();
          const title = userMessage.substring(0, 50) || "סרטון AI";
          const newVideo = {
            id: Date.now(),
            title,
            videoUrl: data.video_url,
            timestamp: new Date().toISOString()
          };
          const updated = [newVideo, ...generatedVideos].slice(0, 20);
          setGeneratedVideos(updated);
          localStorage.setItem('videoDownloadHistory', JSON.stringify(updated));
          setLoading(false);
          toast.success('✅ הסרטון מוכן!', { id: 'creating' });
          return;
        }

        if (data.status === 'failed' || data.error) {
          console.error('❌ Video failed:', data.error);
          setLoading(false);
          toast.error('נכשל: ' + (data.error || 'שגיאה לא ידועה'), { id: 'creating' });
          return;
        }

        // Update toast with progress
        const progress = Math.floor((attempts / maxAttempts) * 100);
        toast.loading(`יוצר סרטון... ${progress}%`, { id: 'creating' });

        attempts++;
      } catch (err) {
        console.error('Polling error:', err);
        attempts++;
      }
    }

    setLoading(false);
    toast.error('הזמן תם - אבל הסרטון עדיין מתעבד ב-HeyGen', { id: 'creating' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setLoading(true);
    setCurrentVideo(null);

    toast.loading('מתחיל ייצור סרטון...', { id: 'creating' });

    try {
      const { data } = await base44.functions.invoke('createFullProductionVideo', {
        description: userMessage
      });

      console.log('✅ Response:', data);

      if (data.video_id) {
        console.log('🎬 Video ID:', data.video_id);
        toast.loading('יוצר סרטון עם HeyGen... ממתין לתוצאה', { id: 'creating' });
        setInput(""); // Clear input only after successful API call
        pollVideoStatus(data.video_id);
      } else {
        throw new Error('No video ID returned: ' + JSON.stringify(data));
      }

    } catch (err) {
      console.error('❌ Error:', err);
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
            <h1 className="text-sm sm:text-lg font-bold text-white">Digital Dreams</h1>
            <p className="text-gray-500 text-[10px] sm:text-xs hidden sm:block">יוצר סרטונים AI</p>
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
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden pb-24">
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-2xl px-4"
            >
              {/* Simple Black Container */}
              <div className="bg-black rounded-2xl p-8 sm:p-12 border border-gray-800">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Digital Dreams</h3>
                  <p className="text-gray-400 text-sm">מייצר את הסרטון שלך...</p>
                </div>

                {/* Thin Progress Bar */}
                <div className="relative h-1 bg-gray-800 rounded-full overflow-hidden mb-6">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 90, ease: "linear" }}
                  />
                </div>

                {/* Progress Percentage */}
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.p
                    className="text-4xl sm:text-5xl font-bold text-white mb-4"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                  >
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {Math.floor(Math.random() * 30 + 45)}%
                    </motion.span>
                  </motion.p>

                  {/* Status Steps */}
                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-400">
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      הפקה
                    </motion.span>
                    <span>•</span>
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      עיבוד
                    </motion.span>
                    <span>•</span>
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    >
                      גימור
                    </motion.span>
                  </div>
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

      {/* Bottom Input - Fixed Position */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-black/95 backdrop-blur-xl border-t border-gray-800 z-50">
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