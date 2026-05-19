import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Upload, Loader2, X, Headphones } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function PodcastUploadModal({ onClose, onUploaded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileRef = useRef(null);
  const thumbRef = useRef(null);
  const [thumbUrl, setThumbUrl] = useState("");

  const MAX_AUDIO_MB = 50;
  const MAX_VIDEO_MB = 100;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!title.trim()) { toast.error("חובה להזין כותרת"); return; }

    const isAudio = file.type.startsWith("audio/");
    const maxMB = isAudio ? MAX_AUDIO_MB : MAX_VIDEO_MB;
    const fileMB = file.size / (1024 * 1024);

    if (fileMB > maxMB) {
      toast.error(`הקובץ גדול מדי — המקסימום הוא ${maxMB}MB לסוג קובץ זה (הקובץ שלך: ${fileMB.toFixed(0)}MB)`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    setUploadProgress(`מעלה ${isAudio ? 'אודיו' : 'וידאו'} (${fileMB.toFixed(1)}MB)...`);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      setUploadProgress("שומר...");
      await base44.entities.UserVideo.create({
        title,
        description,
        video_url: file_url,
        thumbnail_url: thumbUrl || "",
        category: "breaking",
        feed: "podcasts",
        status: "ready",
        uploader_email: "admin",
        views: 0,
        likes: 0,
      });

      toast.success("הפודקסט הועלה בהצלחה!");
      onUploaded();
      onClose();
    } catch (err) {
      toast.error("שגיאה בהעלאה — נסה שוב");
    } finally {
      setUploading(false);
      setUploadProgress("");
      e.target.value = '';
    }
  };

  const handleThumb = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setThumbUrl(file_url);
    toast.success("תמונת כיסוי הועלתה");
    e.target.value = '';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.92)' }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-[#0d0d0d] rounded-2xl border border-purple-800/50 overflow-hidden" dir="rtl">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-purple-400" />
            <h2 className="text-white font-bold">העלאת פודקסט</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-purple-900/20 border border-purple-800/30 text-xs text-purple-300">
            <Headphones className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">גדלי קבצים נתמכים:</p>
              <p>🎵 אודיו (MP3, WAV, AAC) — עד <strong>50MB</strong></p>
              <p>🎬 וידאו-פודקסט (MP4, MOV) — עד <strong>100MB</strong></p>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">שם הפרק *</label>
            <Input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="שם הפרק..." className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-600" />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">תיאור (אופציונלי)</label>
            <Input value={description} onChange={e => setDescription(e.target.value)}
              placeholder="תיאור קצר..." className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-600" />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">תמונת כיסוי (אופציונלי)</label>
            <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={handleThumb} />
            <div className="flex items-center gap-3">
              <button onClick={() => thumbRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl border border-gray-700 text-xs transition-colors">
                <Upload className="w-3.5 h-3.5" /> העלה תמונה
              </button>
              {thumbUrl && <img src={thumbUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-purple-600/40" />}
            </div>
          </div>

          <input ref={fileRef} type="file" accept="audio/*,video/*" className="hidden" onChange={handleFile} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading || !title.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded-xl border border-purple-600/40 font-bold text-sm transition-colors disabled:opacity-50">
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />{uploadProgress || 'מעלה...'}</>
            ) : (
              <><Upload className="w-4 h-4" />בחר קובץ אודיו או וידאו</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}