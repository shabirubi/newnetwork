import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader, Play, Download, Trash2, X, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

const AVATAR_STYLES = [
  { id: "modern-woman", label: "אישה מודרנית", color: "from-pink-500 to-purple-600" },
  { id: "modern-man", label: "איש מודרני", color: "from-blue-500 to-purple-600" },
  { id: "professional-woman", label: "אישה מקצועית", color: "from-emerald-500 to-teal-600" },
  { id: "professional-man", label: "איש מקצועי", color: "from-amber-500 to-orange-600" },
  { id: "casual-woman", label: "אישה יום-יום", color: "from-rose-500 to-pink-600" },
  { id: "casual-man", label: "איש יום-יום", color: "from-cyan-500 to-blue-600" },
];

const VOICE_OPTIONS = [
  { id: "he-IL-AvriNeural", label: "דוד (זכר)", gender: "male" },
  { id: "he-IL-HilaNeural", label: "דינה (נקבה)", gender: "female" },
  { id: "en-US-AvaNeural", label: "Ava (English)", gender: "female" },
  { id: "en-US-BrianNeural", label: "Brian (English)", gender: "male" },
];

export default function AvatarStudio() {
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_STYLES[0].id);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [script, setScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const generateVideo = async () => {
    if (!script.trim()) {
      toast.error("אנא הזן טקסט");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke("generateAvatarVideo", {
        script: script,
        avatarStyle: selectedAvatar,
        voiceId: selectedVoice,
        language: selectedVoice.includes("he-IL") ? "he" : "en"
      });

      if (response.data?.video_url) {
        const newVideo = {
          id: Date.now(),
          videoUrl: response.data.video_url,
          script,
          avatar: selectedAvatar,
          voice: selectedVoice,
          createdAt: new Date().toISOString()
        };
        setGeneratedVideos([newVideo, ...generatedVideos]);
        setScript("");
        toast.success("🎬 וידאו נוצר בהצלחה!");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("שגיאה ביצירת הווידאו");
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
      a.download = `avatar-video-${Date.now()}.mp4`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("✅ הווידאו הורד בהצלחה");
    } catch (error) {
      toast.error("שגיאה בהורדה");
    }
  };

  const deleteVideo = (id) => {
    setGeneratedVideos(generatedVideos.filter(v => v.id !== id));
    if (selectedVideo?.id === id) setSelectedVideo(null);
    toast.success("🗑️ הווידאו נמחק");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Avatar Studio
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            צור וידאו עם דמות מדברת בשניות
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Creator Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-4"
          >
            <div className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 rounded-2xl p-6 space-y-4">
              {/* Avatar Selection */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  🎭 בחר דמות
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AVATAR_STYLES.map((avatar) => (
                    <motion.button
                      key={avatar.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedAvatar(avatar.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedAvatar === avatar.id
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-purple-500/30 hover:border-purple-500/50 bg-black/40"
                      }`}
                    >
                      <div className={`w-full h-16 rounded-md bg-gradient-to-br ${avatar.color} flex items-center justify-center text-white text-xs font-bold text-center mb-2`}>
                        {avatar.label.split(' ')[0]}
                      </div>
                      <p className="text-xs text-gray-300">{avatar.label}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Voice Selection */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  🎤 בחר קול
                </label>
                <div className="space-y-2">
                  {VOICE_OPTIONS.map((voice) => (
                    <motion.button
                      key={voice.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedVoice(voice.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left flex items-center gap-2 ${
                        selectedVoice === voice.id
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-purple-500/30 hover:border-purple-500/50 bg-black/40"
                      }`}
                    >
                      <Volume2 className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-white">{voice.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Script Input */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  📝 טקסט לדמות
                </label>
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="לדוגמה: שלום, אני דמות AI. זה וידאו מעניין מאוד..."
                  className="bg-black/60 border-purple-500/30 text-white placeholder-white/40 resize-none"
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {script.length > 0 && `${Math.ceil(script.length / 5)} מילים בערך`}
                </p>
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateVideo}
                disabled={isGenerating || !script.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold py-3 rounded-xl transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    יוצר וידאו...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    צור וידאו
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Preview Area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Main Preview */}
            <div className="bg-gradient-to-br from-black to-purple-900/30 border border-purple-500/30 rounded-2xl p-6 min-h-[400px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {selectedVideo ? (
                  <motion.div
                    key="video"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full space-y-4"
                  >
                    <div className="relative bg-black rounded-xl overflow-hidden border border-purple-500/30 aspect-video">
                      <video
                        src={selectedVideo.videoUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm text-gray-400">
                        <span className="font-semibold text-white">טקסט:</span> {selectedVideo.script}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={() => downloadVideo(selectedVideo.videoUrl)}
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          הורד
                        </Button>
                        <Button
                          onClick={() => setSelectedVideo(null)}
                          variant="outline"
                          className="flex-1 border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                        >
                          <X className="w-4 h-4 mr-2" />
                          סגור
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-4 border-transparent border-t-purple-400 border-r-purple-400 rounded-full"
                      />
                    </div>
                    <p className="text-white font-semibold">
                      יוצר וידאו עם דמות מדברת...
                    </p>
                    <p className="text-gray-400 text-sm">
                      זה עשוי לקחת עד 2 דקות
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <Play className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
                    <p className="text-white font-semibold">
                      בחר דמות וקול
                    </p>
                    <p className="text-gray-400 text-sm">
                      הזן טקסט והקלק "צור וידאו"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Videos History */}
            {generatedVideos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 border border-purple-500/20 rounded-2xl p-4"
              >
                <h3 className="text-white font-semibold mb-4">
                  📹 הווידאוים שלך
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {generatedVideos.map((video) => (
                    <motion.div
                      key={video.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedVideo(video)}
                      className="flex gap-3 p-3 bg-black/60 rounded-lg border border-purple-500/20 hover:border-purple-500/50 cursor-pointer transition-all"
                    >
                      <div className="w-20 h-16 bg-gradient-to-br from-purple-500/30 to-black rounded-lg flex items-center justify-center flex-shrink-0">
                        <Play className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          {video.script.substring(0, 40)}...
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(video.createdAt).toLocaleDateString("he-IL")}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteVideo(video.id);
                        }}
                        className="p-2 hover:bg-red-600/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </motion.div>
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