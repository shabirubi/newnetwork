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
          gender
        });

        if (response.data?.video_url) {
          setVideoUrl(response.data.video_url);
          toast.success("הוידאו מוכן ונוסף לפיד החדשות! 🎥", { id: 'video-gen' });
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
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl border border-purple-500/30"
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
              <div className="p-6 space-y-6">
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
                    {/* Image Upload */}
                    <div>
                      <label className="block text-white font-bold mb-3">העלה תמונה של הדמות</label>
                      <div className="flex items-center gap-4">
                        {avatarUrl && (
                          <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-purple-500">
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <Button
                            type="button"
                            onClick={() => document.getElementById('avatar-upload').click()}
                            disabled={uploadingImage}
                            className="w-full border-2 border-dashed border-gray-600 hover:border-purple-500 bg-transparent hover:bg-purple-500/10 py-8"
                          >
                            {uploadingImage ? (
                              <div className="flex items-center justify-center gap-2 text-purple-400">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>מעלה...</span>
                              </div>
                            ) : (
                              <div className="text-gray-400">
                                <User className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm">לחץ להעלאת תמונה</p>
                              </div>
                            )}
                          </Button>
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 טיפ: השתמש בתמונה ברורה של פנים כדי לקבל תוצאות מיטביות
                      </p>
                    </div>

                    {/* Gender Selection */}
                    <div>
                      <label className="block text-white font-bold mb-3">בחר קול</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={gender === "male"}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-300">קול גברי</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={gender === "female"}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-300">קול נשי</span>
                        </label>
                      </div>
                    </div>

                    {/* Text Input */}
                    <div>
                      <label className="block text-white font-bold mb-3">מה הדמות תגיד?</label>
                      <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="הזן כאן את הטקסט שהדמות תדבר (בעברית)..."
                        className="min-h-32 bg-gray-800 border-gray-700 text-white resize-none"
                        disabled={isGenerating}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        📝 הטקסט יומר לדיבור עברי טבעי עם סנכרון שפתיים מושלם
                      </p>
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