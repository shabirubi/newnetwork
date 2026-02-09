import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Send, Video, Loader2, Sparkles, Download, Play, Plus, Trash2, MessageSquare, Layout, User, Settings, ChevronLeft, ChevronRight, Home, Film, Users, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";

export default function VideoCreator() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [activeTab, setActiveTab] = useState("editor");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentScene, setCurrentScene] = useState(0);
  const [generating, setGenerating] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch reporters
  const { data: reporters = [] } = useQuery({
    queryKey: ['reporters'],
    queryFn: () => base44.entities.Reporter.list()
  });

  // Scene management
  const [scenes, setScenes] = useState([
    {
      id: 1,
      avatar: "Kristin_public_3_20240108",
      avatarName: "Kristin",
      script: "",
      videoUrl: null,
      thumbnail: "https://img.heygen.ai/avatars/Kristin_public_3_20240108.png",
      isReporter: false
    }
  ]);

  // Available avatars - combine HeyGen and our reporters
  const avatars = [
    { id: "Kristin_public_3_20240108", name: "Kristin", image: "https://img.heygen.ai/avatars/Kristin_public_3_20240108.png", isReporter: false },
    { id: "Wayne_20240711", name: "Wayne", image: "https://img.heygen.ai/avatars/Wayne_20240711.png", isReporter: false },
    { id: "Angela_public_3_20240108", name: "Angela", image: "https://img.heygen.ai/avatars/Angela_public_3_20240108.png", isReporter: false },
    { id: "josh_lite3_20230714", name: "Josh", image: "https://img.heygen.ai/avatars/josh_lite3_20230714.png", isReporter: false },
    ...reporters.map(r => ({ 
      id: r.id, 
      name: r.name, 
      image: r.image, 
      isReporter: true,
      gender: r.gender,
      specialty: r.specialty
    }))
  ];

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

  const addScene = () => {
    setScenes([...scenes, {
      id: Date.now(),
      avatar: "Kristin_public_3_20240108",
      avatarName: "Kristin",
      script: "",
      videoUrl: null,
      thumbnail: "https://img.heygen.ai/avatars/Kristin_public_3_20240108.png"
    }]);
    setCurrentScene(scenes.length);
  };

  const deleteScene = (index) => {
    if (scenes.length === 1) {
      toast.error("חייב להישאר לפחות סצנה אחת");
      return;
    }
    const newScenes = scenes.filter((_, i) => i !== index);
    setScenes(newScenes);
    if (currentScene >= newScenes.length) {
      setCurrentScene(newScenes.length - 1);
    }
  };

  const updateScene = (index, field, value) => {
    const newScenes = [...scenes];
    newScenes[index][field] = value;
    if (field === "avatar") {
      const avatar = avatars.find(a => a.id === value);
      newScenes[index].avatarName = avatar?.name || "";
      newScenes[index].thumbnail = avatar?.image || "";
    }
    setScenes(newScenes);
  };

  const generateScene = async (index) => {
    const scene = scenes[index];
    if (!scene.script.trim()) {
      toast.error("נא להזין סקריפט לסצנה");
      return;
    }

    setGenerating(true);
    try {
      const result = await base44.functions.invoke("generateHeyGenCharacter", {
        script: scene.script
      });

      if (result.data?.video_url) {
        updateScene(index, "videoUrl", result.data.video_url);
        toast.success("הסרטון נוצר בהצלחה!");
      } else {
        toast.error("שגיאה ביצירת הסרטון");
      }
    } catch (err) {
      console.error(err);
      toast.error("שגיאה ביצירת הסרטון");
    } finally {
      setGenerating(false);
    }
  };

  const generateAllScenes = async () => {
    setGenerating(true);
    for (let i = 0; i < scenes.length; i++) {
      if (scenes[i].script.trim()) {
        await generateScene(i);
      }
    }
    setGenerating(false);
    toast.success("כל הסצנות נוצרו!");
  };

  const tabs = [
    { id: "editor", label: "עורך סצנות", icon: Film },
    { id: "avatars", label: "אווטרים וכתבים", icon: Users },
    { id: "chat", label: "עוזר AI", icon: MessageSquare },
    { id: "settings", label: "הגדרות", icon: Settings }
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-black/40 backdrop-blur-xl border-l border-gray-800 flex flex-col"
          >
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E31E24] to-[#B91C1C] flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">מחולל סרטונים</h1>
                  <p className="text-gray-400 text-xs">עורך מקצועי</p>
                </div>
              </div>
              <Link to={createPageUrl("Home")}>
                <Button variant="outline" className="w-full gap-2">
                  <Home className="w-4 h-4" />
                  חזרה לאתר
                </Button>
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-[#E31E24] to-[#B91C1C] text-white"
                        : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-gray-800">
              <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                <p className="text-white text-sm font-bold mb-1">סצנות: {scenes.length}</p>
                <p className="text-gray-400 text-xs">מוכן: {scenes.filter(s => s.videoUrl).length}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-black/50 backdrop-blur-xl border-b border-gray-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <Layout className="w-4 h-4" />
              {sidebarOpen ? "הסתר תפריט" : "הצג תפריט"}
            </Button>
            <div className="h-6 w-px bg-gray-700 mx-2" />
            <h2 className="text-white font-bold">{tabs.find(t => t.id === activeTab)?.label}</h2>
          </div>
          <Button
            onClick={generateAllScenes}
            disabled={generating || scenes.every(s => !s.script.trim())}
            className="bg-gradient-to-br from-[#E31E24] to-[#B91C1C] gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                מייצר...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                צור סרטון
              </>
            )}
          </Button>
        </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "editor" && (
          <div className="h-full flex overflow-hidden">
            {/* Left Panel - Scenes List */}
            <div className="w-80 bg-black/30 border-l border-gray-800 flex flex-col overflow-hidden">
              {/* Scenes List */}
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold">סצנות</h3>
                  <Button
                    onClick={addScene}
                    size="sm"
                    variant="outline"
                    className="gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    הוסף
                  </Button>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {scenes.map((scene, idx) => (
                    <div
                      key={scene.id}
                      onClick={() => setCurrentScene(idx)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        currentScene === idx
                          ? "bg-[#E31E24]/20 border border-[#E31E24]"
                          : "bg-gray-800/50 border border-gray-700 hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={scene.thumbnail}
                          alt={scene.avatarName}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium">סצנה {idx + 1}</p>
                          <p className="text-gray-400 text-xs truncate">{scene.avatarName}</p>
                        </div>
                        {scenes.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteScene(idx);
                            }}
                            className="p-1 hover:bg-red-500/20 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scene Editor */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">בחר אווטר / כתב</label>
                  <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                    {avatars.slice(0, 4).map((avatar) => (
                      <div
                        key={avatar.id}
                        onClick={() => updateScene(currentScene, "avatar", avatar.id)}
                        className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          scenes[currentScene]?.avatar === avatar.id
                            ? "border-[#E31E24]"
                            : "border-gray-700 hover:border-gray-600"
                        }`}
                      >
                        <img
                          src={avatar.image}
                          alt={avatar.name}
                          className="w-full aspect-square object-cover"
                        />
                        <p className="text-white text-xs text-center py-1 bg-gray-900">{avatar.name}</p>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => setActiveTab("avatars")}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 gap-2"
                  >
                    <Users className="w-4 h-4" />
                    עוד אווטרים וכתבים
                  </Button>
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">סקריפט</label>
                  <Textarea
                    value={scenes[currentScene]?.script || ""}
                    onChange={(e) => updateScene(currentScene, "script", e.target.value)}
                    placeholder="מה האווטר יגיד בסצנה הזו..."
                    className="min-h-[150px] bg-gray-900 border-gray-700 text-white"
                  />
                </div>

                <Button
                  onClick={() => generateScene(currentScene)}
                  disabled={generating || !scenes[currentScene]?.script.trim()}
                  className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                      מייצר סצנה...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 ml-2" />
                      צור סצנה זו
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Center Panel - Preview */}
            <div className="flex-1 bg-black/20 flex flex-col items-center justify-center p-8">
              {scenes[currentScene]?.videoUrl ? (
                <div className="w-full max-w-3xl">
                  <video
                    key={scenes[currentScene].videoUrl}
                    src={scenes[currentScene].videoUrl}
                    controls
                    className="w-full rounded-xl shadow-2xl"
                  />
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = scenes[currentScene].videoUrl;
                        a.download = `scene-${currentScene + 1}.mp4`;
                        a.click();
                      }}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      הורד סצנה
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <Video className="w-16 h-16 text-gray-600" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">תצוגה מקדימה</h3>
                  <p className="text-gray-400">הסרטון יופיע כאן לאחר היצירה</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Avatars & Reporters Tab */}
        {activeTab === "avatars" && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">כל האווטרים והכתבים</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {avatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    onClick={() => {
                      updateScene(currentScene, "avatar", avatar.id);
                      setActiveTab("editor");
                    }}
                    className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                      scenes[currentScene]?.avatar === avatar.id
                        ? "border-[#E31E24] shadow-lg shadow-[#E31E24]/50"
                        : "border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <img
                      src={avatar.image}
                      alt={avatar.name}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-3 bg-gray-900">
                      <p className="text-white text-sm font-bold">{avatar.name}</p>
                      {avatar.isReporter && avatar.specialty && (
                        <p className="text-gray-400 text-xs mt-1">{avatar.specialty}</p>
                      )}
                      {avatar.isReporter && (
                        <span className="inline-block mt-2 px-2 py-1 bg-[#E31E24] text-white text-xs rounded">
                          כתב שלנו
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Chat Tab */}
        {activeTab === "chat" && (
          <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <Sparkles className="w-16 h-16 text-[#E31E24] mx-auto mb-4" />
                    <h3 className="text-white text-xl font-bold mb-2">עוזר AI מקצועי</h3>
                    <p className="text-gray-400">שאל אותי כל שאלה על יצירת הסרטון שלך</p>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.role === "user"
                          ? "bg-gray-800 text-white"
                          : "bg-gradient-to-br from-[#E31E24] to-[#B91C1C] text-white"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-br from-[#E31E24] to-[#B91C1C] text-white rounded-2xl p-4 flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>חושב...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-6 border-t border-gray-800">
              <div className="max-w-4xl mx-auto flex gap-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="שאל שאלה על יצירת סרטון..."
                  className="flex-1 min-h-[60px] bg-gray-900 border-gray-700 text-white resize-none"
                  disabled={loading || !conversationId}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || loading || !conversationId}
                  className="bg-gradient-to-br from-[#E31E24] to-[#B91C1C] h-[60px] px-6"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">הגדרות</h2>
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-white font-bold mb-2">הגדרות פרויקט</h3>
                  <p className="text-gray-400 text-sm">בקרוב...</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}