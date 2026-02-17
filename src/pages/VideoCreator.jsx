import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Video, Loader2, Sparkles, Home, Shield, MessageSquare, ChevronRight, Plus, Play, Download, Wand2, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import DownloadHistory from "../components/home/DownloadHistory";

export default function VideoCreator() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const messagesEndRef = useRef(null);
  const [showChat, setShowChat] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [lastVideo, setLastVideo] = useState(null);

  // Fetch HeyGen avatars
  const { data: heygenAvatars = [] } = useQuery({
    queryKey: ['heygen-avatars'],
    queryFn: async () => {
      const result = await base44.functions.invoke('listHeyGenAvatars', {});
      return result.data?.avatars || [];
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  // Available avatars - use HeyGen avatars directly
  const avatars = heygenAvatars.map(a => ({
    id: a.avatar_id,
    name: a.avatar_name,
    image: a.preview_image_url,
    gender: a.gender,
    type: 'heygen',
    videoPreview: a.preview_video_url
  }));

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId]);



  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Select first avatar when avatars load
  useEffect(() => {
    if (avatars.length > 0 && !selectedAvatar) {
      setSelectedAvatar(avatars[0]);
    }
  }, [heygenAvatars]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - support both images and videos
    const imageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const videoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    const allValidTypes = [...imageTypes, ...videoTypes];
    
    if (!allValidTypes.includes(file.type)) {
      toast.error('פורמטים נתמכים: PNG, JPG, MP4, או MOV (עד 100MB)');
      return;
    }

    // Validate file size (max 100MB for videos)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('הקובץ גדול מדי. מקסימום 100MB');
      return;
    }

    setUploadingFile(true);
    toast.loading('מעלה קובץ...', { id: 'upload-file' });

    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      console.log('Uploaded file:', file_url);

      // Show file in chat
      const isVideo = videoTypes.includes(file.type);
      const userMessage = {
        role: "user",
        content: isVideo 
          ? `צפה בסרטון וצור לי תסריט ותיאור בהתאם:\n${input.trim() || 'צור תסריט לסרטון הזה'}` 
          : `צור לי סרטון עם האווטר מהתמונה: ${input.trim() || 'בנה לי סצנות יצירתיות'}`,
        file_urls: [file_url]
      };
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      // For images: create talking photo avatar
      if (imageTypes.includes(file.type)) {
        toast.loading('יוצר אווטר מהתמונה...', { id: 'upload-file' });
        const photoResult = await base44.functions.invoke('createPhotoAvatar', { 
          photo_url: file_url 
        });

        if (photoResult.data?.talking_photo_id) {
          console.log('Created talking photo:', photoResult.data);
          // Generate video directly with photo
          const result = await base44.functions.invoke('generateHeyGenCharacter', {
            script: userMessage.content.split(':')[1]?.trim() || "זה אווטר יוצר מתמונה שלך",
            talking_photo_id: photoResult.data.talking_photo_id,
            voice_id: "v6WKRTqObgmv7NHgVAFD",
            background: "transparent"
          });

          if (result.data?.video_url) {
            setMessages(prev => [...prev, {
              role: "assistant",
              content: "✅ סרטון מוכן!",
              video_url: result.data.video_url
            }]);
            toast.success('סרטון נוצר! 🎬', { id: 'upload-file' });
          }
        }
      } else {
        // For videos: just show it in chat
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "✅ וידאו הועלה! עכשיו תאר מה אתה רוצה ליצור והאג'נט יבנה סרטון מקצועי עם אפקטים"
        }]);
        toast.success('וידאו הועלה! 🎬', { id: 'upload-file' });
      }

    } catch (err) {
      console.error('Upload failed:', err);
      toast.error(`שגיאה: ${err.message}`, { id: 'upload-file' });
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    try {
      // Create conversation if doesn't exist
      if (!conversationId) {
        const conv = await base44.agents.createConversation({
          agent_name: "video_creator",
          metadata: { name: "יצירת סרטון" }
        });
        setConversationId(conv.id);
        setMessages([]);

        // Subscribe to updates
        base44.agents.subscribeToConversation(conv.id, (data) => {
          setMessages(data.messages);
        });

        // Send first message
        await base44.agents.addMessage(conv, {
          role: "user",
          content: userMessage
        });
      } else {
        // Add to existing conversation
        const conv = await base44.agents.getConversation(conversationId);
        await base44.agents.addMessage(conv, {
          role: "user",
          content: userMessage
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(`שגיאה: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-purple-500/30 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">🎬 DIGITAL DREAMS</h1>
            <p className="text-gray-400 text-xs">יוצר סרטונים AI מקצועי</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setHistoryOpen(true)}
            variant="outline"
            size="sm"
            className="gap-2 bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/50"
          >
            <History className="w-4 h-4" />
            היסטוריה
          </Button>
          <Link to={createPageUrl("Home")}>
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="w-4 h-4" />
              חזרה
            </Button>
          </Link>
          <a href={createPageUrl("AdminPanel")} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2 bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/50">
              <Shield className="w-4 h-4" />
              Admin
            </Button>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 400 }}
              exit={{ width: 0 }}
              className="bg-black/30 border-l border-gray-800 flex flex-col"
            >
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  עוזר AI לבניית סצנות
                </h3>
                <p className="text-gray-400 text-xs mt-1">תאר את הסרטון והאג'נט יבנה את הסצנות</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">שלום! תאר את הסרטון ואני אבנה לך את הסצנות</p>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl p-3 text-sm ${
                        msg.role === "user"
                          ? "bg-gray-800 text-white"
                          : "bg-gradient-to-br from-purple-600 to-pink-600 text-white"
                      }`}
                    >
                      {msg.file_urls && msg.file_urls.length > 0 && (
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="mb-3 space-y-2"
                        >
                          {msg.file_urls.map((url, i) => (
                            <div key={i} className="relative group">
                              <img 
                                src={url} 
                                alt="תמונה שהועלתה"
                                className="w-full rounded-lg border-2 border-purple-500/50 shadow-xl object-cover max-h-64"
                                onError={(e) => {
                                  console.error('Failed to load image:', url);
                                  e.target.style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-2">
                                <span className="text-white text-xs">📸 תמונה לאווטר</span>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                      {msg.video_url && (
                        <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-700 mb-3">
                          <video 
                            src={msg.video_url} 
                            controls 
                            className="w-full h-full"
                            playsInline
                          />
                          <a 
                            href={msg.video_url}
                            download
                            className="absolute top-2 right-2 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-bold transition-all"
                          >
                            <Download className="w-3 h-3 inline mr-1" />
                            הורד
                          </a>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {msg.tool_calls?.map((toolCall, i) => {
                        console.log('Tool call:', toolCall);
                        return (
                          <motion.div 
                            key={i} 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mt-3"
                          >
                            {(toolCall.status === 'running' || toolCall.status === 'in_progress') && (
                              <div className="p-4 bg-black/50 rounded-xl border border-gray-700 space-y-3">
                                {/* Mobile Native Video Player Skeleton */}
                                <div className="w-full aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center relative">
                                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-30" />

                                  {/* Center Play Button */}
                                  <motion.div
                                    animate={{ scale: [1, 1.08, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="relative z-10 flex items-center justify-center"
                                  >
                                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                                      <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                                    </div>
                                  </motion.div>

                                  {/* Loading Indicator */}
                                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                                    <div className="flex gap-0.5">
                                      {[0, 1, 2].map((i) => (
                                        <motion.div
                                          key={i}
                                          className="w-1.5 h-1.5 bg-white rounded-full"
                                          animate={{ opacity: [0.4, 1, 0.4] }}
                                          transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Status */}
                                <div className="text-center">
                                  <p className="text-white font-semibold text-sm">מייצר סרטון...</p>
                                  <p className="text-gray-400 text-xs mt-1">עד 2 דקות</p>
                                </div>
                              </div>
                            )}
                            
                            {toolCall.status === 'completed' && toolCall.results && (() => {
                              try {
                                const result = typeof toolCall.results === 'string' ? JSON.parse(toolCall.results) : toolCall.results;
                                console.log('Result:', result);
                                if (result.video_url) {
                                  // Save to history
                                  const videoData = {
                                    title: userMessage?.content?.substring(0, 30) || "סרטון",
                                    videoUrl: result.video_url,
                                    script: userMessage?.content
                                  };

                                  // Save to localStorage
                                  setTimeout(() => {
                                    const newDownload = {
                                      id: Math.random(),
                                      title: videoData.title,
                                      videoUrl: videoData.videoUrl,
                                      timestamp: new Date().toISOString(),
                                      scriptPreview: videoData.script?.substring(0, 50) + "..."
                                    };
                                    const saved = localStorage.getItem('videoDownloadHistory') || '[]';
                                    const downloads = JSON.parse(saved);
                                    const updated = [newDownload, ...downloads].slice(0, 20);
                                    localStorage.setItem('videoDownloadHistory', JSON.stringify(updated));
                                  }, 100);

                                  return (
                                    <div className="p-4 bg-black/50 rounded-xl border border-green-500/50 space-y-3">
                                      {/* Video Container */}
                                      <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                                        <video 
                                          src={result.video_url} 
                                          controls 
                                          className="w-full h-full"
                                          playsInline
                                        />
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex gap-2">
                                        <a 
                                          href={result.video_url} 
                                          download 
                                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all"
                                        >
                                          <Download className="w-3 h-3" />
                                          הורד
                                        </a>
                                        <button
                                          onClick={() => {
                                            setInput(userMessage?.content || "");
                                            setMessages(prev => prev.slice(0, -1));
                                          }}
                                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all"
                                        >
                                          <Wand2 className="w-3 h-3" />
                                          שנה
                                        </button>
                                      </div>

                                      {/* Success Message */}
                                      <p className="text-center text-green-300 text-xs font-semibold">✅ נשמר בהיסטוריה</p>
                                    </div>
                                  );
                                }
                              } catch (e) {
                                console.error('Parse error:', e);
                                return null;
                              }
                              return null;
                            })()}

                            {toolCall.status === 'failed' && (
                              <div className="p-4 bg-red-500/20 backdrop-blur-xl rounded-xl border border-red-500/30">
                                <div className="text-red-300 font-bold mb-1">❌ שגיאה ביצירת הסרטון</div>
                                <div className="text-red-200/70 text-xs">נסה שוב או שנה את התסריט</div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl p-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">בונה סצנות...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-gray-800">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="תאר את הסרטון שאתה רוצה (הכל אוטומטי)..."
                      className="flex-1 px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none min-h-[80px]"
                      rows={3}
                    />
                    <div className="flex flex-col gap-2 shrink-0">
                      <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFile || loading}
                        size="sm"
                        variant="outline"
                        className="h-[38px] w-[38px] p-0"
                      >
                        {uploadingFile ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        onClick={handleSend}
                        disabled={!input.trim() || loading || uploadingFile}
                        size="sm"
                        className="bg-gradient-to-br from-purple-600 to-pink-600 h-[38px] w-[38px] p-0"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center: Main Display */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 bg-gradient-to-br from-black via-purple-900/10 to-black flex items-center justify-center p-6">
            <div className="text-center max-w-2xl">
              <Video className="w-24 h-24 text-purple-500 mx-auto mb-6 animate-pulse" />
              <h2 className="text-3xl font-bold text-white mb-4">✨ DIGITAL DREAMS</h2>
              <p className="text-gray-300 text-lg mb-6">
                יוצר סרטונים AI בעזרת בינה מלאכותית מתקדמת
              </p>
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                <h3 className="text-white font-bold mb-3">איך זה עובד?</h3>
                <div className="text-right space-y-2 text-gray-300">
                  <p>✨ תאר את הסרטון שאתה רוצה</p>
                  <p>🤖 המערכת תבנה תסריט מקצועי</p>
                  <p>🎬 הסרטונים ייווצרו אוטומטית בצ'אט</p>
                  <p>📥 צפה והורד ישירות</p>
                </div>
              </div>
              {!showChat && (
                <Button
                  onClick={() => setShowChat(true)}
                  className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 text-lg"
                >
                  <MessageSquare className="w-5 h-5 ml-2" />
                  התחל ליצור
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Download History Modal */}
      <DownloadHistory isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}