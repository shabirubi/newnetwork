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
  const [videoUrl, setVideoUrl] = useState(null);
  const [generating, setGenerating] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch reporters as avatars
  const { data: reporters = [] } = useQuery({
    queryKey: ['reporters'],
    queryFn: () => base44.entities.Reporter.list()
  });

  // Available avatars with images
  const avatars = reporters.map(r => ({
    id: r.id,
    name: r.name,
    image: r.image,
    gender: r.gender,
    type: 'reporter'
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

  // Select first avatar when reporters load
  useEffect(() => {
    if (avatars.length > 0 && !selectedAvatar) {
      setSelectedAvatar(avatars[0]);
    }
  }, [reporters]);

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

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error("נא להזין תיאור לסרטון");
      return;
    }

    if (!selectedAvatar) {
      toast.error("נא לבחור אווטר");
      return;
    }

    setGenerating(true);
    toast.loading("מייצר סרטון...", { id: 'gen-video' });

    try {
      const result = await base44.functions.invoke('generateHeyGenCharacter', {
        script: input.trim(),
        avatar_id: selectedAvatar.id,
        voice_id: '1bd001e7e50f421d891986aad5158bc8'
      });

      if (result.data?.video_url) {
        setVideoUrl(result.data.video_url);
        toast.success("הסרטון נוצר בהצלחה! 🎬", { id: 'gen-video' });
        
        // Send to main player
        window.dispatchEvent(new CustomEvent('playVideo', {
          detail: {
            url: result.data.video_url,
            title: `סרטון AI - ${selectedAvatar.name}`,
            autoPlay: true
          }
        }));
      } else {
        toast.error("שגיאה ביצירת הסרטון", { id: 'gen-video' });
      }
    } catch (err) {
      console.error('Generation failed:', err);
      toast.error(`שגיאה: ${err.message}`, { id: 'gen-video' });
    } finally {
      setGenerating(false);
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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-5xl">
          {!videoUrl ? (
            /* Creation Interface - HeyGen Style */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Title */}
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-2">
                  Turn your ideas into production-ready video
                </h2>
                <p className="text-gray-400">תאר את הרעיון שלך והבינה המלאכותית תבנה את הסרטון</p>
              </div>

              {/* Selected Avatar Display */}
              {selectedAvatar && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl border border-purple-500/30"
                >
                  <img
                    src={selectedAvatar.image}
                    alt={selectedAvatar.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
                  />
                  <div>
                    <p className="text-white font-bold">{selectedAvatar.name}</p>
                    <p className="text-purple-300 text-sm">האווטר הנבחר</p>
                  </div>
                </motion.div>
              )}

              {/* Input Area */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <Wand2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) {
                          e.preventDefault();
                          handleGenerate();
                        }
                      }}
                      placeholder="תאר את הסרטון שלך... למשל: 'צור סרטון על חדשות הטכנולוגיה האחרונות'"
                      className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none min-h-[120px] text-lg"
                    />
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4 text-gray-500" />
                        <Sparkles className="w-4 h-4 text-gray-500" />
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                      </div>
                      
                      <Button
                        onClick={handleGenerate}
                        disabled={generating || !input.trim() || !selectedAvatar}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2 px-6"
                      >
                        {generating ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            מייצר...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            צור סרטון
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Choose an Avatar Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white text-xl font-bold">Choose an Avatar</h3>
                  <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                    More Avatars <ChevronRight className="w-4 h-4 mr-1" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {avatars.map((avatar) => (
                    <motion.div
                      key={avatar.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                        selectedAvatar?.id === avatar.id
                          ? "border-purple-500 shadow-lg shadow-purple-500/50"
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <img
                        src={avatar.image}
                        alt={avatar.name}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="bg-gray-900 p-2 text-center">
                        <p className="text-white text-xs font-medium truncate">{avatar.name}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* AI Chat Helper - Collapsible */}
              {messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-gray-900/50 rounded-2xl border border-gray-700 p-4 max-h-96 overflow-y-auto"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    <h4 className="text-white font-bold">עוזר AI</h4>
                  </div>
                  
                  <div className="space-y-3">
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
                          <span className="text-sm">חושב...</span>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Video Result */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">הסרטון שלך מוכן! 🎬</h2>
                <p className="text-gray-400">הסרטון נוצר בהצלחה ונשלח לנגן הראשי</p>
              </div>

              <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-purple-500/30">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full aspect-video"
                />
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={() => {
                    setVideoUrl(null);
                    setInput("");
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
                >
                  <Plus className="w-5 h-5" />
                  צור סרטון חדש
                </Button>
                
                <a href={videoUrl} download target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    <Download className="w-5 h-5" />
                    הורד
                  </Button>
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}