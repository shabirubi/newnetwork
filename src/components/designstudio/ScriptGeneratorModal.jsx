import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader, Sparkles, Download, Play, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export function ScriptGeneratorModal({ isOpen, onClose, imageUrl }) {
  const [description, setDescription] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("he");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [generatedScript, setGeneratedScript] = useState(null);
  const [scriptApproved, setScriptApproved] = useState(false);

  const voices = [
    { id: "he", name: "📰 עברית - כתב חדשות (זכר)" },
    { id: "he-female", name: "📰 עברית - כתבת חדשות (נקבה)" },
    { id: "en", name: "📰 English News - Male" },
    { id: "en-female", name: "📰 English News - Female" },
    { id: "ar", name: "🌍 العربية - مذيع أخبار" },
  ];

  const handleGenerateScript = async () => {
    if (!description.trim()) {
      toast.error("אנא הסבר מה יהיה בסרטון");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional video script writer. Create a clear, engaging script based on this description:

${description.trim()}

Requirements:
- Write in Hebrew (עברית)
- Script should be 200-400 words (3-5 minutes when spoken)
- Use clear, simple language
- Include natural pauses and emphasis points
- Make it engaging and informative
- Structure: Opening hook → Main content → Call to action/conclusion

Return ONLY the script text in Hebrew, nothing else.`,
      });

      if (response) {
        setGeneratedScript(response);
        toast.success("✅ סקריפט נוצר בהצלחה");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("שגיאה ביצירת הסקריפט");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!generatedScript) {
      toast.error("אנא צור סקריפט תחילה");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke("createMotionCharacter", {
        imageUrl,
        script: generatedScript,
        voice: selectedVoice,
        motionIntensity: "medium",
      });

      if (response.data?.video_url) {
        setGeneratedVideo({
          url: response.data.video_url,
          duration: response.data.duration,
          script: generatedScript,
        });
        toast.success("✅ הסרטון נוצר בהצלחה");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("שגיאה ביצירת הסרטון");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedVideo) return;
    try {
      const response = await fetch(generatedVideo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `video-${Date.now()}.mp4`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("✅ הווידאו הורד בהצלחה");
    } catch {
      toast.error("שגיאה בהורדה");
    }
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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-cyan-900/40 to-black border border-cyan-500/30 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-cyan-400" />
                יוצר סרטונים חכם
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {!generatedVideo ? (
              <div className="space-y-4">
                {!generatedScript ? (
                  <>
                    {/* Step 1: Description */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        📝 תאר את הסרטון שלך
                      </label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="לדוגמה: 'סרטון שמסביר מה זה בלוקצ'יין בשפה פשוטה' או 'סרטון טיפים למתחילים בתורות הכלכלה' או 'חדשות על מוקד חדש ברוסיה'"
                        className="bg-black/60 border-cyan-500/30 text-white placeholder-white/40 resize-none h-32"
                      />
                      <div className="text-xs text-gray-400 mt-1">
                        {description.split(" ").length} מילים
                      </div>
                    </div>

                    <Button
                      onClick={handleGenerateScript}
                      disabled={isGenerating || !description.trim()}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                    >
                      {isGenerating ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin mr-2" />
                          מחכה ל-AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          צור סקריפט
                        </>
                      )}
                    </Button>

                    <div className="p-4 bg-cyan-600/20 border border-cyan-500/30 rounded-lg text-xs text-cyan-200">
                      <span className="font-semibold">💡 איך זה עובד:</span>
                      <ol className="mt-2 space-y-1 text-cyan-100">
                        <li>1️⃣ תאר מה הסרטון צריך להכיל</li>
                        <li>2️⃣ ה-AI תיצור סקריפט מדויק</li>
                        <li>3️⃣ דמותך תדבר את הסקריפט בתנועות ריאליסטיות</li>
                      </ol>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Step 2: Review Script */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        ✨ הסקריפט שנוצר:
                      </label>
                      <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-4 min-h-40 max-h-60 overflow-y-auto">
                        <p className="text-white leading-relaxed">
                          {generatedScript}
                        </p>
                      </div>
                    </div>

                    {/* Voice Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        🎵 בחר קול
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {voices.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVoice(v.id)}
                            className={`p-2 rounded-lg text-sm font-medium transition-all ${
                              selectedVoice === v.id
                                ? "bg-cyan-600 text-white border border-cyan-400"
                                : "bg-black/60 text-gray-300 border border-cyan-500/30 hover:border-cyan-400"
                            }`}
                          >
                            {v.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setGeneratedScript(null);
                          setDescription("");
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        חזור
                      </Button>
                      <Button
                        onClick={handleGenerateVideo}
                        disabled={isGenerating}
                        className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                      >
                        {isGenerating ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin mr-2" />
                            יוצר סרטון...
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            צור סרטון
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="relative bg-black rounded-lg overflow-hidden border border-cyan-500/30">
                  <video
                    src={generatedVideo.url}
                    controls
                    autoPlay
                    className="w-full aspect-video bg-black"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-400">משך:</p>
                  <p className="text-white font-semibold">
                    {generatedVideo.duration}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleDownload}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    הורד סרטון
                  </Button>
                  <Button
                    onClick={() => {
                      setGeneratedVideo(null);
                      setGeneratedScript(null);
                      setDescription("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    סרטון חדש
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}