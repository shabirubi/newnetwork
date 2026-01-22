import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Loader2, X, Download, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function TalkingAvatar() {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [gender, setGender] = useState("male");
  const [voiceProvider, setVoiceProvider] = useState("microsoft");
  const [backgroundType, setBackgroundType] = useState("static");

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("לא נבחר קובץ");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("אנא בחר קובץ תמונה");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("הקובץ גדול מדי. מקסימום 5MB");
      return;
    }

    setUploadingImage(true);
    toast.loading("מעלה תמונה...", { id: 'upload' });

    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      
      const url = result?.file_url || result?.url;
      
      if (!url) {
        throw new Error('לא התקבל URL מהשרת');
      }
      
      setAvatarUrl(url);
      toast.success("התמונה הועלתה בהצלחה!", { id: 'upload' });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`שגיאה בהעלאה: ${error.message}`, { id: 'upload' });
    } finally {
      setUploadingImage(false);
    }
  };

  const generateVideo = async () => {
      if (!text.trim()) {
        toast.error("אנא הזן טקסט");
        return;
      }

      if (!avatarUrl) {
        toast.error("אנא העלה תמונה");
        return;
      }

      setIsGenerating(true);
      toast.loading("יוצר דמות מדברת...", { id: 'video-gen' });

      try {
        const response = await base44.functions.invoke('generateTalkingVideo', {
          text,
          avatarUrl,
          gender,
          voiceProvider,
          backgroundType
        });

        if (response.data?.video_url) {
          setVideoUrl(response.data.video_url);

          // Send to main player
          window.dispatchEvent(new CustomEvent('playVideo', {
            detail: {
              url: response.data.video_url,
              title: `דמות מדברת - ${text.substring(0, 40)}...`,
              autoPlay: true
            }
          }));

          toast.success("הוידאו מוכן ונוסף לפיד! 🎥", { id: 'video-gen' });
        } else {
          throw new Error('לא הצלחתי ליצור וידאו');
        }
      } catch (error) {
        console.error('Video error:', error);
        toast.error(`שגיאה: ${error.message}`, { id: 'video-gen' });
      } finally {
        setIsGenerating(false);
      }
    };

  const reset = () => {
    setVideoUrl(null);
    setText("");
  };

  // Floating button will be added to header via layout
  React.useEffect(() => {
    const handleAvatarCreator = () => setIsOpen(true);
    window.addEventListener('openAvatarCreator', handleAvatarCreator);
    return () => window.removeEventListener('openAvatarCreator', handleAvatarCreator);
  }, []);

  return (
    <>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !isGenerating && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden w-full max-w-lg sm:max-w-2xl shadow-2xl border border-purple-500/30 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">צור דמות מדברת</h2>
                      <p className="text-purple-100 text-sm">טכנולוגיית D-ID מתקדמת</p>
                    </div>
                  </div>
                  <button
                    onClick={() => !isGenerating && setIsOpen(false)}
                    disabled={isGenerating}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                {videoUrl ? (
                  /* Video Result */
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
                      <video
                        src={videoUrl}
                        controls
                        autoPlay
                        className="w-full h-full"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={reset}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                      >
                        <Sparkles className="w-4 h-4 ml-2" />
                        צור וידאו חדש
                      </Button>
                      <a
                        href={videoUrl}
                        download="talking-avatar.mp4"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" className="border-purple-600 text-purple-400 hover:bg-purple-600/10">
                          <Download className="w-4 h-4 ml-2" />
                          הורד
                        </Button>
                      </a>
                    </div>
                  </div>
                ) : (
                  /* Creation Form */
                  <div className="space-y-6">
                    {/* Image Upload - Redesigned */}
                    <div className="w-full">
                      <label className="block text-white font-bold mb-2 text-sm">📸 תמונה</label>
                      <div 
                        onClick={() => !uploadingImage && document.getElementById('avatar-upload').click()}
                        className="w-full relative border-2 border-dashed border-purple-500/50 rounded-lg p-3 sm:p-4 cursor-pointer hover:border-purple-400 hover:bg-purple-500/5 transition-all bg-purple-900/20"
                      >
                        {avatarUrl ? (
                          <div className="flex items-center gap-2 sm:gap-3">
                            <img src={avatarUrl} alt="Avatar" className="w-16 h-16 sm:w-20 sm:h-20 rounded-md border-2 border-purple-500 object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-purple-300 font-bold text-xs sm:text-sm truncate">✓ הועלתה</p>
                              <p className="text-gray-400 text-xs">לחץ להחלפה</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-2 sm:py-3">
                            <User className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-purple-400" />
                            <p className="text-white font-bold text-xs sm:text-sm">בחר תמונה</p>
                            <p className="text-gray-400 text-xs">עד 5MB</p>
                          </div>
                        )}
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-purple-400" />
                          </div>
                        )}
                      </div>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </div>

                    {/* Voice Provider Selection */}
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <label className="block text-white font-bold mb-2 text-sm">🎤 ספק קול</label>
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-700/50 cursor-pointer">
                          <input
                            type="radio"
                            name="voiceProvider"
                            value="microsoft"
                            checked={voiceProvider === "microsoft"}
                            onChange={(e) => setVoiceProvider(e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-white text-sm">Microsoft Azure</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-700/50 cursor-pointer">
                          <input
                            type="radio"
                            name="voiceProvider"
                            value="elevenlabs"
                            checked={voiceProvider === "elevenlabs"}
                            onChange={(e) => setVoiceProvider(e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-white text-sm">Eleven Labs ⭐</span>
                        </label>
                      </div>
                    </div>

                    {/* Gender Selection */}
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <label className="block text-white font-bold mb-2 text-sm">👤 קול</label>
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-700/50 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={gender === "male"}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-white text-sm">♂️ גברי</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-700/50 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={gender === "female"}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-white text-sm">♀️ נשי</span>
                        </label>
                      </div>
                    </div>

                    {/* Background Selection */}
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <label className="block text-white font-bold mb-2 text-sm">🎬 רקע</label>
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-700/50 cursor-pointer">
                          <input
                            type="radio"
                            name="backgroundType"
                            value="static"
                            checked={backgroundType === "static"}
                            onChange={(e) => setBackgroundType(e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-white text-sm">קבוע</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-700/50 cursor-pointer">
                          <input
                            type="radio"
                            name="backgroundType"
                            value="dynamic"
                            checked={backgroundType === "dynamic"}
                            onChange={(e) => setBackgroundType(e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-white text-sm">דינמי</span>
                        </label>
                      </div>
                    </div>

                    {/* Text Input */}
                    <div>
                      <label className="block text-white font-bold mb-2 text-sm sm:text-base">📝 הטקסט</label>
                      <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="הזן את הטקסט שהדמות תדבר..."
                        className="min-h-24 bg-gray-800 border-gray-700 text-white resize-none text-sm leading-relaxed"
                        disabled={isGenerating}
                      />
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={generateVideo}
                      disabled={isGenerating || !text.trim() || !avatarUrl}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-6 text-lg font-bold"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                          יוצר דמות מדברת... אנא המתן
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 ml-2" />
                          צור דמות מדברת
                        </>
                      )}
                    </Button>

                    {/* Info */}
                    <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-4">
                      <h4 className="text-purple-300 font-bold mb-2 text-sm">איך זה עובד?</h4>
                      <ul className="text-xs text-purple-200 space-y-1">
                        <li>✨ טכנולוגיית AI מתקדמת של D-ID</li>
                        <li>🎭 סנכרון שפתיים מציאותי</li>
                        <li>🎤 קול עברי טבעי</li>
                        <li>⚡ תוצאה תוך כדקה</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}