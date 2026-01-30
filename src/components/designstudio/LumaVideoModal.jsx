import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wand2, Loader, Download, Film, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import VideoShareButtons from "@/components/shared/VideoShareButtons";

export function LumaVideoModal({ isOpen, onClose, imageUrl }) {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("אנא הזן תיאור לוידאו");
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + 1;
      });
    }, 3000);

    try {
      const response = await base44.functions.invoke('createLumaVideo', {
        prompt: prompt,
        imageUrl: imageUrl || null,
        aspectRatio: aspectRatio,
        loop: false
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.data?.video_url) {
        setGeneratedVideo(response.data);
        toast.success("🎥 הווידאו נוצר בהצלחה!");
      } else {
        toast.error("לא התקבל קישור לוידאו");
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Video generation error:', error);
      toast.error("שגיאה ביצירת הווידאו");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedVideo?.video_url) return;

    try {
      const a = document.createElement('a');
      a.href = generatedVideo.video_url;
      a.download = `luma-video-${Date.now()}.mp4`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("הווידאו הורד בהצלחה");
    } catch (error) {
      toast.error("שגיאה בהורדת הווידאו");
    }
  };

  const handleReset = () => {
    setGeneratedVideo(null);
    setPrompt("");
    setProgress(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Film className="w-6 h-6 text-purple-400" />
                Luma AI - יצירת וידאו
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {!generatedVideo ? (
              <div className="space-y-6">
                {/* Preview Image */}
                {imageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-purple-500/30">
                    <img
                      src={imageUrl}
                      alt="Source"
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-purple-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-semibold">
                      תמונת מקור
                    </div>
                  </div>
                )}

                {/* Prompt Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">
                    📝 תיאור הווידאו
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={imageUrl ? 
                      "לדוגמה: הדמות מסתובבת לאט במעגל, האור מהבהב ברקע..." :
                      "לדוגמה: דרקון זהב עף מעל הרים מושלגים בשקיעה..."
                    }
                    className="bg-black/60 border-purple-500/30 text-white placeholder-white/40 resize-none"
                    rows={4}
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-gray-400">
                    💡 תאר תנועות, אפקטים, ושינויים שתרצה לראות בווידאו
                  </p>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">
                    📐 יחס תצוגה
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "16:9", label: "רחב (16:9)", icon: "🖥️" },
                      { value: "9:16", label: "אנכי (9:16)", icon: "📱" },
                      { value: "1:1", label: "מרובע (1:1)", icon: "⬜" }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setAspectRatio(option.value)}
                        disabled={isGenerating}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          aspectRatio === option.value
                            ? "border-purple-500 bg-purple-500/20 text-white"
                            : "border-purple-500/30 bg-black/40 text-gray-400 hover:border-purple-500/50"
                        }`}
                      >
                        <div className="text-2xl mb-1">{option.icon}</div>
                        <div className="text-xs font-semibold">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-300 font-semibold flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        יוצר וידאו...
                      </span>
                      <span className="text-purple-400 font-mono">{progress}%</span>
                    </div>
                    <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                      ⏱️ זה עשוי לקחת עד 3-5 דקות
                    </p>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-6 rounded-xl text-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      יוצר וידאו...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      צור וידאו AI
                    </>
                  )}
                </Button>

                {/* Tips */}
                <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-4">
                  <p className="text-sm text-purple-200 font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    טיפים ליצירת וידאו מושלם:
                  </p>
                  <ul className="text-xs text-purple-300 space-y-1">
                    <li>• תאר תנועות ספציפיות: "הדמות מסתובבת ימינה", "המצלמה מתקרבת לאט"</li>
                    <li>• הוסף פרטי תאורה: "באור זהוב", "בשקיעה", "תאורה דרמטית"</li>
                    <li>• ציין מהירות: "בתנועה איטית", "במהירות", "בזמן אמת"</li>
                    <li>• תאר אפקטים: "עם עשן ברקע", "גלי אור", "ניצוצות"</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Video Preview */}
                <div className="relative rounded-xl overflow-hidden border border-purple-500/30 bg-black">
                  <video
                    src={generatedVideo.video_url}
                    controls
                    autoPlay
                    loop
                    className="w-full"
                  />
                </div>

                {/* Video Info */}
                <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-4">
                  <p className="text-sm text-white font-semibold mb-2">תיאור הווידאו:</p>
                  <p className="text-sm text-purple-200">{generatedVideo.prompt}</p>
                </div>

                {/* Share Buttons */}
                <div className="flex justify-center">
                  <VideoShareButtons 
                    videoUrl={generatedVideo.video_url}
                    title={`וידאו Luma AI: ${generatedVideo.prompt}`}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleDownload}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    הורד וידאו
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1 border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    צור עוד
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}