import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, X, CheckCircle, Film } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  { value: "breaking", label: "חדשות חמות" },
  { value: "security", label: "ביטחון" },
  { value: "economy", label: "כלכלה" },
  { value: "politics", label: "פוליטיקה" },
  { value: "technology", label: "טכנולוגיה" },
  { value: "sports", label: "ספורט" },
  { value: "entertainment", label: "בידור ודרמה" },
  { value: "world", label: "עולם" },
  { value: "health", label: "בריאות" },
  { value: "music", label: "מוזיקה" },
  { value: "horoscope", label: "הורוסקופ" },
  { value: "finance", label: "פיננסים" },
  { value: "crime", label: "פלילים" },
  { value: "education", label: "חינוך" },
  { value: "culture", label: "תרבות" },
  { value: "environment", label: "סביבה" },
  { value: "science", label: "מדע" },
  { value: "israel", label: "ישראל" },
  { value: "military", label: "צבא" },
  { value: "law", label: "משפט" },
  { value: "local", label: "מקומי" }
];

const feeds = [
  { value: "all", label: "כל הפידים" },
  { value: "live-player", label: "נגן חי" },
  { value: "tiktok", label: "TikTok" },
  { value: "kan-archive", label: "ארכיון כאן" },
  { value: "reporters-spotlight", label: "זרקור כתבים" },
  { value: "user-videos", label: "סרטוני משתמשים" },
  { value: "all-videos", label: "כל הסרטונים" },
  { value: "reporter-responses", label: "תגובות כתבים" }
];

export default function AdminVideoUploadModal({ isOpen, onClose }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('breaking');
  const [feed, setFeed] = useState('all');
  const [videoUrl, setVideoUrl] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 500 * 1024 * 1024) { // 500MB limit
        toast.error('הקובץ גדול מדי - מקסימום 500MB');
        return;
      }
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('בחר קובץ וידאו');
      return;
    }
    if (!title.trim()) {
      toast.error('הזן כותרת לסרטון');
      return;
    }

    setUploading(true);
    try {
      // Upload video
      toast.info('מעלה וידאו... זה יכול לקחת זמן');
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setVideoUrl(file_url);

      // Get duration from video
      let thumbnailUrl = file_url;
      let duration = 0;
      try {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        await new Promise((resolve) => {
          video.addEventListener('loadedmetadata', () => {
            duration = video.duration;
            resolve();
          });
          video.addEventListener('error', resolve);
          setTimeout(resolve, 3000);
        });
      } catch (e) {}

      // Save to database
      const userEmail = localStorage.getItem('user_email') || 'admin@hareshet.co.il';
      await base44.entities.UserVideo.create({
        title: title.trim(),
        description: description.trim() || null,
        video_url: file_url,
        thumbnail_url: thumbnailUrl,
        duration: Math.round(duration),
        file_size: Math.round(file.size / (1024 * 1024)),
        category,
        feed,
        status: 'ready',
        uploader_email: userEmail,
        views: 0,
        likes: 0
      });

      // Also save to LiveStream so it appears in the main player
      await base44.entities.LiveStream.create({
        title: title.trim(),
        stream_url: file_url,
        is_active: true,
        viewer_count: 0,
        thumbnail_url: thumbnailUrl,
        started_at: new Date().toISOString()
      });

      // Dispatch event to refresh feeds
      window.dispatchEvent(new CustomEvent('videoUploaded'));
      window.dispatchEvent(new CustomEvent('playVideo', {
        detail: { url: file_url, title: title.trim(), autoPlay: true }
      }));

      toast.success('הסרטון הועלה בהצלחה! 🎬');
      
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setCategory('breaking');
      setFeed('all');
      setVideoUrl('');
      
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('שגיאה בהעלאה: ' + error.message);
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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 to-black border border-[#E31E24]/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E31E24] to-red-600 flex items-center justify-center">
                <Upload size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">העלאת וידאו מתקדם</h3>
                <p className="text-sm text-gray-400">עד 500MB • כל הפורמטים</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
          </div>

          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">בחר קובץ וידאו</label>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="admin-video-upload"
              />
              <Button
                onClick={() => document.getElementById('admin-video-upload').click()}
                className="w-full bg-white/10 hover:bg-white/20 border-2 border-dashed border-white/20 text-white h-24"
                disabled={uploading}
              >
                <div className="flex flex-col items-center gap-2">
                  {file ? (
                    <>
                      <CheckCircle size={32} className="text-green-500" />
                      <span className="text-sm font-bold">{file.name}</span>
                      <span className="text-xs text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </>
                  ) : (
                    <>
                      <Upload size={32} />
                      <span className="text-sm">לחץ לבחירת קובץ</span>
                      <span className="text-xs text-gray-400">MP4, MOV, AVI, MKV עד 500MB</span>
                    </>
                  )}
                </div>
              </Button>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">כותרת הסרטון</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="הזן כותרת..."
                className="bg-white/5 border-white/20 text-white"
                disabled={uploading}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">תיאור (אופציונלי)</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="תיאור הסרטון..."
                className="bg-white/5 border-white/20 text-white resize-none"
                rows={3}
                disabled={uploading}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">קטגוריה</label>
              <Select value={category} onValueChange={setCategory} disabled={uploading}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Feed */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">פיד תצוגה</label>
              <Select value={feed} onValueChange={setFeed} disabled={uploading}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {feeds.map(f => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Upload Button */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
                disabled={uploading}
              >
                ביטול
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || !title.trim() || uploading}
                className="flex-1 bg-gradient-to-r from-[#E31E24] to-red-600 hover:from-[#B91C1C] hover:to-red-700 text-white font-bold"
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="ml-2 animate-spin" />
                    מעלה...
                  </>
                ) : (
                  <>
                    <Upload size={18} className="ml-2" />
                    העלה סרטון
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-4 bg-white/5 border border-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white font-semibold">מעלה...</span>
                <span className="text-sm text-gray-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full bg-gradient-to-r from-[#E31E24] to-red-600"
                />
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-4 bg-[#E31E24]/10 border border-[#E31E24]/30 rounded-xl p-4">
            <p className="text-sm text-[#E31E24] font-semibold mb-2 flex items-center gap-2">
              <Film size={16} />
              מידע חשוב:
            </p>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• הסרטון יישמר לפי הקטגוריה והפיד שנבחרו</li>
              <li>• תומך בקבצים גדולים עד 500MB</li>
              <li>• הקובץ יועלה למערכת ויהיה זמין מיד</li>
              <li>• ניתן לערוך את הפרטים מאוחר יותר</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}