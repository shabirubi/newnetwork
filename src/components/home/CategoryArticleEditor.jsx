import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3, Save, X, Image, Video, Play, Pause,
  Plus, Trash2, Check, Loader2, Clapperboard, Upload,
  Volume2, VolumeX, ChevronUp, ChevronDown, Tv
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createPageUrl } from "../../utils";
import { Link } from "react-router-dom";

const REEL_CATEGORIES = [
  { id: "breaking", label: "חדשות עכשיו" },
  { id: "security", label: "ביטחון" },
  { id: "economy", label: "כלכלה" },
  { id: "politics", label: "פוליטיקה" },
  { id: "technology", label: "טכנולוגיה" },
  { id: "sports", label: "ספורט" },
  { id: "entertainment", label: "בידור" },
  { id: "world", label: "עולם" },
  { id: "health", label: "בריאות" },
  { id: "music", label: "מוזיקה" },
  { id: "crime", label: "פלילים" },
  { id: "israel", label: "ישראל" },
  { id: "military", label: "צבא" },
  { id: "education", label: "חינוך" },
  { id: "culture", label: "תרבות" },
  { id: "environment", label: "סביבה" },
  { id: "science", label: "מדע" },
  { id: "local", label: "מקומי" },
  { id: "law", label: "משפט" },
  { id: "finance", label: "פיננסים" },
  { id: "vod", label: "VOD" },
];

const emptyForm = (category) => ({
  title: "", subtitle: "", content: "", category,
  image_url: "", video_url: "", is_breaking: false, is_featured: false, source: "",
  extra_images: [], extra_videos: [],
});

