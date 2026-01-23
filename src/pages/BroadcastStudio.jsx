import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Mic, Upload, Loader, FileVideo, Image, Type, 
  Sparkles, Zap, Download, ChevronLeft, Eye, Settings, Volume2
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" dir="rtl">
      {/* Compact Header */}
      <div className="bg-black/60 backdrop-blur-lg border-b border-blue-500/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={createPageUrl("Home")}>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">סטודיו שידור</h1>
                  <p className="text-xs text-blue-300">יצירת וידאו AI</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-white text-sm">פעיל</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Single Column Scroll */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
        
        {/* Two Column Section - Avatar + Text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Avatar Upload - Compact */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-black/40 backdrop-blur-lg rounded-xl border border-blue-500/20 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 px-4 py-2 border-b border-blue-500/20">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-blue-400" />
                <h2 className="text-white font-semibold text-sm">תמונת שדרן</h2>
              </div>
            </div>
            <div className="p-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative aspect-square rounded-lg border-2 border-dashed border-blue-500/30 hover:border-blue-500 bg-black/30 hover:bg-black/50 cursor-pointer transition-all flex items-center justify-center group"
              >
                {avatarImage ? (
                  <>
                    <img
                      src={avatarImage}
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Upload className="w-8 h-8 text-blue-400" />
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-10 h-10 text-blue-400 mx-auto mb-2" />
                    <p className="text-white text-sm font-medium">העלה תמונה</p>
                    <p className="text-blue-300/50 text-xs mt-1">PNG, JPG</p>
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

          {/* Settings - Compact */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-black/40 backdrop-blur-lg rounded-xl border border-blue-500/20 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 px-4 py-2 border-b border-blue-500/20">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400" />
                <h2 className="text-white font-semibold text-sm">הגדרות</h2>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-blue-200 text-xs font-medium mb-2">קול</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedVoice("female")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedVoice === "female"
                        ? "bg-blue-600 text-white"
                        : "bg-black/30 text-blue-200 hover:bg-black/50"
                    }`}
                  >
                    נקבה
                  </button>
                  <button
                    onClick={() => setSelectedVoice("male")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedVoice === "male"
                        ? "bg-blue-600 text-white"
                        : "bg-black/30 text-blue-200 hover:bg-black/50"
                    }`}
                  >
                    זכר
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-blue-200 text-xs font-medium mb-2">רקע</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBackgroundType("dynamic")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      backgroundType === "dynamic"
                        ? "bg-blue-600 text-white"
                        : "bg-black/30 text-blue-200 hover:bg-black/50"
                    }`}
                  >
                    דינמי
                  </button>
                  <button
                    onClick={() => setBackgroundType("studio")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      backgroundType === "studio"
                        ? "bg-blue-600 text-white"
                        : "bg-black/30 text-blue-200 hover:bg-black/50"
                    }`}
                  >
                    סטודיו
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Article Text - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/40 backdrop-blur-lg rounded-xl border border-blue-500/20 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 px-4 py-2 border-b border-blue-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-blue-400" />
              <h2 className="text-white font-semibold text-sm">טקסט הכתבה</h2>
            </div>
            <span className="text-blue-300 text-xs">{articleText.length} תווים</span>
          </div>
          <div className="p-4">
            <textarea
              value={articleText}
              onChange={(e) => setArticleText(e.target.value)}
              placeholder="כתוב את הכתבה שלך כאן..."
              className="w-full h-32 bg-black/30 border border-blue-500/20 rounded-lg p-3 text-white text-sm placeholder-blue-300/30 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 resize-none"
              dir="rtl"
            />
          </div>
        </motion.div>

        {/* Generate Button - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Button
            onClick={handleGenerateVideo}
            disabled={loading || !articleText.trim() || !avatarImage}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-5 text-base flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                יוצר וידאו...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                צור וידאו
              </>
            )}
          </Button>
        </motion.div>

        {/* Info - Compact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3"
        >
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-200">
            <span>• וידאו מדובר מתמונה</span>
            <span>• קול AI בעברית</span>
            <span>• רקע מותאם</span>
            <span>• HD איכות</span>
          </div>
        </motion.div>

        {/* Video Preview - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-lg rounded-xl border border-blue-500/20 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 px-4 py-2 border-b border-blue-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <h2 className="text-white font-semibold text-sm">תצוגה מקדימה</h2>
            </div>
            {generatedVideo && <span className="text-green-400 text-xs">✓ מוכן</span>}
          </div>
          <div className="p-4">
            {generatedVideo ? (
              <div className="space-y-3">
                <video
                  src={generatedVideo}
                  controls
                  autoPlay
                  className="w-full aspect-video rounded-lg bg-black"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleReset}
                    size="sm"
                    variant="outline"
                    className="bg-black/50 border-blue-500/30 text-white hover:bg-blue-600/20"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    חדש
                  </Button>
                  <Button
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = generatedVideo;
                      a.download = "broadcast.mp4";
                      a.click();
                    }}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    הורדה
                  </Button>
                </div>
              </div>
            ) : (
              <div className="aspect-video rounded-lg bg-gradient-to-br from-blue-900/20 to-slate-900/20 border-2 border-dashed border-blue-500/20 flex items-center justify-center">
                <div className="text-center">
                  <FileVideo className="w-12 h-12 text-blue-400/40 mx-auto mb-2" />
                  <p className="text-white/70 text-sm">הוידאו יופיע כאן</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}