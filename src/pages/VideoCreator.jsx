import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Video, Loader2, Sparkles, Home, Shield, MessageSquare, ChevronRight, Plus, Play, Download, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

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

  // Initialize conversation
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

    // Select first avatar by default
    if (avatars.length > 0) {
      setSelectedAvatar(avatars[0]);
    }
  }, []);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
      setLoading(false);
    });

    return unsubscribe;
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

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('נא להעלות תמונה בפורמט PNG או JPG');
      return;
    }

    // Validate file size (max 5MB for HeyGen)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('התמונה גדולה מדי. מקסימום 5MB');
      return;
    }

    setUploadingFile(true);
    toast.loading('מעלה תמונה ומכין אווטר...', { id: 'upload-file' });

    try {
      // Step 1: Upload image
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      console.log('Uploaded image:', file_url);
      
      // Step 2: Create talking photo avatar from the image
      toast.loading('יוצר talking photo avatar...', { id: 'upload-file' });
      const photoResult = await base44.functions.invoke('createPhotoAvatar', { 
        photo_url: file_url 
      });
      
      if (!photoResult.data?.talking_photo_id) {
        throw new Error('Failed to create talking photo avatar');
      }
      
      console.log('Created talking photo:', photoResult.data);
      
      // Step 3: Send to AI with the talking_photo_id
      const conversation = await base44.agents.getConversation(conversationId);
      
      const context = scenes.length > 0 ? 
        `\n\nסצנות קיימות:\n${scenes.map((s, i) => `${i + 1}. ${s.script || 'ללא סקריפט'} (אווטר: ${s.avatar?.name || 'לא נבחר'})`).join('\n')}` : 
        '';
      
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: (input.trim() || `בנה לי סצנות לסרטון עם האווטר מהתמונה הזו. talking_photo_id: ${photoResult.data.talking_photo_id}`) + context,
        file_urls: [file_url]
      });
      
      setInput('');
      toast.success('האווטר שלך מוכן! 🎬', { id: 'upload-file' });
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
    if (!input.trim() || !conversationId || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    try {
      const conversation = await base44.agents.getConversation(conversationId);
      
      // Add context about current scenes
      const context = scenes.length > 0 ? 
        `\n\nסצנות קיימות:\n${scenes.map((s, i) => `${i + 1}. ${s.script || 'ללא סקריפט'} (אווטר: ${s.avatar?.name || 'לא נבחר'})`).join('\n')}` : 
        '';
      
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: userMessage + context
      });
    } catch (err) {
      console.error(err);
      toast.error("שגיאה בשליחת הודעה");
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
            <h1 className="text-xl font-bold text-white">סטודיו ייצור סרטונים</h1>
            <p className="text-gray-400 text-xs">צור סרטונים בעזרת בינה מלאכותית</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl p-3 text-sm ${
                        msg.role === "user"
                          ? "bg-gray-800 text-white"
                          : "bg-gradient-to-br from-purple-600 to-pink-600 text-white"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {msg.tool_calls?.map((toolCall, i) => (
                        <div key={i} className="mt-3 p-3 bg-black/30 rounded-lg">
                          {toolCall.status === 'completed' && toolCall.results && (() => {
                            try {
                              const result = typeof toolCall.results === 'string' ? JSON.parse(toolCall.results) : toolCall.results;
                              if (result.video_url) {
                                return (
                                  <div className="space-y-2">
                                    <div className="text-xs text-green-300 flex items-center gap-2">
                                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                      סרטון נוצר בהצלחה!
                                    </div>
                                    <video 
                                      src={result.video_url} 
                                      controls 
                                      className="w-full rounded-lg shadow-xl"
                                      autoPlay
                                      playsInline
                                    />
                                  </div>
                                );
                              }
                            } catch (e) {
                              return null;
                            }
                            return null;
                          })()}
                          {toolCall.status === 'in_progress' && (
                            <div className="text-xs text-yellow-300 flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
                              מייצר סרטון...
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
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
                      placeholder="תאר את הסרטון או צרף תמונה..."
                      className="flex-1 px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none min-h-[80px]"
                      rows={3}
                    />
                    <div className="flex flex-col gap-2 shrink-0">
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
              <h2 className="text-3xl font-bold text-white mb-4">🎬 אולפן יצירת סרטונים AI</h2>
              <p className="text-gray-300 text-lg mb-6">
                המערכת תייצר את הסרטונים שלך אוטומטית בצ'אט
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
    </div>
  );
}