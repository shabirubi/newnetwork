import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3, Save, X, Image, Video, Tag, Play, Pause,
  ChevronDown, Plus, Trash2, Check, Loader2, Camera,
  Upload, ChevronLeft, ChevronRight, Clapperboard
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "breaking", label: "חדשות עכשיו" },
  { id: "security", label: "ביטחון ומדיניות" },
  { id: "economy", label: "כלכלה ועסקים" },
  { id: "politics", label: "פוליטיקה" },
  { id: "technology", label: "טכנולוגיה" },
  { id: "sports", label: "ספורט" },
  { id: "entertainment", label: "בידור ותרבות" },
  { id: "world", label: "חדשות עולם" },
  { id: "health", label: "בריאות" },
  { id: "israel", label: "חדשות ישראל" },
  { id: "crime", label: "פלילים ומשטרה" },
  { id: "education", label: "חינוך" },
  { id: "culture", label: "תרבות" },
  { id: "environment", label: "סביבה" },
  { id: "science", label: "מדע" },
  { id: "military", label: "צבא וביטחון" },
  { id: "law", label: "משפט ופלילים" },
  { id: "local", label: "חדשות מקומיות" },
  { id: "music", label: "מוזיקה" },
  { id: "horoscope", label: "הורוסקופ" },
  { id: "finance", label: "פיננסים" },
];

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
  { id: "horoscope", label: "הורוסקופ" },
  { id: "finance", label: "פיננסים" },
];

const emptyForm = {
  title: "", subtitle: "", content: "", category: "breaking",
  image_url: "", video_url: "", is_breaking: false, is_featured: true, source: "",
  extra_images: [],
  extra_videos: [],
};

