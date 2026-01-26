import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader, Mic, Play, Download, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export function VoiceOverModal({ isOpen, onClose, imageUrl, designTitle = "Design" }) {
  const [script, setScript] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("en");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);

  const voices = [
    { id: "en", name: "🎤 English Male", lang: "en" },
    { id: "en-female", name: "👩 English Female", lang: "en" },
    { id: "he", name: "🇮🇱 עברית זכר", lang: "he" },
    { id: "he-female", name: "👱 עברית נקבה", lang: "he" },
    { id: "es", name: "🇪🇸 Spanish", lang: "es" },
    { id: "fr", name: "🇫🇷 French", lang: "fr" },
    { id: "de", name: "🇩🇪 German", lang: "de" },
    { id: "it", name: "🇮🇹 Italian", lang: "it" },
  ];

  const handleGenerateVoiceOver = async () => {
    if (!script.trim()) {
      toast.error("אנא הזן טקסט");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke("createTalkingAvatarVideo", {
        imageUrl,
        script,
        voice: selectedVoice,
        title: designTitle,
      });

      if (response.data?.video_url) {
        setGeneratedVideo({
          url: response.data.video_url,
          duration: "זמן משתנה",
        });
        toast.success("✅ דמות דוברת נוצרה בהצלחה");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("שגיאה ביצירת הוידאו - ודא שתמונה גלויה ברורה");
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
      a.download = `voiceover-${Date.now()}.mp4`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("✅ וידאו הורד בהצלחה");
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
            className="bg-gradient-to-br from-orange-900/40 to-black border border-orange-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Mic className="w-6 h-6 text-orange-400" />
                דיבוב וקול
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    📝 טקסט לדיבוב
                  </label>
                  <Textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="כתוב את הטקסט שתרצה לדיבור..."
                    className="bg-black/60 border-orange-500/30 text-white placeholder-white/40 resize-none h-40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    🎤 בחר קול
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full bg-black/60 border border-orange-500/30 text-white rounded-lg p-2 text-sm"
                  >
                    {voices.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleGenerateVoiceOver}
                  disabled={isGenerating || !script.trim()}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      יוצר וידאו...
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 mr-2" />
                      צור וידאו עם דיבוב
                    </>
                  )}
                </Button>
              </div>

              {/* Preview Section */}
              <div className="space-y-4">
                {generatedVideo ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="relative bg-black rounded-lg overflow-hidden border border-orange-500/30">
                      <video
                        src={generatedVideo.url}
                        controls
                        autoPlay
                        className="w-full aspect-video bg-black"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleDownload}
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        הורד וידאו
                      </Button>
                      <Button
                        onClick={() => setGeneratedVideo(null)}
                        variant="outline"
                        className="flex-1"
                      >
                        צור חדש
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-black/60 border border-orange-500/20 rounded-lg p-6 text-center h-64 flex flex-col items-center justify-center">
                    <Mic className="w-12 h-12 text-orange-400/50 mx-auto mb-3" />
                    <p className="text-white font-semibold mb-2">
                      תצוגה מקדימה
                    </p>
                    <p className="text-gray-400 text-sm">
                      הוידאו שלך עם הדיבוב יופיע כאן
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 space-y-3">
              <div className="p-4 bg-orange-600/20 border border-orange-500/30 rounded-lg">
                <p className="text-xs text-orange-200">
                  💡 <span className="font-semibold">טיפ:</span> תמונה ברורה של פנים לתוצאות הטובות ביותר
                </p>
              </div>
              <div className="p-4 bg-green-600/20 border border-green-500/30 rounded-lg flex items-start gap-2">
                <Zap className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-200">
                  <span className="font-semibold">הפיצ'ר:</span> דמות אנימציה עם שפת גוף, תנועות עיניים ודיבור טבעי בכל שפה
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}