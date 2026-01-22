import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, Upload, Send, Loader } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function BroadcastStudio({ isOpen, onClose }) {
  const [avatarImage, setAvatarImage] = useState(null);
  const [articleText, setArticleText] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await base44.integrations.Core.UploadFile({ file });
      setAvatarImage(response.file_url);
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
        gender: "female",
        voiceProvider: "elevenlabs",
        backgroundType: "dynamic",
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
      toast.error("שגיאה ביצירת הוידאו", { id: "video-gen" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAvatarImage(null);
    setArticleText("");
    setGeneratedVideo(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[50] p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-gray-900 to-black rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-blue-500/30"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-black via-blue-600 to-black text-white p-6 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Mic className="w-6 h-6" />
                <h2 className="font-bold text-xl">סטודיו שידור</h2>
              </div>
              <button
                onClick={handleClose}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Generated Video Display */}
              {generatedVideo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black rounded-lg overflow-hidden"
                >
                  <video
                    src={generatedVideo}
                    controls
                    autoPlay
                    className="w-full aspect-video object-cover"
                  />
                  <div className="p-4 bg-blue-600/20 border-t border-blue-500/30">
                    <p className="text-white/80 text-sm mb-3">וידאו השידור מוכן!</p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          setGeneratedVideo(null);
                          setArticleText("");
                          setAvatarImage(null);
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        צור וידאו חדש
                      </Button>
                      <Button
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = generatedVideo;
                          a.download = "broadcast.mp4";
                          a.click();
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        הורד וידאו
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {!generatedVideo && (
                <>
                  {/* Avatar Image Upload */}
                  <div className="space-y-3">
                    <label className="block text-white font-bold text-sm">
                      תמונת השדרן
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-full aspect-square rounded-lg border-2 border-dashed border-blue-500/50 hover:border-blue-500 bg-black/50 hover:bg-black/70 cursor-pointer transition-all flex items-center justify-center group"
                    >
                      {avatarImage ? (
                        <>
                          <img
                            src={avatarImage}
                            alt="Avatar"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              שנה תמונה
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                          <p className="text-white font-bold">העלה תמונה</p>
                          <p className="text-white/50 text-xs mt-1">
                            PNG, JPG - עד 5MB
                          </p>
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

                  {/* Article Text Input */}
                  <div className="space-y-3">
                    <label className="block text-white font-bold text-sm">
                      כתוב כתבה
                    </label>
                    <textarea
                      value={articleText}
                      onChange={(e) => setArticleText(e.target.value)}
                      placeholder="כתוב את הכתבה שלך כאן... השדרן יקרא אותה בשידור חי"
                      className="w-full h-40 bg-black/50 border border-blue-500/30 rounded-lg p-4 text-white placeholder-white/30 focus:border-blue-500 focus:outline-none resize-none"
                    />
                    <p className="text-white/50 text-xs">
                      {articleText.length} תווים
                    </p>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerateVideo}
                    disabled={loading || !articleText.trim() || !avatarImage}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        יוצר וידאו...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        צור וידאו שידור
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}