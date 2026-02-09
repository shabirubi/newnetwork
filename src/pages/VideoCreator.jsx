import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Send, Video, Loader2, Sparkles, Download, Plus, Trash2, MessageSquare, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function VideoCreator() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showChat, setShowChat] = useState(true);
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
      thumbnail: "https://img.heygen.ai/avatars/Kristin_public_3_20240108.png"
    }
  ]);

  // Available avatars - combine HeyGen and our reporters
  const avatars = [
    { id: "Kristin_public_3_20240108", name: "Kristin", image: "https://img.heygen.ai/avatars/Kristin_public_3_20240108.png" },
    { id: "Wayne_20240711", name: "Wayne", image: "https://img.heygen.ai/avatars/Wayne_20240711.png" },
    { id: "Angela_public_3_20240108", name: "Angela", image: "https://img.heygen.ai/avatars/Angela_public_3_20240108.png" },
    { id: "josh_lite3_20230714", name: "Josh", image: "https://img.heygen.ai/avatars/josh_lite3_20230714.png" },
    ...reporters.map(r => ({ 
      id: r.id, 
      name: r.name, 
      image: r.image, 
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

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-[#E31E24]/30 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E31E24] to-[#B91C1C] flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">מחולל סרטונים AI</h1>
            <p className="text-gray-400 text-xs">צור סרטונים מקצועיים עם אווטרים מדברים</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={createPageUrl("Home")}>
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="w-4 h-4" />
              חזרה לאתר
            </Button>
          </Link>
          <Button
            onClick={() => setShowChat(!showChat)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            {showChat ? "הסתר צ'אט" : "הצג צ'אט"}
          </Button>
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
                צור את כל הסרטון
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content - 3 Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Scenes & Settings */}
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
              <label className="text-white text-sm font-medium mb-2 block">בחר אווטר</label>
              <div className="grid grid-cols-2 gap-2">
                {avatars.map((avatar) => (
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

        {/* Right Panel - AI Chat */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 384, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="w-96 bg-black/30 border-r border-gray-800 flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  עוזר AI
                </h3>
                <p className="text-gray-400 text-xs mt-1">שאל אותי כל שאלה על יצירת הסרטון</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-[#E31E24] mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">שלום! איך אוכל לעזור לך לייצר את הסרטון?</p>
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
                          : "bg-gradient-to-br from-[#E31E24] to-[#B91C1C] text-white"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-br from-[#E31E24] to-[#B91C1C] text-white rounded-xl p-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">חושב...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-gray-800">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="שאל שאלה..."
                    className="bg-gray-900 border-gray-700 text-white"
                    disabled={loading || !conversationId}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || loading || !conversationId}
                    size="sm"
                    className="bg-gradient-to-br from-[#E31E24] to-[#B91C1C]"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}