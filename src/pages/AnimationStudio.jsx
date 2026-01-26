import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader, Download, PlayCircle, FileVideo, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function AnimationStudio() {
  const [script, setScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [videoHistory, setVideoHistory] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("en");
  const [avatarStyle, setAvatarStyle] = useState("professional");

  const voices = [
    { id: "en", name: "🎤 English Male" },
    { id: "en-female", name: "👩 English Female" },
    { id: "he", name: "🇮🇱 עברית (זכר)" },
    { id: "he-female", name: "👱‍♀️ עברית (נקבה)" },
    { id: "es", name: "🇪🇸 Spanish" },
    { id: "fr", name: "🇫🇷 French" },
  ];

  const avatars = [
    { id: "professional", name: "💼 Professional", desc: "Business person" },
    { id: "friendly", name: "😊 Friendly", desc: "Casual presenter" },
    { id: "animated", name: "🎨 Animated", desc: "Cartoon style" },
    { id: "news", name: "📺 News", desc: "Anchor style" },
  ];

  const generateVideo = async () => {
    if (!script.trim()) {
      toast.error("אנא כתוב טקסט");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke("generateAnimatedVideo", {
        script: script,
        voice: selectedVoice,
        avatarStyle: avatarStyle,
        duration: Math.ceil(script.split(" ").length / 2.5),
      });

      if (response.data?.video_url) {
        const newVideo = {
          id: Date.now(),
          videoUrl: response.data.video_url,
          script: script,
          voice: selectedVoice,
          avatar: avatarStyle,
          duration: response.data.duration || "0:00",
          createdAt: new Date().toISOString(),
        };
        setGeneratedVideo(newVideo);
        setVideoHistory([newVideo, ...videoHistory]);
        toast.success("✅ וידאו נוצר בהצלחה!");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("שגיאה ביצירת הוידאו");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadVideo = async (videoUrl) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `video-${Date.now()}.mp4`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("✅ וידאו הורד בהצלחה");
    } catch (error) {
      toast.error("שגיאה בהורדה");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900/20 to-black p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileVideo className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Animation Studio
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            💬 הטקסט שלך → 🎬 וידאו עם דמות דוברת
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Creator Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-4"
          >
            <div className="bg-gradient-to-br from-slate-900/60 to-black border border-cyan-500/30 rounded-2xl p-6 space-y-4">
              {/* Script Input */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  📝 הטקסט שלך
                </label>
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="כתוב את הטקסט שתרצה שהדמות תדבר..."
                  className="bg-black/60 border-cyan-500/30 text-white placeholder-white/40 resize-none h-32"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {script.length} תווים
                </p>
              </div>

              {/* Voice Selection */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  🎤 קול
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full bg-black/60 border border-cyan-500/30 text-white rounded-lg p-2 text-sm"
                >
                  {voices.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Avatar Style */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  👤 דמות
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {avatars.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setAvatarStyle(a.id)}
                      className={`p-3 rounded-lg text-center text-xs transition-all ${
                        avatarStyle === a.id
                          ? "bg-cyan-500/40 border border-cyan-400"
                          : "bg-black/60 border border-cyan-500/20 hover:border-cyan-500/50"
                      }`}
                    >
                      <div className="font-semibold">{a.name}</div>
                      <div className="text-gray-500 text-[10px]">{a.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateVideo}
                disabled={isGenerating || !script.trim()}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    ייוצר וידאו...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    צור וידאו
                  </>
                )}
              </Button>
            </div>

            {/* Tips */}
            <div className="bg-black/40 border border-cyan-500/20 rounded-2xl p-4">
              <p className="text-xs font-semibold text-cyan-300 mb-2">💡 טיפים:</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• טקסט קצר יותר = וידאו מהיר</li>
                <li>• בחר קול בשפה הנכונה</li>
                <li>• כל דמות עם דמות אחרת</li>
              </ul>
            </div>
          </motion.div>

          {/* Preview Area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Main Preview */}
            <div className="bg-gradient-to-br from-black to-slate-900/30 border border-cyan-500/30 rounded-2xl p-6 min-h-[500px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {generatedVideo ? (
                  <motion.div
                    key="video"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full space-y-4"
                  >
                    <div className="relative bg-black rounded-xl overflow-hidden border border-cyan-500/30">
                      <video
                        src={generatedVideo.videoUrl}
                        controls
                        autoPlay
                        className="w-full h-auto aspect-video bg-black"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          downloadVideo(generatedVideo.videoUrl)
                        }
                        className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        הורד וידאו
                      </Button>
                      <Button
                        onClick={() => setGeneratedVideo(null)}
                        variant="outline"
                        className="flex-1"
                      >
                        שנו טקסט
                      </Button>
                    </div>
                  </motion.div>
                ) : isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <div className="mb-4">
                      <Loader className="w-16 h-16 animate-spin text-cyan-400 mx-auto" />
                    </div>
                    <p className="text-white font-semibold text-lg mb-2">
                      ייוצר הוידאו שלך...
                    </p>
                    <p className="text-gray-400">
                      זה עשוי לקחת עד דקה אחת
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <PlayCircle className="w-20 h-20 text-cyan-400/50 mx-auto mb-4" />
                    <p className="text-white font-semibold text-lg">
                      המתן לוידאו שלך
                    </p>
                    <p className="text-gray-400">
                      כתוב טקסט והקלק על צור וידאו
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* History */}
            {videoHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 border border-cyan-500/20 rounded-2xl p-4"
              >
                <h3 className="text-white font-semibold mb-4">
                  📹 וידאוים שנוצרו
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[200px] overflow-y-auto">
                  {videoHistory.map((video) => (
                    <motion.button
                      key={video.id}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setGeneratedVideo(video)}
                      className="relative group"
                    >
                      <div className="w-full aspect-video rounded-lg border-2 border-cyan-500/30 group-hover:border-cyan-400 bg-black flex items-center justify-center transition-colors">
                        <PlayCircle className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div className="text-xs text-gray-400 mt-1 text-center truncate">
                        {video.duration}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}