// ---- Media Gallery Viewer ----
function MediaGallery({ images = [], videos = [], mainImage, mainVideo }) {
  const all = [
    ...(mainVideo ? [{ type: 'video', url: mainVideo }] : []),
    ...(mainImage ? [{ type: 'image', url: mainImage }] : []),
    ...videos.map(u => ({ type: 'video', url: u })),
    ...images.map(u => ({ type: 'image', url: u })),
  ];
  const [idx, setIdx] = useState(0);
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => { setIdx(0); setPlaying(false); }, [mainVideo, mainImage]);

  if (all.length === 0) {
    return (
      <div className="w-full aspect-[3/4] bg-gray-900 rounded-2xl flex items-center justify-center">
        <div className="text-center text-gray-600 p-4">
          <Camera className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-xs">אין תמונה או וידאו</p>
        </div>
      </div>
    );
  }

  const current = all[idx] || all[0];

  const togglePlay = () => {
    if (!videoRef.current) return;
    playing ? videoRef.current.pause() : videoRef.current.play();
    setPlaying(p => !p);
  };

  return (
    <div className="w-full">
      {/* Main viewer */}
      <div className="relative w-full aspect-[3/4] bg-black rounded-2xl overflow-hidden">
        {current.type === 'video' ? (
          <>
            <video
              ref={videoRef}
              src={current.url}
              className="w-full h-full object-contain"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              playsInline
            />
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                {playing ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white fill-white" />}
              </div>
            </div>
            <span className="absolute top-2 left-2 bg-[#0057B8] text-white text-[9px] font-bold px-2 py-0.5 rounded">וידאו</span>
          </>
        ) : (
          <img src={current.url} alt="" className="w-full h-full object-cover" />
        )}

        {all.length > 1 && (
          <>
            <button
              onClick={() => setIdx(i => (i - 1 + all.length) % all.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-all"
            ><ChevronRight className="w-4 h-4" /></button>
            <button
              onClick={() => setIdx(i => (i + 1) % all.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-all"
            ><ChevronLeft className="w-4 h-4" /></button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {all.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {all.length > 1 && (
        <div className="flex gap-1.5 p-1.5 mt-2 overflow-x-auto">
          {all.map((item, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === idx ? 'border-[#0057B8]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
              {item.type === 'video'
                ? <div className="w-full h-full bg-gray-800 flex items-center justify-center"><Play className="w-3 h-3 text-white" /></div>
                : <img src={item.url} alt="" className="w-full h-full object-cover" />
              }
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Editor Modal ----
function EditorModal({ article, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...(article ? {
      title: article.title || "",
      subtitle: article.subtitle || "",
      content: article.content || "",
      category: article.category || "breaking",
      image_url: article.image_url || "",
      video_url: article.video_url || "",
      is_breaking: article.is_breaking || false,
      is_featured: true,
      source: article.source || "",
      extra_images: article.extra_images || [],
      extra_videos: article.extra_videos || [],
    } : {})
  }));

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [reelCategory, setReelCategory] = useState("breaking");
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
    } finally {
      setUploading(null);
    }
  };

  const uploadVideo = async (file, type) => {
    setUploading(type);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 60 * 60 * 24 * 365 });
      return signed_url;
    } finally {
      setUploading(null);
    }
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
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
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
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    toast.info("מעלה סרטונים, אנא המתן...");
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

  const removeExtraImage = (i) => setForm(f => ({ ...f, extra_images: f.extra_images.filter((_, j) => j !== i) }));
  const removeExtraVideo = (i) => setForm(f => ({ ...f, extra_videos: f.extra_videos.filter((_, j) => j !== i) }));

  const handleReelUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (!reelTitle.trim()) { toast.error("חובה להזין כותרת לריל"); return; }
    toast.info("מעלה ריל, אנא המתן...");
    setUploading('reel');
    try {
      for (const file of files) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 60 * 60 * 24 * 365 });
        await base44.entities.UserVideo.create({
          title: reelTitle,
          description: reelDescription,
          video_url: signed_url,
          category: reelCategory,
          feed: "tiktok",
          status: "ready",
          uploader_email: "admin",
          views: 0,
          likes: 0,
        });
        setUploadedReels(r => [...r, { title: reelTitle, category: reelCategory }]);
      }
      toast.success("הריל הועלה בהצלחה!");
      setReelTitle("");
      setReelDescription("");
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("חובה להזין כותרת"); return; }
    setSaving(true);
    try {
      if (!article?.id) {
        const allArticles = await base44.entities.NewsArticle.list();
        for (const art of allArticles) {
          if (art.is_featured) {
            await base44.entities.NewsArticle.update(art.id, { is_featured: false });
          }
        }
        await base44.entities.NewsArticle.create({ ...form, is_featured: true });
      } else {
        await base44.entities.NewsArticle.update(article.id, form);
      }
      queryClient.invalidateQueries({ queryKey: ['featured-main-article'] });
      queryClient.invalidateQueries({ queryKey: ['featured-articles'] });
      queryClient.invalidateQueries({ queryKey: ['cat-articles'] });
      queryClient.invalidateQueries({ queryKey: ['home-all-videos'] });
      toast.success("הכתבה נשמרה!");
      onSaved();
    } catch {
      toast.error("שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  const selectedCat = CATEGORIES.find(c => c.id === form.category);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.95)' }}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg max-h-[95vh] flex flex-col bg-[#0d0d0d] rounded-t-3xl sm:rounded-2xl border-t sm:border border-gray-800 overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#111] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-[#0057B8]" />
            <h2 className="text-white font-bold text-base">עורך כתבה</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E31E24] hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              שמור
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Category & Breaking */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1">
              <button
                onClick={() => setCategoryOpen(o => !o)}
                className="w-full flex items-center justify-between px-3 py-2 bg-[#0057B8]/20 hover:bg-[#0057B8]/30 text-[#0057B8] rounded-xl border border-[#0057B8]/30 text-sm transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  {selectedCat?.label || "בחר קטגוריה"}
                </span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <AnimatePresence>
                {categoryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full mt-1 right-0 z-50 bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto w-full"
                  >
                    {CATEGORIES.map(cat => (
                      <button key={cat.id}
                        onClick={() => { setForm(f => ({ ...f, category: cat.id })); setCategoryOpen(false); }}
                        className="w-full text-right px-3 py-2 text-sm text-gray-300 hover:bg-[#0057B8]/20 hover:text-white flex items-center justify-between"
                      >
                        {cat.label}
                        {form.category === cat.id && <Check className="w-4 h-4 text-[#0057B8]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setForm(f => ({ ...f, is_breaking: !f.is_breaking }))}
              className={`px-3 py-2 rounded-xl border text-sm font-bold transition-colors ${
                form.is_breaking ? 'bg-red-600/30 border-red-600/50 text-red-400' : 'bg-gray-800 border-gray-700 text-gray-500'
              }`}
            >
              🔴 חם
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="text-gray-400 text-xs mb-1.5 block font-bold">כותרת ראשית *</label>
            <Input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="כותרת ראשית..."
              className="bg-[#1a1a1a] border-gray-700 text-white text-base font-bold placeholder:text-gray-600 focus:border-[#0057B8]"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="text-gray-400 text-xs mb-1.5 block">כותרת משנה</label>
            <Input
              value={form.subtitle}
              onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
              placeholder="כותרת משנה..."
              className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-600 focus:border-[#0057B8]"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-gray-400 text-xs mb-1.5 block">תוכן הכתבה</label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="כתוב את תוכן הכתבה כאן..."
              rows={6}
              className="w-full bg-[#1a1a1a] border border-gray-700 text-white text-sm rounded-xl p-3 placeholder:text-gray-600 focus:border-[#0057B8] focus:outline-none resize-none"
            />
          </div>

          {/* Source */}
          <div>
            <label className="text-gray-400 text-xs mb-1.5 block">מקור</label>
            <Input
              value={form.source}
              onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
              placeholder="מקור הכתבה..."
              className="bg-[#1a1a1a] border-gray-700 text-white text-sm placeholder:text-gray-600 focus:border-[#0057B8]"
            />
          </div>

          {/* Main Video */}
          <div className="border border-gray-800 rounded-xl p-3">
            <label className="text-gray-400 text-xs mb-2 block font-bold">וידאו ראשי</label>
            <input ref={mainVideoRef} type="file" accept="video/*" className="hidden" onChange={handleMainVideo} />
            <div className="flex gap-2 items-center flex-wrap">
              <button
                onClick={() => mainVideoRef.current?.click()}
                disabled={uploading === 'main-video'}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-xl border border-purple-600/30 text-sm transition-colors disabled:opacity-50"
              >
                {uploading === 'main-video' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                העלה וידאו
              </button>
              {form.video_url && (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-green-400 text-xs truncate flex-1">✓ וידאו הועלה</span>
                  <button onClick={() => setForm(f => ({ ...f, video_url: '' }))} className="text-gray-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Image */}
          <div className="border border-gray-800 rounded-xl p-3">
            <label className="text-gray-400 text-xs mb-2 block font-bold">תמונה ראשית</label>
            <input ref={mainImageRef} type="file" accept="image/*" className="hidden" onChange={handleMainImage} />
            <div className="flex gap-2 items-center flex-wrap">
              <button
                onClick={() => mainImageRef.current?.click()}
                disabled={uploading === 'main-image'}
                className="flex items-center gap-2 px-3 py-2 bg-[#0057B8]/20 hover:bg-[#0057B8]/40 text-[#0057B8] rounded-xl border border-[#0057B8]/30 text-sm transition-colors disabled:opacity-50"
              >
                {uploading === 'main-image' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                העלה תמונה
              </button>
              {form.image_url && (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <img src={form.image_url} alt="" className="h-8 w-12 object-cover rounded" />
                  <button onClick={() => setForm(f => ({ ...f, image_url: '' }))} className="text-gray-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Extra Videos */}
          <div className="border border-gray-800 rounded-xl p-3">
            <label className="text-gray-400 text-xs mb-2 block font-bold">סרטונים נוספים</label>
            <input ref={extraVideoRef} type="file" accept="video/*" multiple className="hidden" onChange={handleExtraVideos} />
            <button
              onClick={() => extraVideoRef.current?.click()}
              disabled={uploading === 'extra-video'}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-xl border border-purple-600/30 text-sm transition-colors disabled:opacity-50 mb-3"
            >
              {uploading === 'extra-video' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              הוסף סרטונים
            </button>
            {form.extra_videos?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.extra_videos.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 bg-gray-900 rounded-lg overflow-hidden border border-purple-600/30 flex items-center justify-center">
                    <Play className="w-5 h-5 text-purple-400" />
                    <button
                      onClick={() => removeExtraVideo(i)}
                      className="absolute top-1 left-1 bg-black/60 rounded-full p-0.5 text-red-400 hover:text-red-300"
                    ><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Extra Images */}
          <div className="border border-gray-800 rounded-xl p-3">
            <label className="text-gray-400 text-xs mb-2 block font-bold">תמונות נוספות</label>
            <input ref={extraImageRef} type="file" accept="image/*" multiple className="hidden" onChange={handleExtraImages} />
            <button
              onClick={() => extraImageRef.current?.click()}
              disabled={uploading === 'extra-image'}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#0057B8]/20 hover:bg-[#0057B8]/40 text-[#0057B8] rounded-xl border border-[#0057B8]/30 text-sm transition-colors disabled:opacity-50 mb-3"
            >
              {uploading === 'extra-image' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              הוסף תמונות
            </button>
            {form.extra_images?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.extra_images.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#0057B8]/30">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeExtraImage(i)}
                      className="absolute top-1 left-1 bg-black/60 rounded-full p-0.5 text-red-400 hover:text-red-300"
                    ><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reels Section */}
          <div className="border border-purple-800/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-3">
              <Clapperboard className="w-4 h-4 text-purple-400" />
              <h3 className="text-white font-bold text-sm">העלאת ריל</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">כותרת הריל *</label>
                <Input
                  value={reelTitle}
                  onChange={e => setReelTitle(e.target.value)}
                  placeholder="כותרת הריל..."
                  className="bg-[#1a1a1a] border-gray-700 text-white text-sm placeholder:text-gray-600 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">קטגוריה</label>
                <div className="flex flex-wrap gap-1.5">
                  {REEL_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setReelCategory(cat.id)}
                      className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all border ${
                        reelCategory === cat.id
                          ? "bg-purple-600 border-purple-500 text-white"
                          : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <input ref={reelVideoRef} type="file" accept="video/*" multiple className="hidden" onChange={handleReelUpload} />
              <button
                onClick={() => reelVideoRef.current?.click()}
                disabled={uploading === 'reel' || !reelTitle.trim()}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded-xl border border-purple-600/40 text-sm transition-colors disabled:opacity-50 font-bold"
              >
                {uploading === 'reel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clapperboard className="w-4 h-4" />}
                {uploading === 'reel' ? 'מעלה...' : 'העלה ריל'}
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}

// ---- Main Component ----
export default function FeaturedArticleEditor() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false);
  const queryClient = useQueryClient();

  const { data: article, isLoading } = useQuery({
    queryKey: ['featured-main-article'],
    queryFn: async () => {
      const all = await base44.entities.NewsArticle.filter({ is_featured: true }, '-created_date', 1);
      if (all.length > 0) return all[0];
      const latest = await base44.entities.NewsArticle.list('-created_date', 1);
      return latest[0] || null;
    },
    staleTime: 30 * 1000
  });

  const selectedCat = CATEGORIES.find(c => c.id === article?.category);

  const openEdit = () => { setCreatingNew(false); setEditorOpen(true); };
  const openNew = () => { setCreatingNew(true); setEditorOpen(true); };
  const handleSaved = () => { setEditorOpen(false); queryClient.invalidateQueries({ queryKey: ['featured-main-article'] }); };

  if (isLoading) {
    return <div className="w-full h-[50vh] bg-[#0d0d0d] rounded-2xl animate-pulse mx-2 sm:mx-4 mb-6" />;
  }

  const displayImages = article?.extra_images || [];
  const displayVideos = article?.extra_videos || [];

  return (
    <div className="w-full px-2 sm:px-4 mb-6" dir="rtl">
      <div className="max-w-7xl mx-auto">

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-[#E31E24] rounded-full" />
            <h2 className="text-white font-bold text-lg">כתבה מרכזית</h2>
          </div>
          <div className="flex items-center gap-2">
            {article?.is_breaking && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">🔴 חם</span>
            )}
            <button
              onClick={article ? openEdit : openNew}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0057B8] hover:bg-[#1a6fd4] text-white text-xs font-bold rounded-xl transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              {article ? 'ערוך' : 'צור כתבה'}
            </button>
          </div>
        </div>

        {/* Article Display - Mobile First Layout */}
        <div className="bg-[#0d0d0d] rounded-2xl overflow-hidden border border-gray-800">
          <div className="flex flex-col">
            
            {/* Media Section - Full Width on Mobile */}
            <div className="w-full p-3">
              <MediaGallery
                mainImage={article?.image_url}
                mainVideo={article?.video_url}
                images={displayImages}
                videos={displayVideos}
              />
            </div>

            {/* Content Section */}
            <div className="w-full flex flex-col p-4 gap-2">
              {selectedCat && (
                <span className="px-2 py-1 bg-[#0057B8]/20 text-[#0057B8] rounded text-xs font-bold w-fit">
                  {selectedCat.label}
                </span>
              )}
              <h1 className="text-white text-base sm:text-lg font-bold leading-tight break-words">
                {article?.title || "אין כתבה מרכזית"}
              </h1>
              {article?.subtitle && (
                <p className="text-gray-300 text-xs sm:text-sm leading-snug break-words">{article.subtitle}</p>
              )}
              {article?.content && (
                <p className="text-gray-400 text-xs sm:text-sm leading-snug break-words line-clamp-3">
                  {article.content}
                </p>
              )}
              {article && (
                <a href={`/Article?id=${article.id}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0057B8] hover:bg-[#1a6fd4] text-white text-xs font-bold rounded-xl transition-colors w-fit mt-1"
                >
                  קרא עוד →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {editorOpen && (
          <EditorModal
            article={creatingNew ? null : article}
            onClose={() => setEditorOpen(false)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}