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
  const [scenes, setScenes] = useState([]);
  const [generating, setGenerating] = useState(false);
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
      
      // Parse AI response to extract scenes
      const lastMessage = data.messages?.[data.messages.length - 1];
      if (lastMessage?.role === 'assistant' && lastMessage.content) {
        tryParseScenes(lastMessage.content);
      }
    });

    return unsubscribe;
  }, [conversationId]);

  const tryParseScenes = (content) => {
    // Try to extract scenes from AI response
    const scenePattern = /סצנה\s*(\d+)[:\s]*(.+?)(?=סצנה\s*\d+|$)/gis;
    const matches = [...content.matchAll(scenePattern)];
    
    if (matches.length > 0) {
      const newScenes = matches.map((match, idx) => ({
        id: Date.now() + idx,
        script: match[2].trim(),
        avatar: selectedAvatar || avatars[0],
        videoUrl: null,
        duration: 0
      }));
      
      if (newScenes.length > 0) {
        setScenes(newScenes);
        toast.success(`${newScenes.length} סצנות נוצרו!`);
      }
    }
  };

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
    toast.loading('מעלה תמונה...', { id: 'upload-file' });

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      console.log('Uploaded image:', file_url);
      
      const conversation = await base44.agents.getConversation(conversationId);
      
      const context = scenes.length > 0 ? 
        `\n\nסצנות קיימות:\n${scenes.map((s, i) => `${i + 1}. ${s.script || 'ללא סקריפט'} (אווטר: ${s.avatar?.name || 'לא נבחר'})`).join('\n')}` : 
        '';
      
      // Send to AI with image
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: (input.trim() || 'בנה לי סצנות לסרטון לפי התמונה הזו. השתמש בתמונה שצירפתי כאווטר לסרטון') + context,
        file_urls: [file_url]
      });
      
      setInput('');
      toast.success('התמונה נשלחה בהצלחה!', { id: 'upload-file' });
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

  const generateScene = async (sceneIndex) => {
    const scene = scenes[sceneIndex];
    if (!scene.avatar) {
      toast.error("נא לבחור אווטר לסצנה");
      return;
    }

    setGenerating(true);
    toast.loading(`מייצר סצנה ${sceneIndex + 1}...`, { id: `gen-${sceneIndex}` });

    try {
      const result = await base44.functions.invoke('generateHeyGenCharacter', {
        script: scene.script,
        avatar_id: scene.avatar.id,
        voice_id: '1bd001e7e50f421d891986aad5158bc8'
      });

      if (result.data?.video_url) {
        const newScenes = [...scenes];
        newScenes[sceneIndex] = {
          ...scene,
          videoUrl: result.data.video_url,
          duration: result.data.duration || 10
        };
        setScenes(newScenes);
        toast.success(`סצנה ${sceneIndex + 1} נוצרה! 🎬`, { id: `gen-${sceneIndex}` });
      } else {
        toast.error("שגיאה ביצירת הסצנה", { id: `gen-${sceneIndex}` });
      }
    } catch (err) {
      console.error('Generation failed:', err);
      toast.error(`שגיאה: ${err.message}`, { id: `gen-${sceneIndex}` });
    } finally {
      setGenerating(false);
    }
  };

  const generateAllScenes = async () => {
    for (let i = 0; i < scenes.length; i++) {
      if (scenes[i].script.trim()) {
        await generateScene(i);
      }
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
                      {msg.content}
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

        {/* Center: Timeline */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {scenes.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <Video className="w-24 h-24 text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">אין סצנות עדיין</h2>
                <p className="text-gray-400 mb-4">השתמש בצ'אט מימין כדי ליצור סצנות</p>
                <Button
                  onClick={() => setShowChat(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <MessageSquare className="w-4 h-4 ml-2" />
                  פתח צ'אט
                </Button>
              </div>
            </div>
          ) : (
            /* Timeline with Scenes */
            <>
              {/* Preview Area */}
              <div className="flex-1 bg-black/20 flex items-center justify-center p-6">
                {scenes.find(s => s.videoUrl) ? (
                  <video
                    src={scenes.find(s => s.videoUrl)?.videoUrl}
                    controls
                    className="max-w-4xl w-full rounded-xl shadow-2xl"
                  />
                ) : (
                  <div className="text-center">
                    <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">הסרטונים יופיעו כאן לאחר היצירה</p>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="bg-gradient-to-b from-gray-900 to-black border-t border-gray-800 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold">ציר זמן ({scenes.length} סצנות)</h3>
                  <Button
                    onClick={generateAllScenes}
                    disabled={generating}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    {generating ? (
                      <><Loader2 className="w-4 h-4 animate-spin ml-2" />מייצר...</>
                    ) : (
                      <><Play className="w-4 h-4 ml-2" />צור את כל הסצנות</>
                    )}
                  </Button>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2">
                  {scenes.map((scene, idx) => (
                    <div
                      key={scene.id}
                      className="min-w-[200px] bg-gray-800 rounded-xl overflow-hidden border border-gray-700"
                    >
                      <div className="relative h-32 bg-gray-900 flex items-center justify-center">
                        {scene.videoUrl ? (
                          <video src={scene.videoUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center">
                            {scene.avatar && (
                              <img
                                src={scene.avatar.image}
                                alt={scene.avatar.name}
                                className="w-16 h-16 rounded-full mx-auto mb-2 opacity-40"
                              />
                            )}
                            <p className="text-gray-500 text-xs">לא נוצר</p>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-white text-xs">
                          #{idx + 1}
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-white text-sm line-clamp-2 mb-2">{scene.script}</p>
                        {!scene.videoUrl && (
                          <Button
                            onClick={() => generateScene(idx)}
                            disabled={generating}
                            size="sm"
                            className="w-full bg-purple-600"
                          >
                            <Sparkles className="w-3 h-3 ml-1" />
                            צור
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}