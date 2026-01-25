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
          mode: 'talks',
          avatarUrl,
          gender,
          voiceProvider,
          voiceId: gender === 'male' ? 'he-IL-AvriNeural' : 'he-IL-HilaNeural',
          backgroundUrl: backgroundType === 'dynamic' ? avatarUrl : null
        });

        if (response.data?.video_url) {
          setVideoUrl(response.data.video_url);

          // Save to UserVideo entity for feeds
          try {
            const user = await base44.auth.me();
            await base44.entities.UserVideo.create({
              title: `דמות מדברת - ${text.substring(0, 40)}...`,
              video_url: response.data.video_url,
              thumbnail_url: avatarUrl,
              status: "ready",
              uploader_email: user.email,
              duration: response.data.duration || 0
            });
          } catch (err) {
            console.log('Failed to save to entity:', err);
          }

          // Send to main player
          window.dispatchEvent(new CustomEvent('playVideo', {
            detail: {
              url: response.data.video_url,
              title: `דמות מדברת - ${text.substring(0, 40)}...`,
              autoPlay: true
            }
          }));

          // Trigger video uploaded event for feeds refresh
          window.dispatchEvent(new CustomEvent('videoUploaded'));

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
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden w-full max-w-2xl shadow-2xl border border-purple-500/30 max-h-[85vh] flex flex-col"
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
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
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
                  /* Creation Form - No Scroll */
                  <div className="space-y-4">
                    {/* Step 1: Image Upload */}
                    <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 rounded-xl p-4 border border-purple-500/30">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">1</div>
                        <h3 className="text-white font-bold">העלה תמונה</h3>
                      </div>
                      <div 
                        onClick={() => !uploadingImage && document.getElementById('avatar-upload').click()}
                        className="relative border-2 border-dashed border-purple-400 rounded-lg p-4 cursor-pointer hover:border-purple-300 hover:bg-purple-500/10 transition-all"
                      >
                        {avatarUrl ? (
                          <div className="flex items-center gap-3">
                            <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-lg border-2 border-purple-500 object-cover" />
                            <div className="flex-1">
                              <p className="text-purple-300 font-bold">✓ תמונה נבחרה</p>
                              <p className="text-gray-400 text-xs mt-1">לחץ להחלפה</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <User className="w-12 h-12 mx-auto mb-2 text-purple-400" />
                            <p className="text-white font-bold">לחץ לבחירת תמונה</p>
                            <p className="text-gray-400 text-xs mt-1">JPG, PNG - עד 5MB</p>
                          </div>
                        )}
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
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

                    {/* Step 2: Text Input */}
                    <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-xl p-4 border border-blue-500/30">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">2</div>
                        <h3 className="text-white font-bold">כתוב טקסט</h3>
                      </div>
                      <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="מה הדמות תגיד? (למשל: שלום! ברוכים הבאים לחדשות הערב...)"
                        className="min-h-32 bg-gray-900/50 border-blue-500/30 text-white resize-none text-sm"
                        disabled={isGenerating}
                      />
                    </div>

                    {/* Step 3: Voice & Settings - Compact */}
                    <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 rounded-xl p-4 border border-green-500/30">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">3</div>
                        <h3 className="text-white font-bold">הגדרות</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-white text-xs font-semibold mb-1 block">קול</label>
                          <select 
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full bg-gray-900/50 border border-green-500/30 rounded px-2 py-2 text-white text-sm"
                          >
                            <option value="male">♂️ גברי</option>
                            <option value="female">♀️ נשי</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-white text-xs font-semibold mb-1 block">רקע</label>
                          <select 
                            value={backgroundType}
                            onChange={(e) => setBackgroundType(e.target.value)}
                            className="w-full bg-gray-900/50 border border-green-500/30 rounded px-2 py-2 text-white text-sm"
                          >
                            <option value="static">🖼️ קבוע</option>
                            <option value="dynamic">✨ דינמי</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Generate Button - Large and Clear */}
                    <Button
                      onClick={generateVideo}
                      disabled={isGenerating || !text.trim() || !avatarUrl}
                      className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 hover:from-purple-700 hover:via-purple-800 hover:to-purple-900 text-white py-6 text-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-6 h-6 ml-2 animate-spin" />
                          יוצר... {Math.floor(Math.random() * 60) + 10} שניות
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6 ml-2" />
                          צור דמות מדברת עכשיו
                        </>
                      )}
                    </Button>
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