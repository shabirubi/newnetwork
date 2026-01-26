import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader, Sparkles, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export function MotionCharacterModal({ isOpen, onClose, imageUrl }) {
  const [mode, setMode] = useState("text"); // text or upload
  const [script, setScript] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("he");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [motionIntensity, setMotionIntensity] = useState("medium"); // light, medium, heavy

  const voices = [
    { id: "he", name: "🇮🇱 עברית זכר" },
    { id: "he-female", name: "👱 עברית נקבה" },
    { id: "en", name: "🎤 English Male" },
    { id: "en-female", name: "👩 English Female" },
    { id: "ar", name: "🌍 العربية" },
  ];

  const motionSettings = {
    light: { label: "קל - תנועות עדינות", value: "light" },
    medium: { label: "בינוני - תנועות טבעיות", value: "medium" },
    heavy: { label: "כבד - תנועות דרמטיות", value: "heavy" },
  };

  const handleGenerateMotionVideo = async () => {
    if (!script.trim()) {
      toast.error("אנא הכנס טקסט");
      return;
    }

    if (!imageUrl) {
      toast.error("אנא בחר תמונה");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke("createMotionCharacter", {
        imageUrl,
        script: script.trim(),
        voice: selectedVoice,
        motionIntensity,
      });

      if (response.data?.video_url) {
        setGeneratedVideo({
          url: response.data.video_url,
          duration: response.data.duration,
          script,
        });
        toast.success("✅ דמות מונפשת נוצרה בהצלחה");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("שגיאה ביצירת הדמות");
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
      a.download = `motion-character-${Date.now()}.mp4`;
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
            className="bg-gradient-to-br from-emerald-900/40 to-black border border-emerald-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-emerald-400" />
                דמות בתנועות ריאליסטיות
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
                {/* Script Input */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    🎤 מה הדמות תגיד?
                  </label>
                  <Textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="כתוב את הטקסט שהדמות תדבר עם תנועות גוף טבעיות... (עד 1000 מילים)"
                    className="bg-black/60 border-emerald-500/30 text-white placeholder-white/40 resize-none h-32"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    {script.split(" ").length} מילים
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
                            ? "bg-emerald-600 text-white border border-emerald-400"
                            : "bg-black/60 text-gray-300 border border-emerald-500/30 hover:border-emerald-400"
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Motion Intensity */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    💃 עוצמת התנועות
                  </label>
                  <div className="space-y-2">
                    {Object.values(motionSettings).map((setting) => (
                      <button
                        key={setting.value}
                        onClick={() => setMotionIntensity(setting.value)}
                        className={`w-full p-3 rounded-lg text-sm font-medium transition-all text-left ${
                          motionIntensity === setting.value
                            ? "bg-emerald-600 text-white border border-emerald-400"
                            : "bg-black/60 text-gray-300 border border-emerald-500/30 hover:border-emerald-400"
                        }`}
                      >
                        <input
                          type="radio"
                          checked={motionIntensity === setting.value}
                          onChange={() => setMotionIntensity(setting.value)}
                          className="mr-2"
                        />
                        {setting.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateMotionVideo}
                  disabled={isGenerating || !script.trim() || !imageUrl}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      יוצר דמות מונפשת...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      צור דמות עם תנועות
                    </>
                  )}
                </Button>

                {/* Info */}
                <div className="p-4 bg-emerald-600/20 border border-emerald-500/30 rounded-lg text-xs text-emerald-200">
                  <span className="font-semibold">💡 טיפ:</span> התנועות כוללות:
                  <ul className="mt-2 space-y-1 text-emerald-100">
                    <li>• תנועות ראש וגוף טבעיות</li>
                    <li>• תנועות ידיים וכתפיים</li>
                    <li>• מימיקה פנים תואמת הדיבור</li>
                  </ul>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="relative bg-black rounded-lg overflow-hidden border border-emerald-500/30">
                  <video
                    src={generatedVideo.url}
                    controls
                    autoPlay
                    className="w-full aspect-video bg-black"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-400">משך:</p>
                  <p className="text-white font-semibold">{generatedVideo.duration}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleDownload}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    הורד וידאו
                  </Button>
                  <Button
                    onClick={() => {
                      setGeneratedVideo(null);
                      setScript("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    צור חדש
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