// ---- Editor Modal (same as FeaturedArticleEditor but for any category) ----
function EditorModal({ article, category, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({
    ...emptyForm(category),
    ...(article ? {
      title: article.title || "",
      subtitle: article.subtitle || "",
      content: article.content || "",
      category: article.category || category,
      image_url: article.image_url || "",
      video_url: article.video_url || "",
      is_breaking: article.is_breaking || false,
      is_featured: article.is_featured || false,
      source: article.source || "",
      extra_images: article.extra_images || [],
      extra_videos: article.extra_videos || [],
    } : {})
  }));

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [reelCategory, setReelCategory] = useState(category);
  const [reelTitle, setReelTitle] = useState("");
  const [reelDescription, setReelDescription] = useState("");
  const [uploadedReels, setUploadedReels] = useState([]);

  const mainImageRef = useRef(null);
  const mainVideoRef = useRef(null);
  const extraImageRef = useRef(null);
  const extraVideoRef = useRef(null);
  const reelVideoRef = useRef(null);
  const queryClient = useQueryClient();

  const uploadImage = async (file, type) => {
    setUploading(type);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    } finally { setUploading(null); }
  };

  const uploadVideo = async (file, type) => {
    setUploading(type);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 60 * 60 * 24 * 365 });
      return signed_url;
    } finally { setUploading(null); }
  };

  const handleMainImage = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const url = await uploadImage(file, 'main-image');
    setForm(f => ({ ...f, image_url: url }));
    toast.success("תמונה ראשית הועלתה");
    e.target.value = '';
  };

  const handleMainVideo = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    toast.info("מעלה וידאו, אנא המתן...");
    const url = await uploadVideo(file, 'main-video');
    setForm(f => ({ ...f, video_url: url }));
    toast.success("וידאו ראשי הועלה");
    e.target.value = '';
  };

  const handleExtraImages = async (e) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    setUploading('extra-image');
    const urls = [];
    for (const file of files) {
      const url = await base44.integrations.Core.UploadFile({ file }).then(r => r.file_url);
      urls.push(url);
    }
    setUploading(null);
    setForm(f => ({ ...f, extra_images: [...(f.extra_images || []), ...urls] }));
    toast.success(`${urls.length} תמונות הועלו`);
    e.target.value = '';
  };

  const handleExtraVideos = async (e) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    toast.info("מעלה סרטונים...");
    setUploading('extra-video');
    const urls = [];
    for (const file of files) {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 60 * 60 * 24 * 365 });
      urls.push(signed_url);
    }
    setUploading(null);
    setForm(f => ({ ...f, extra_videos: [...(f.extra_videos || []), ...urls] }));
    toast.success(`${urls.length} סרטונים הועלו`);
    e.target.value = '';
  };

  const handleReelUpload = async (e) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    if (!reelTitle.trim()) { toast.error("חובה להזין כותרת לריל"); return; }
    toast.info("מעלה ריל...");
    setUploading('reel');
    try {
      for (const file of files) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 60 * 60 * 24 * 365 });
        await base44.entities.UserVideo.create({
          title: reelTitle, description: reelDescription, video_url: signed_url,
          category: reelCategory, feed: "tiktok", status: "ready",
          uploader_email: "admin", views: 0, likes: 0,
        });
        setUploadedReels(r => [...r, { title: reelTitle, category: reelCategory }]);
      }
      toast.success("הריל הועלה!");
      setReelTitle(""); setReelDescription("");
    } finally { setUploading(null); e.target.value = ''; }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("חובה להזין כותרת"); return; }
    setSaving(true);
    try {
      if (article?.id) {
        await base44.entities.NewsArticle.update(article.id, form);
      } else {
        await base44.entities.NewsArticle.create(form);
      }
      queryClient.invalidateQueries({ queryKey: ['cat-top', category] });
      toast.success("הכתבה נשמרה!");
      onSaved();
    } catch { toast.error("שגיאה בשמירה"); }
    finally { setSaving(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.92)' }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-4xl max-h-[95vh] flex flex-col bg-[#0d0d0d] rounded-2xl border border-gray-800 overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-[#111] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-[#0057B8]" />
            <h2 className="text-white font-bold text-base">עורך כתבה מתקדם</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#E31E24] hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              שמור כתבה
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Breaking toggle */}
          <div className="flex items-center gap-3">
            <button onClick={() => setForm(f => ({ ...f, is_breaking: !f.is_breaking }))}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-bold transition-colors ${
                form.is_breaking ? 'bg-red-600/30 border-red-600/50 text-red-400' : 'bg-gray-800 border-gray-700 text-gray-500'
              }`}>
              🔴 סמן כחם
            </button>
            <button onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-bold transition-colors ${
                form.is_featured ? 'bg-[#0057B8]/30 border-[#0057B8]/50 text-[#0057B8]' : 'bg-gray-800 border-gray-700 text-gray-500'
              }`}>
              ⭐ כתבה מרכזית
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">כותרת ראשית *</label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="כותרת ראשית..." className="bg-[#1a1a1a] border-gray-700 text-white text-lg font-bold placeholder:text-gray-600 focus:border-[#0057B8]" />
          </div>

          {/* Subtitle */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">כותרת משנה</label>
            <Input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
              placeholder="כותרת משנה..." className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-600 focus:border-[#0057B8]" />
          </div>

          {/* Content */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">תוכן הכתבה</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="כתוב את תוכן הכתבה כאן..." rows={8}
              className="w-full bg-[#1a1a1a] border border-gray-700 text-white text-sm rounded-xl p-3 placeholder:text-gray-600 focus:border-[#0057B8] focus:outline-none resize-none" />
          </div>

          {/* Source */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">מקור</label>
            <Input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
              placeholder="מקור הכתבה..." className="bg-[#1a1a1a] border-gray-700 text-white text-sm placeholder:text-gray-600 focus:border-[#0057B8]" />
          </div>

          {/* Media Section */}
          <div className="border border-gray-800 rounded-2xl overflow-hidden">
            <div className="bg-[#111] px-4 py-3 border-b border-gray-800">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#0057B8]" />
                מדיה — תמונות וסרטונים
              </h3>
            </div>
            <div className="p-4 space-y-4">

              {/* Main Video */}
              <div>
                <label className="text-gray-400 text-xs mb-2 block">וידאו ראשי</label>
                <input ref={mainVideoRef} type="file" accept="video/*" className="hidden" onChange={handleMainVideo} />
                <div className="flex gap-2 items-center flex-wrap">
                  <button onClick={() => mainVideoRef.current?.click()} disabled={uploading === 'main-video'}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-xl border border-purple-600/30 text-sm transition-colors disabled:opacity-50">
                    {uploading === 'main-video' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                    העלה וידאו ראשי
                  </button>
                  {form.video_url && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 text-xs">✓ הועלה</span>
                      <button onClick={() => setForm(f => ({ ...f, video_url: '' }))} className="text-gray-500 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <Input value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
                  placeholder="או הדבק URL של וידאו..." className="mt-2 bg-[#1a1a1a] border-gray-700 text-white text-xs placeholder:text-gray-600 focus:border-[#0057B8]" />
              </div>

              {/* Main Image */}
              <div>
                <label className="text-gray-400 text-xs mb-2 block">תמונה ראשית</label>
                <input ref={mainImageRef} type="file" accept="image/*" className="hidden" onChange={handleMainImage} />
                <div className="flex gap-2 items-center flex-wrap">
                  <button onClick={() => mainImageRef.current?.click()} disabled={uploading === 'main-image'}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0057B8]/20 hover:bg-[#0057B8]/40 text-[#0057B8] rounded-xl border border-[#0057B8]/30 text-sm transition-colors disabled:opacity-50">
                    {uploading === 'main-image' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                    העלה תמונה ראשית
                  </button>
                  {form.image_url && (
                    <div className="flex items-center gap-2">
                      <img src={form.image_url} alt="" className="h-10 w-16 object-cover rounded" />
                      <button onClick={() => setForm(f => ({ ...f, image_url: '' }))} className="text-gray-500 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  placeholder="או הדבק URL של תמונה..." className="mt-2 bg-[#1a1a1a] border-gray-700 text-white text-xs placeholder:text-gray-600 focus:border-[#0057B8]" />
              </div>

              {/* Extra Videos */}
              <div>
                <label className="text-gray-400 text-xs mb-2 block">סרטונים נוספים</label>
                <input ref={extraVideoRef} type="file" accept="video/*" multiple className="hidden" onChange={handleExtraVideos} />
                <button onClick={() => extraVideoRef.current?.click()} disabled={uploading === 'extra-video'}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-xl border border-purple-600/30 text-sm transition-colors disabled:opacity-50 mb-2">
                  {uploading === 'extra-video' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  הוסף סרטונים
                </button>
                {form.extra_videos?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.extra_videos.map((url, i) => (
                      <div key={i} className="relative w-24 h-16 bg-gray-900 rounded-lg overflow-hidden border border-purple-600/30 flex items-center justify-center">
                        <Play className="w-5 h-5 text-purple-400" />
                        <button onClick={() => setForm(f => ({ ...f, extra_videos: f.extra_videos.filter((_, j) => j !== i) }))}
                          className="absolute top-0.5 left-0.5 bg-black/60 rounded-full p-0.5 text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Extra Images */}
              <div>
                <label className="text-gray-400 text-xs mb-2 block">תמונות נוספות</label>
                <input ref={extraImageRef} type="file" accept="image/*" multiple className="hidden" onChange={handleExtraImages} />
                <button onClick={() => extraImageRef.current?.click()} disabled={uploading === 'extra-image'}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0057B8]/20 hover:bg-[#0057B8]/40 text-[#0057B8] rounded-xl border border-[#0057B8]/30 text-sm transition-colors disabled:opacity-50 mb-2">
                  {uploading === 'extra-image' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  הוסף תמונות
                </button>
                {form.extra_images?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.extra_images.map((url, i) => (
                      <div key={i} className="relative w-24 h-16 rounded-lg overflow-hidden border border-[#0057B8]/30">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setForm(f => ({ ...f, extra_images: f.extra_images.filter((_, j) => j !== i) }))}
                          className="absolute top-0.5 left-0.5 bg-black/60 rounded-full p-0.5 text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Reels Section */}
          <div className="border border-purple-800/50 rounded-2xl overflow-hidden">
            <div className="bg-[#111] px-4 py-3 border-b border-purple-800/50">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <Clapperboard className="w-4 h-4 text-purple-400" />
                העלאת ריל (TikTok-style)
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">כותרת הריל *</label>
                <Input value={reelTitle} onChange={e => setReelTitle(e.target.value)}
                  placeholder="כותרת הריל..." className="bg-[#1a1a1a] border-gray-700 text-white text-sm placeholder:text-gray-600 focus:border-purple-500" />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">תיאור (אופציונלי)</label>
                <Input value={reelDescription} onChange={e => setReelDescription(e.target.value)}
                  placeholder="תיאור קצר..." className="bg-[#1a1a1a] border-gray-700 text-white text-sm placeholder:text-gray-600 focus:border-purple-500" />
              </div>
              <div className="flex flex-wrap gap-2">
                {REEL_CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setReelCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                      reelCategory === cat.id ? "bg-purple-600 border-purple-500 text-white" : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"
                    }`}>
                    {cat.label}
                  </button>
                ))}
              </div>
              <input ref={reelVideoRef} type="file" accept="video/*" multiple className="hidden" onChange={handleReelUpload} />
              <button onClick={() => reelVideoRef.current?.click()} disabled={uploading === 'reel' || !reelTitle.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded-xl border border-purple-600/40 text-sm transition-colors disabled:opacity-50 w-full justify-center font-bold">
                {uploading === 'reel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clapperboard className="w-4 h-4" />}
                {uploading === 'reel' ? 'מעלה ריל...' : 'בחר קובץ וידאו לריל'}
              </button>
              {uploadedReels.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-green-400">
                  <Check className="w-3 h-3" /><span>{r.title}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}

// ---- Reel Thumbnail with error fallback ----
function ReelThumbnail({ reel, color }) {
  const [imgError, setImgError] = useState(false);
  const showPlaceholder = !reel.thumbnail_url || imgError;

  if (showPlaceholder) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-1"
        style={{ background: `linear-gradient(135deg, ${color}44 0%, #0a0a0a 60%, ${color}22 100%)` }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: color + '50', border: `1.5px solid ${color}` }}>
          <Play className="w-5 h-5 fill-white text-white" />
        </div>
        <p className="text-white text-[8px] font-bold text-center leading-tight line-clamp-3 px-1 mt-1">
          {reel.title}
        </p>
      </div>
    );
  }

  return (
    <img
      src={reel.thumbnail_url}
      alt={reel.title}
      className="w-full h-full object-cover"
      onError={() => setImgError(true)}
    />
  );
}

// ---- Inline Video Player Modal ----
function VideoPlayerModal({ video, onClose, onNext, onPrev, total, current }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
      setPlaying(true);
    }
  }, [video?.video_url]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else { videoRef.current.play(); setPlaying(true); }
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") onPrev();
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") onNext();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNext, onPrev, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] bg-black flex flex-col"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white font-bold truncate max-w-xs">{video.title}</span>
          <span className="text-gray-500 text-sm">{current + 1} / {total}</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Video */}
      <div className="flex-1 relative flex items-center justify-center bg-black" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={video.video_url}
          muted={muted}
          loop
          playsInline
          className="max-w-full max-h-full object-contain"
          style={{ maxHeight: 'calc(100vh - 120px)' }}
        />
        <AnimatePresence>
          {!playing && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/50 rounded-full p-5">
                <Play className="w-14 h-14 text-white fill-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prev / Next */}
        <button onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center transition-all">
          <ChevronUp className="w-6 h-6 text-white" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center transition-all">
          <ChevronDown className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 py-4 bg-black/80 border-t border-gray-800 flex-shrink-0">
        <button onClick={() => setMuted(m => !m)} className="p-3 hover:bg-gray-800 rounded-full transition-colors">
          {muted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
        </button>
        <button onClick={togglePlay} className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
          {playing ? <Pause className="w-7 h-7 text-white" /> : <Play className="w-7 h-7 text-white fill-white" />}
        </button>
        <button onClick={onPrev} className="p-3 hover:bg-gray-800 rounded-full transition-colors">
          <ChevronUp className="w-6 h-6 text-white" />
        </button>
        <button onClick={onNext} className="p-3 hover:bg-gray-800 rounded-full transition-colors">
          <ChevronDown className="w-6 h-6 text-white" />
        </button>
      </div>
    </motion.div>
  );
}

// ---- Category Reels Strip ----
function CategoryReelsStrip({ category, color }) {
  const [playerOpen, setPlayerOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const { data: reels = [] } = useQuery({
    queryKey: ['cat-reels', category],
    queryFn: () => base44.entities.UserVideo.filter({ category, status: 'ready' }, '-created_date', 20),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  if (reels.length === 0) return null;

  const openPlayer = (idx) => { setActiveIdx(idx); setPlayerOpen(true); };
  const goNext = () => setActiveIdx(i => Math.min(i + 1, reels.length - 1));
  const goPrev = () => setActiveIdx(i => Math.max(i - 1, 0));

  return (
    <div className="w-full px-2 sm:px-4 mb-3" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Strip header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 rounded-full" style={{ background: color }} />
          <span className="text-gray-300 text-sm font-bold">ריילס</span>
          <span className="text-gray-600 text-xs">({reels.length})</span>
        </div>
        {/* Horizontal scroll of thumbnails */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {reels.map((reel, i) => (
            <button key={reel.id} onClick={() => openPlayer(i)}
              className="flex-shrink-0 w-24 h-36 rounded-xl overflow-hidden relative border-2 transition-all hover:scale-105 active:scale-95 group"
              style={{ borderColor: color + '60' }}>
              {/* Background: thumbnail or styled placeholder */}
              <ReelThumbnail reel={reel} color={color} />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl" />
            </button>
          ))}
          {/* Open player button */}
          <button onClick={() => openPlayer(0)}
            className="flex-shrink-0 w-24 h-36 rounded-xl flex flex-col items-center justify-center gap-2 border-2 border-dashed transition-all hover:scale-105"
            style={{ borderColor: color + '50', background: color + '11' }}>
            <Tv className="w-6 h-6" style={{ color }} />
            <span className="text-[10px] font-bold text-center" style={{ color }}>פתח נגן</span>
          </button>
        </div>
      </div>

      {/* Player Modal */}
      <AnimatePresence>
        {playerOpen && reels[activeIdx] && (
          <VideoPlayerModal
            video={reels[activeIdx]}
            onClose={() => setPlayerOpen(false)}
            onNext={goNext}
            onPrev={goPrev}
            total={reels.length}
            current={activeIdx}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Single Category Row with editor ----
function CategoryRow({ category, label, color }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const queryClient = useQueryClient();

  const { data: topArticle } = useQuery({
    queryKey: ['cat-top', category],
    queryFn: async () => {
      const res = await base44.entities.NewsArticle.filter({ category }, '-created_date', 1);
      return res[0] || null;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const openNew = () => { setEditingArticle(null); setEditorOpen(true); };
  const openEdit = () => { setEditingArticle(topArticle); setEditorOpen(true); };
  const handleSaved = () => { setEditorOpen(false); queryClient.invalidateQueries({ queryKey: ['cat-top', category] }); };

  return (
    <div className="w-full px-2 sm:px-4 mb-6" dir="rtl">
      <div className="max-w-7xl mx-auto">

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 rounded-full" style={{ background: color }} />
            <h2 className="text-white font-bold text-lg">{label}</h2>
            {topArticle?.is_breaking && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">🔴 חם</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openNew}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg border border-green-600/30 transition-colors">
              <Plus className="w-3.5 h-3.5" /> כתבה חדשה
            </button>
            {topArticle && (
              <button onClick={openEdit}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#0057B8]/20 hover:bg-[#0057B8]/40 text-[#0057B8] rounded-lg border border-[#0057B8]/30 transition-colors">
                <Edit3 className="w-3.5 h-3.5" /> עורך מתקדם
              </button>
            )}
            <Link to={createPageUrl(`Category?cat=${category}`)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg border border-gray-700 transition-colors">
              כל הכתבות →
            </Link>
          </div>
        </div>

        {/* Article Display — same layout as FeaturedArticleEditor */}
        <div className="bg-[#0d0d0d] rounded-2xl overflow-hidden border border-gray-800">
          {topArticle ? (
            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: '60vh' }}>
              {/* Media */}
              <div className="relative bg-black flex items-stretch" style={{ minHeight: 360 }}>
                {topArticle.video_url ? (
                  <video src={topArticle.video_url} controls playsInline className="w-full object-cover" style={{ minHeight: 360, maxHeight: '70vh' }} />
                ) : topArticle.image_url ? (
                  <img src={topArticle.image_url} alt={topArticle.title} className="w-full object-cover" style={{ minHeight: 360, maxHeight: '70vh' }} />
                ) : (
                  <div className="w-full flex items-center justify-center" style={{ minHeight: 360, background: color + '22' }}>
                    <span className="text-7xl opacity-20">📰</span>
                  </div>
                )}
              </div>
              {/* Content */}
              <div className="flex flex-col p-5 sm:p-8 gap-4">
                <span className="text-xs font-bold px-3 py-1 rounded-lg w-fit text-white" style={{ background: color }}>{label}</span>
                <h2 className="text-white text-2xl sm:text-3xl font-bold leading-tight">{topArticle.title}</h2>
                {topArticle.subtitle && <p className="text-gray-300 text-base sm:text-lg">{topArticle.subtitle}</p>}
                {topArticle.content && (
                  <p className="text-gray-400 text-sm leading-relaxed flex-1" style={{ whiteSpace: 'pre-wrap' }}>
                    {topArticle.content.length > 400 ? topArticle.content.slice(0, 400) + '...' : topArticle.content}
                  </p>
                )}
                {topArticle.source && <p className="text-gray-500 text-xs">מקור: {topArticle.source}</p>}
                <div className="mt-auto pt-3 flex items-center gap-3">
                  <Link to={createPageUrl(`Article?id=${topArticle.id}`)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-colors hover:opacity-90"
                    style={{ background: color }}>
                    קרא עוד →
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-600" style={{ minHeight: '60vh' }}>
              <span className="text-5xl">📭</span>
              <p className="text-sm">אין כתבות בקטגוריה זו</p>
              <button onClick={openNew} className="flex items-center gap-1 px-4 py-2 text-sm bg-green-600/20 text-green-400 rounded-xl border border-green-600/30 hover:bg-green-600/30 transition-colors">
                <Plus className="w-4 h-4" /> הוסף כתבה ראשונה
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {editorOpen && (
          <EditorModal
            article={editingArticle}
            category={category}
            onClose={() => setEditorOpen(false)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- VOD Strip (standalone, shown at bottom) ----
function VODStrip() {
  const [playerOpen, setPlayerOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [reelTitle, setReelTitle] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const reelVideoRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: reels = [] } = useQuery({
    queryKey: ['cat-reels', 'vod'],
    queryFn: () => base44.entities.UserVideo.filter({ category: 'vod', status: 'ready' }, '-created_date', 30),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    if (!reelTitle.trim()) { toast.error("חובה להזין כותרת"); return; }
    setUploading(true);
    try {
      for (const file of files) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 60 * 60 * 24 * 365 });
        await base44.entities.UserVideo.create({
          title: reelTitle, video_url: signed_url,
          category: 'vod', feed: 'tiktok', status: 'ready',
          uploader_email: 'admin', views: 0, likes: 0,
        });
      }
      toast.success("הועלה ל-VOD!");
      setReelTitle("");
      queryClient.invalidateQueries({ queryKey: ['cat-reels', 'vod'] });
    } finally { setUploading(false); e.target.value = ''; }
  };

  const openPlayer = (idx) => { setActiveIdx(idx); setPlayerOpen(true); };
  const goNext = () => setActiveIdx(i => Math.min(i + 1, reels.length - 1));
  const goPrev = () => setActiveIdx(i => Math.max(i - 1, 0));

  return (
    <div className="w-full px-2 sm:px-4 mb-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 rounded-full bg-[#E31E24]" />
            <Tv className="w-5 h-5 text-[#E31E24]" />
            <h2 className="text-white font-bold text-lg">VOD</h2>
            {reels.length > 0 && <span className="text-gray-500 text-xs">({reels.length})</span>}
          </div>
          <button onClick={() => setEditorOpen(e => !e)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#E31E24]/20 hover:bg-[#E31E24]/40 text-[#E31E24] rounded-lg border border-[#E31E24]/30 transition-colors">
            <Plus className="w-3.5 h-3.5" /> הוסף VOD
          </button>
        </div>

        {/* Quick upload form */}
        <AnimatePresence>
          {editorOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-3 p-4 bg-[#0d0d0d] rounded-2xl border border-[#E31E24]/30 flex gap-3 items-center flex-wrap overflow-hidden">
              <Input value={reelTitle} onChange={e => setReelTitle(e.target.value)}
                placeholder="כותרת הסרטון..." className="flex-1 min-w-40 bg-[#1a1a1a] border-gray-700 text-white text-sm placeholder:text-gray-600" />
              <input ref={reelVideoRef} type="file" accept="video/*" multiple className="hidden" onChange={handleUpload} />
              <button onClick={() => reelVideoRef.current?.click()} disabled={uploading || !reelTitle.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#E31E24]/30 hover:bg-[#E31E24]/50 text-white rounded-xl border border-[#E31E24]/40 text-sm transition-colors disabled:opacity-50 font-bold">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'מעלה...' : 'העלה סרטון'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thumbnails strip */}
        {reels.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {reels.map((reel, i) => (
              <button key={reel.id} onClick={() => openPlayer(i)}
                className="flex-shrink-0 w-24 h-36 rounded-xl overflow-hidden relative border-2 border-[#E31E24]/40 transition-all hover:scale-105 active:scale-95 group">
                <ReelThumbnail reel={reel} color="#E31E24" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl" />
              </button>
            ))}
            <button onClick={() => openPlayer(0)}
              className="flex-shrink-0 w-24 h-36 rounded-xl flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#E31E24]/40 hover:scale-105 transition-all"
              style={{ background: '#E31E2411' }}>
              <Tv className="w-6 h-6 text-[#E31E24]" />
              <span className="text-[10px] font-bold text-[#E31E24]">פתח נגן</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-gray-600 border border-dashed border-gray-800 rounded-2xl">
            <p className="text-sm">אין סרטוני VOD עדיין — לחץ "הוסף VOD" להעלאה</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {playerOpen && reels[activeIdx] && (
          <VideoPlayerModal video={reels[activeIdx]} onClose={() => setPlayerOpen(false)}
            onNext={goNext} onPrev={goPrev} total={reels.length} current={activeIdx} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- All Categories ----
const ALL_CATEGORIES = [
  { id: "breaking", label: "חדשות עכשיו", color: "#E31E24" },
  { id: "security", label: "ביטחון ומדיניות", color: "#F97316" },
  { id: "economy", label: "כלכלה ועסקים", color: "#16A34A" },
  { id: "politics", label: "פוליטיקה", color: "#9333EA" },
  { id: "technology", label: "טכנולוגיה", color: "#2563EB" },
  { id: "sports", label: "ספורט", color: "#059669" },
  { id: "entertainment", label: "בידור ותרבות", color: "#EC4899" },
  { id: "world", label: "חדשות עולם", color: "#4F46E5" },
  { id: "health", label: "בריאות", color: "#0D9488" },
  { id: "crime", label: "פלילים ומשטרה", color: "#B91C1C" },
  { id: "israel", label: "חדשות ישראל", color: "#1D4ED8" },
  { id: "military", label: "צבא וביטחון", color: "#475569" },
  { id: "education", label: "חינוך", color: "#D97706" },
  { id: "culture", label: "תרבות", color: "#7C3AED" },
  { id: "environment", label: "סביבה", color: "#15803D" },
  { id: "science", label: "מדע", color: "#0369A1" },
  { id: "music", label: "מוזיקה", color: "#DB2777" },
  { id: "local", label: "חדשות מקומיות", color: "#92400E" },
  { id: "law", label: "משפט ופלילים", color: "#6B21A8" },
  { id: "finance", label: "פיננסים", color: "#065F46" },
];

export default function AllCategoryEditors() {
  return (
    <div className="w-full">
      {ALL_CATEGORIES.map(cat => (
        <React.Fragment key={cat.id}>
          <CategoryRow category={cat.id} label={cat.label} color={cat.color} />
          <CategoryReelsStrip category={cat.id} color={cat.color} />
        </React.Fragment>
      ))}
      {/* VOD Strip at the bottom */}
      <VODStrip />
    </div>
  );
}