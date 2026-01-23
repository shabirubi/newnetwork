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
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black" dir="rtl">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-black via-blue-600 to-black border-b border-blue-500/30 sticky top-0 z-50 backdrop-blur-xl shadow-2xl shadow-blue-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl("Home")}>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">סטודיו שידור מקצועי</h1>
                  <p className="text-sm text-blue-200">צור סרטוני חדשות עם AI</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <span className="text-white text-sm font-bold">מערכת פעילה</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-blue-500/30 overflow-hidden shadow-2xl shadow-blue-500/20"
            >
              <div className="bg-gradient-to-r from-black via-blue-600/20 to-black p-4 border-b border-blue-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-400" />
                  <h2 className="text-white font-bold">תצוגה מקדימה</h2>
                </div>
                {generatedVideo && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 text-sm font-bold">✓ מוכן</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                {generatedVideo ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="relative rounded-xl overflow-hidden bg-black">
                      <video
                        src={generatedVideo}
                        controls
                        autoPlay
                        className="w-full aspect-video object-cover"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="bg-black/50 border-blue-500/30 text-white hover:bg-blue-600/20"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        צור וידאו חדש
                      </Button>
                      <Button
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = generatedVideo;
                          a.download = "broadcast.mp4";
                          a.click();
                        }}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        הורד וידאו
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-blue-950/30 to-black border-2 border-dashed border-blue-500/30 flex items-center justify-center">
                    <div className="text-center">
                      <FileVideo className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
                      <h3 className="text-white font-bold text-lg mb-2">הוידאו יופיע כאן</h3>
                      <p className="text-blue-300/70 text-sm">העלה תמונה וכתוב כתבה ליצירת השידור</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Article Text Editor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-blue-500/30 overflow-hidden shadow-2xl shadow-blue-500/20"
            >
              <div className="bg-gradient-to-r from-black via-blue-600/20 to-black p-4 border-b border-blue-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-blue-400" />
                  <h2 className="text-white font-bold">תוכן הכתבה</h2>
                </div>
                <span className="text-blue-300 text-sm">{articleText.length} תווים</span>
              </div>
              <div className="p-6">
                <textarea
                  value={articleText}
                  onChange={(e) => setArticleText(e.target.value)}
                  placeholder="כתוב את הכתבה שלך כאן... ספר את הסיפור בצורה מעניינת ומושכת תשומת לב."
                  className="w-full h-48 bg-black/50 border border-blue-500/30 rounded-xl p-4 text-white text-sm placeholder-blue-300/30 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  dir="rtl"
                />
              </div>
            </motion.div>
          </div>

          {/* Right Panel - Controls */}
          <div className="space-y-6">
            {/* Avatar Upload */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-blue-500/30 overflow-hidden shadow-2xl shadow-blue-500/20"
            >
              <div className="bg-gradient-to-r from-black via-blue-600/20 to-black p-4 border-b border-blue-500/30 flex items-center gap-2">
                <Image className="w-5 h-5 text-blue-400" />
                <h2 className="text-white font-bold">תמונת השדרן</h2>
              </div>
              <div className="p-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-full aspect-square rounded-xl border-2 border-dashed border-blue-500/50 hover:border-blue-500 bg-black/50 hover:bg-black/70 cursor-pointer transition-all flex items-center justify-center group"
                >
                  {avatarImage ? (
                    <>
                      <img
                        src={avatarImage}
                        alt="Avatar"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                          <span className="text-white text-sm font-bold">שנה תמונה</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                      <p className="text-white font-bold text-sm mb-1">העלה תמונת שדרן</p>
                      <p className="text-blue-300/50 text-xs">PNG, JPG</p>
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

            {/* Voice Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-blue-500/30 overflow-hidden shadow-2xl shadow-blue-500/20"
            >
              <div className="bg-gradient-to-r from-black via-blue-600/20 to-black p-4 border-b border-blue-500/30 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-blue-400" />
                <h2 className="text-white font-bold">הגדרות קול</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-blue-200 text-sm font-bold mb-2">מין השדרן</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedVoice("female")}
                      className={`p-3 rounded-xl font-bold text-sm transition-all ${
                        selectedVoice === "female"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-2 border-blue-400"
                          : "bg-black/50 text-blue-200 border border-blue-500/30 hover:bg-black/70"
                      }`}
                    >
                      נקבה
                    </button>
                    <button
                      onClick={() => setSelectedVoice("male")}
                      className={`p-3 rounded-xl font-bold text-sm transition-all ${
                        selectedVoice === "male"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-2 border-blue-400"
                          : "bg-black/50 text-blue-200 border border-blue-500/30 hover:bg-black/70"
                      }`}
                    >
                      זכר
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-bold mb-2">רקע</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setBackgroundType("dynamic")}
                      className={`p-3 rounded-xl font-bold text-sm transition-all ${
                        backgroundType === "dynamic"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-2 border-blue-400"
                          : "bg-black/50 text-blue-200 border border-blue-500/30 hover:bg-black/70"
                      }`}
                    >
                      דינמי
                    </button>
                    <button
                      onClick={() => setBackgroundType("studio")}
                      className={`p-3 rounded-xl font-bold text-sm transition-all ${
                        backgroundType === "studio"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-2 border-blue-400"
                          : "bg-black/50 text-blue-200 border border-blue-500/30 hover:bg-black/70"
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
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={handleGenerateVideo}
                disabled={loading || !articleText.trim() || !avatarImage}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-6 text-lg flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    יוצר וידאו...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    צור וידאו שידור
                  </>
                )}
              </Button>
            </motion.div>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-blue-500/30 overflow-hidden shadow-2xl shadow-blue-500/20"
            >
              <div className="bg-gradient-to-r from-black via-blue-600/20 to-black p-4 border-b border-blue-500/30 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h2 className="text-white font-bold">יכולות המערכת</h2>
              </div>
              <div className="p-6 space-y-3">
                {[
                  "יצירת וידאו מדובר מתמונה סטטית",
                  "קול AI מתקדם בעברית",
                  "רקעים מותאמים אישית",
                  "איכות HD מקצועית",
                  "עיבוד מהיר תוך דקות"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
                    <span className="text-blue-100 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}