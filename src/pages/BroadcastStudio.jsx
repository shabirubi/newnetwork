import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, Upload, Send, Loader, Video, Settings, Radio, 
  Play, Pause, Volume2, FileVideo, Image, Type, 
  Sparkles, Zap, Download, X, ChevronLeft, Eye
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function BroadcastStudio() {
  const [avatarImage, setAvatarImage] = useState(null);
  const [articleText, setArticleText] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState("female");
  const [backgroundType, setBackgroundType] = useState("dynamic");
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = response.file_url;
      const cleanUrl = fileUrl.includes('?') ? fileUrl.split('?')[0] : fileUrl;
      setAvatarImage(cleanUrl);
      toast.success("התמונה הועלתה בהצלחה ✓");
    } catch (error) {
      toast.error("שגיאה בהעלאת התמונה");
    }
  };

  const handleGenerateVideo = async () => {
    if (!articleText.trim()) {
      toast.error("אנא כתוב כתבה");
      return;
    }

    if (!avatarImage) {
      toast.error("אנא העלה תמונה של השדרן");
      return;
    }

    setLoading(true);
    toast.loading("יוצר וידאו... זה עלול להימשך דקה או שתיים ⏳", {
      id: "video-gen",
    });

    try {
      const response = await base44.functions.invoke("generateTalkingVideo", {
        text: articleText,
        avatarUrl: avatarImage,
        gender: selectedVoice,
        voiceProvider: "elevenlabs",
        backgroundType: backgroundType,
        language: "he",
      });

      const videoUrl = response.data?.video_url;
      if (videoUrl) {
        setGeneratedVideo(videoUrl);
        toast.success("הוידאו מוכן! 🎥", { id: "video-gen" });
      } else {
        throw new Error("לא התקבל וידאו");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMsg = error.response?.data?.error || error.message;
      toast.error("שגיאה: " + errorMsg, { id: "video-gen" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setGeneratedVideo(null);
    setArticleText("");
    setAvatarImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-purple-900" dir="rtl">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-blue-500/30 sticky top-0 z-50">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl("Home")}>
                <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              </Link>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">סטודיו שידור</h1>
                  <p className="text-lg text-blue-200">צור וידאו חדשות מקצועי</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left - Video Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/60 backdrop-blur-xl rounded-3xl border-2 border-blue-500/40 overflow-hidden shadow-2xl"
          >
            <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 p-6 border-b border-blue-500/30">
              <div className="flex items-center gap-3">
                <Eye className="w-7 h-7 text-blue-300" />
                <h2 className="text-2xl font-bold text-white">תצוגה מקדימה</h2>
              </div>
            </div>

            <div className="p-8">
              {generatedVideo ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl">
                    <video
                      src={generatedVideo}
                      controls
                      autoPlay
                      className="w-full aspect-video object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={handleReset}
                      size="lg"
                      variant="outline"
                      className="bg-black/50 border-2 border-blue-500/50 text-white hover:bg-blue-600/30 h-14 text-lg"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      וידאו חדש
                    </Button>
                    <Button
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = generatedVideo;
                        a.download = "broadcast.mp4";
                        a.click();
                      }}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-14 text-lg"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      הורדה
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-4 border-dashed border-blue-500/30 flex items-center justify-center">
                  <div className="text-center px-6">
                    <FileVideo className="w-24 h-24 text-blue-400/50 mx-auto mb-6" />
                    <h3 className="text-white font-bold text-2xl mb-3">הוידאו שלך יופיע כאן</h3>
                    <p className="text-blue-300/70 text-lg">העלה תמונה וכתוב כתבה</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right - Controls */}
          <div className="space-y-8">
            {/* Avatar Upload */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/60 backdrop-blur-xl rounded-3xl border-2 border-blue-500/40 overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 p-6 border-b border-blue-500/30">
                <div className="flex items-center gap-3">
                  <Image className="w-7 h-7 text-blue-300" />
                  <h2 className="text-2xl font-bold text-white">תמונת השדרן</h2>
                </div>
              </div>
              <div className="p-8">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-full aspect-square rounded-2xl border-4 border-dashed border-blue-500/50 hover:border-blue-500 bg-black/50 hover:bg-black/70 cursor-pointer transition-all flex items-center justify-center group"
                >
                  {avatarImage ? (
                    <>
                      <img
                        src={avatarImage}
                        alt="Avatar"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                        <div className="text-center">
                          <Upload className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                          <span className="text-white text-xl font-bold">שנה תמונה</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-8">
                      <Upload className="w-20 h-20 text-blue-400 mx-auto mb-4" />
                      <p className="text-white font-bold text-xl mb-2">העלה תמונת שדרן</p>
                      <p className="text-blue-300/70 text-lg">PNG, JPG, JPEG</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </motion.div>

            {/* Article Text */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-black/60 backdrop-blur-xl rounded-3xl border-2 border-blue-500/40 overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 p-6 border-b border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Type className="w-7 h-7 text-blue-300" />
                    <h2 className="text-2xl font-bold text-white">טקסט הכתבה</h2>
                  </div>
                  <span className="text-blue-300 text-lg font-bold">{articleText.length} תווים</span>
                </div>
              </div>
              <div className="p-8">
                <textarea
                  value={articleText}
                  onChange={(e) => setArticleText(e.target.value)}
                  placeholder="כתוב את הכתבה שלך כאן... ספר את הסיפור בצורה מעניינת ומושכת."
                  className="w-full h-64 bg-black/50 border-2 border-blue-500/30 rounded-2xl p-6 text-white text-lg placeholder-blue-300/30 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 resize-none"
                  dir="rtl"
                />
              </div>
            </motion.div>

            {/* Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/60 backdrop-blur-xl rounded-3xl border-2 border-blue-500/40 overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 p-6 border-b border-blue-500/30">
                <div className="flex items-center gap-3">
                  <Settings className="w-7 h-7 text-blue-300" />
                  <h2 className="text-2xl font-bold text-white">הגדרות</h2>
                </div>
              </div>
              <div className="p-8 space-y-8">
                <div>
                  <label className="block text-blue-200 text-xl font-bold mb-4">קול השדרן</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setSelectedVoice("female")}
                      className={`p-6 rounded-2xl font-bold text-lg transition-all ${
                        selectedVoice === "female"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-4 border-blue-300"
                          : "bg-black/50 text-blue-200 border-2 border-blue-500/30 hover:bg-black/70"
                      }`}
                    >
                      נקבה
                    </button>
                    <button
                      onClick={() => setSelectedVoice("male")}
                      className={`p-6 rounded-2xl font-bold text-lg transition-all ${
                        selectedVoice === "male"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-4 border-blue-300"
                          : "bg-black/50 text-blue-200 border-2 border-blue-500/30 hover:bg-black/70"
                      }`}
                    >
                      זכר
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-blue-200 text-xl font-bold mb-4">סוג רקע</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setBackgroundType("dynamic")}
                      className={`p-6 rounded-2xl font-bold text-lg transition-all ${
                        backgroundType === "dynamic"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-4 border-blue-300"
                          : "bg-black/50 text-blue-200 border-2 border-blue-500/30 hover:bg-black/70"
                      }`}
                    >
                      דינמי
                    </button>
                    <button
                      onClick={() => setBackgroundType("studio")}
                      className={`p-6 rounded-2xl font-bold text-lg transition-all ${
                        backgroundType === "studio"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-4 border-blue-300"
                          : "bg-black/50 text-blue-200 border-2 border-blue-500/30 hover:bg-black/70"
                      }`}
                    >
                      סטודיו
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Generate Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={handleGenerateVideo}
                disabled={loading || !articleText.trim() || !avatarImage}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white font-bold py-8 text-2xl flex items-center justify-center gap-4 shadow-2xl shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-3xl"
              >
                {loading ? (
                  <>
                    <Loader className="w-8 h-8 animate-spin" />
                    יוצר וידאו...
                  </>
                ) : (
                  <>
                    <Zap className="w-8 h-8" />
                    צור וידאו שידור
                  </>
                )}
              </Button>
            </motion.div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}