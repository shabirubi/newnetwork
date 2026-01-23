import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Zap, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function VideoUploadConfirmation({ videoUrl, isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState("options"); // options | uploading | success
  const [addToFeedKid, setAddToFeedKid] = useState(true);
  const [addToLivePlayer, setAddToLivePlayer] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!videoTitle.trim()) {
      toast.error("אנא הזן כותרת לוידאו");
      return;
    }

    setUploading(true);
    setStep("uploading");
    toast.loading("מעלה וידאו...", { id: "upload" });

    try {
      const user = await base44.auth.me();

      // Create UserVideo record
      const videoRecord = await base44.entities.UserVideo.create({
        title: videoTitle.trim(),
        video_url: videoUrl,
        uploader_email: user.email,
        status: "ready",
        views: 0,
        likes: 0
      });

      // If adding to live stream
      if (addToLivePlayer) {
        await base44.entities.LiveStream.create({
          title: videoTitle.trim(),
          stream_url: videoUrl,
          is_active: true,
          viewer_count: 0,
          started_at: new Date().toISOString()
        });
      }

      setStep("success");
      toast.success("וידאו הועלה בהצלחה!", { id: "upload" });
      
      // Notify home page to refresh
      window.dispatchEvent(new CustomEvent('videoUploaded'));

      setTimeout(() => {
        if (onSuccess) onSuccess(videoRecord);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("שגיאה בהעלאה: " + error.message, { id: "upload" });
      setStep("options");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl border border-blue-500/30 max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 px-6 py-4 border-b border-blue-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" />
              <h2 className="text-white font-bold">הוסף לאתר</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {step === "options" && (
              <>
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-semibold text-blue-300 mb-2">
                    כותרת הוידאו
                  </label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="הזן כותרת משכנעת..."
                    className="w-full bg-black/30 border border-blue-500/20 rounded-lg px-3 py-2 text-white placeholder-blue-300/30 focus:border-blue-500 focus:outline-none"
                    disabled={uploading}
                  />
                </div>

                {/* Options */}
                <div className="space-y-3 bg-black/20 rounded-lg p-4 border border-blue-500/10">
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-blue-500/10 p-2 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={addToFeedKid}
                      onChange={(e) => setAddToFeedKid(e.target.checked)}
                      disabled={uploading}
                      className="w-4 h-4 rounded bg-blue-600 border-blue-500 cursor-pointer"
                    />
                    <div>
                      <p className="text-white font-semibold text-sm">הוסף לפיד הנגן הכזי</p>
                      <p className="text-blue-300/60 text-xs">יופיע בעמוד הבית בתצוגת TikTok</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer hover:bg-blue-500/10 p-2 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={addToLivePlayer}
                      onChange={(e) => setAddToLivePlayer(e.target.checked)}
                      disabled={uploading}
                      className="w-4 h-4 rounded bg-blue-600 border-blue-500 cursor-pointer"
                    />
                    <div>
                      <p className="text-white font-semibold text-sm">הצג בנגן המרכזי</p>
                      <p className="text-blue-300/60 text-xs">יופיע בתצוגת השידור החי</p>
                    </div>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 bg-black/30 border-blue-500/20 text-white hover:bg-blue-600/20"
                    disabled={uploading}
                  >
                    ביטול
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!videoTitle.trim() || uploading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {uploading ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-spin" />
                        מעלה...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        העלה
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {step === "uploading" && (
              <div className="text-center space-y-4 py-8">
                <div className="w-12 h-12 rounded-full bg-blue-600/20 mx-auto flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
                <p className="text-white font-semibold">מעלה וידאו...</p>
                <p className="text-blue-300/60 text-sm">זה לוקח מספר שניות</p>
              </div>
            )}

            {step === "success" && (
              <div className="text-center space-y-4 py-8">
                <div className="w-12 h-12 rounded-full bg-green-600/20 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-white font-semibold">וידאו הועלה בהצלחה! 🎉</p>
                <p className="text-blue-300/60 text-sm">הוידאו שלך זמין כעת באתר</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}