import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Camera, Loader } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function UploadVideoModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "breaking",
    feed: "all",
    videoFile: null
  });

  const handleUpload = async () => {
    if (!formData.title || !formData.videoFile) {
      toast.error("אנא מלא את כל השדות");
      return;
    }

    setUploading(true);
    setStep(2);
    toast.loading("מעלה סרטון...", { id: "upload" });

    try {
      console.log('📤 מתחיל להעלות קובץ...', formData.videoFile.name);
      
      // העלה את הקובץ דרך backend function
      const uploadResponse = await base44.integrations.Core.UploadFile({
        file: formData.videoFile
      });
      
      const videoUrl = uploadResponse.file_url;
      console.log('✅ קובץ הועלה:', videoUrl);

      // שמור ב-UserVideo
      console.log('💾 שומר ב-UserVideo...');
      const user = await base44.auth.me();
      await base44.entities.UserVideo.create({
        title: formData.title,
        video_url: videoUrl,
        thumbnail_url: videoUrl,
        description: formData.description || '',
        uploader_email: user.email,
        status: 'ready',
        category: formData.category,
        feed: formData.feed
      });
      console.log('✅ UserVideo נשמר');

      // שמור גם ב-LiveStream כדי שיופיע בנגן הראשי
      console.log('💾 שומר ב-LiveStream...');
      await base44.entities.LiveStream.create({
        title: formData.title,
        stream_url: videoUrl,
        is_active: true,
        viewer_count: 0,
        thumbnail_url: videoUrl,
        started_at: new Date().toISOString()
      });
      console.log('✅ LiveStream נשמר');

      toast.dismiss("upload");
      setStep(3);
      setUploading(false);
      
      // רענן את כל ה-queries
      console.log('🔄 מרענן פידים...');
      queryClient.invalidateQueries({ queryKey: ['userVideos'] });
      queryClient.invalidateQueries({ queryKey: ['all-user-videos'] });
      queryClient.invalidateQueries({ queryKey: ['live-stream'] });
      queryClient.invalidateQueries({ queryKey: ['user-videos-manage'] });
      await queryClient.refetchQueries({ queryKey: ['userVideos'] });
      await queryClient.refetchQueries({ queryKey: ['all-user-videos'] });
      await queryClient.refetchQueries({ queryKey: ['live-stream'] });
      console.log('✅ פידים עודכנו!');
      
      // שלח אירוע שסרטון הועלה
      window.dispatchEvent(new CustomEvent('videoUploaded'));

      console.log('🎥 סרטון הועלה בהצלחה!');
      window.dispatchEvent(new CustomEvent('playVideo', {
        detail: {
          url: videoUrl,
          title: formData.title,
          autoPlay: true
        }
      }));
      
      setTimeout(() => {
        onClose();
        setStep(1);
        setFormData({ title: "", description: "", category: "breaking", feed: "all", videoFile: null });
        toast.success("הסרטון מוצג בנגן הראשי! 🎥");
      }, 2000);
    } catch (error) {
      console.error('❌ שגיאה בהעלאה:', error);
      toast.dismiss("upload");
      toast.error("שגיאה בהעלאה: " + error.message);
      setStep(1);
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative bg-gray-900 rounded-3xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-700"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {/* Content */}
            <div className="p-6">
              {/* Step 1: Upload */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      העלה סרטון
                    </h2>
                    <p className="text-gray-400">
                      שתף כתבה או סרטון מהשטח עם הקהילה
                    </p>
                  </div>

                  {/* Video Upload Area */}
                  <div className="border-2 border-dashed border-gray-600 rounded-2xl p-4 text-center hover:border-red-500 transition-colors cursor-pointer group">
                    <input
                      type="file"
                      accept="video/*,image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setFormData({ ...formData, videoFile: file });
                      }}
                      className="hidden"
                      id="videoInput"
                    />
                    <label htmlFor="videoInput" className="cursor-pointer">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="flex justify-center mb-4"
                      >
                        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-full p-4">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                      </motion.div>
                      <p className="text-white font-bold mb-1">
                        בחר או גרור סרטון
                      </p>
                      <p className="text-gray-400 text-sm">
                        {formData.videoFile
                          ? `${formData.videoFile.name} (${(formData.videoFile.size / (1024 * 1024)).toFixed(1)}MB)`
                          : "MP4, WebM או MOV"}
                      </p>
                    </label>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-white font-bold mb-2">
                      כותרת הסרטון
                    </label>
                    <input
                      type="text"
                      placeholder="בחר כותרת משכנעת..."
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-white font-bold mb-2">
                      תיאור (אופציונלי)
                    </label>
                    <textarea
                      placeholder="תאר את הסרטון שלך..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors resize-none h-24"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-white font-bold mb-2">
                      קטגוריה
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors"
                    >
                      <option value="breaking">חדשות עכשיו</option>
                      <option value="security">ביטחון ומדיניות</option>
                      <option value="economy">כלכלה ועסקים</option>
                      <option value="politics">פוליטיקה</option>
                      <option value="technology">טכנולוגיה</option>
                      <option value="sports">ספורט</option>
                      <option value="entertainment">בידור ודרמה</option>
                      <option value="world">חדשות עולם</option>
                      <option value="health">בריאות</option>
                      <option value="music">מוזיקה</option>
                      <option value="horoscope">אסטרולוגיה</option>
                      <option value="finance">פיננסים</option>
                    </select>
                  </div>

                  {/* Feed Selection */}
                  <div>
                    <label className="block text-white font-bold mb-2">
                      פיד תצוגה
                    </label>
                    <select
                      value={formData.feed}
                      onChange={(e) =>
                        setFormData({ ...formData, feed: e.target.value })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors"
                    >
                      <option value="all">כל הפידים</option>
                      <option value="live-player">נגן החדשות הראשי - דף הבית</option>
                      <option value="tiktok">TikTok News Feed</option>
                      <option value="kan-archive">ארכיון כאן - עמוד האש</option>
                      <option value="reporters-spotlight">Reporters Spotlight</option>
                      <option value="user-videos">User Uploaded Videos</option>
                      <option value="all-videos">All Videos Gallery</option>
                      <option value="reporter-responses">תשובות הכתבים</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        מעלה...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        העלה סרטון
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}

              {/* Step 2: Uploading */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-center py-8"
                >
                  <div className="flex justify-center">
                    <div className="relative w-24 h-24">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-4 border-gray-700 border-t-red-600 rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      מעלה הסרטון שלך
                    </h3>
                    <p className="text-gray-400">
                      זה עלול להימשך כמה דקות...
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Success */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-6 text-center py-12"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center"
                  >
                    <div className="bg-green-600/20 border border-green-600 rounded-full p-6">
                      <svg
                        className="w-12 h-12 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      ממש טוב!
                    </h3>
                    <p className="text-gray-400 mb-4">
                      הסרטון שלך הועלה בהצלחה!
                    </p>
                    <p className="text-sm text-gray-500">
                      הוא כבר מוצג בנגן המרכזי של העמוד הבית
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-3 rounded-xl"
                  >
                    סגור
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}