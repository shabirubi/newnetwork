import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3, Save, X, Image, Video, Play,
  Plus, Trash2, Check, Loader2, Clapperboard, Upload
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const BUILTIN_CATEGORIES = [
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
  { id: "vod", label: "VOD", color: "#E31E24" },
];

function getCustomCategories() {
  try { return JSON.parse(localStorage.getItem('customCategories') || '[]'); } catch { return []; }
}

export default function ArticleEditorModal({ article, onClose, onSaved }) {
  const allCategories = [...BUILTIN_CATEGORIES, ...getCustomCategories()];

  const [form, setForm] = useState({
    title: article?.title || "",
    subtitle: article?.subtitle || "",
    content: article?.content || "",
    category: article?.category || "breaking",
    custom_category: article?.custom_category || "",
    image_url: article?.image_url || "",
    video_url: article?.video_url || "",
    is_breaking: article?.is_breaking || false,
    is_featured: article?.is_featured || false,
    source: article?.source || "",
    extra_images: article?.extra_images || [],
    extra_videos: article?.extra_videos || [],
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [reelTitle, setReelTitle] = useState("");
  const [reelDescription, setReelDescription] = useState("");
  const [reelCategory, setReelCategory] = useState(article?.category || "breaking");
  const [uploadedReels, setUploadedReels] = useState([]);

  const mainImageRef = useRef(null);
  const mainVideoRef = useRef(null);
  const extraImageRef = useRef(null);
  const extraVideoRef = useRef(null);
  const reelVideoRef = useRef(null);
  const queryClient = useQueryClient();

  const uploadFile = async (file, type, isPrivate = false) => {
    setUploading(type);
    try {
      if (isPrivate) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 60 * 60 * 24 * 365 });
        return signed_url;
      }
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    } finally { setUploading(null); }
  };

  const handleMainImage = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const url = await uploadFile(file, 'main-image', false);
    setForm(f => ({ ...f, image_url: url }));
    toast.success("תמונה הועלתה"); e.target.value = '';
  };

  const handleMainVideo = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    toast.info("מעלה וידאו...");
    const url = await uploadFile(file, 'main-video', true);
    setForm(f => ({ ...f, video_url: url }));
    toast.success("וידאו הועלה"); e.target.value = '';
  };

  const handleExtraImages = async (e) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    setUploading('extra-image');
    const urls = [];
    for (const file of files) urls.push(await base44.integrations.Core.UploadFile({ file }).then(r => r.file_url));
    setUploading(null);
    setForm(f => ({ ...f, extra_images: [...(f.extra_images || []), ...urls] }));
    toast.success(`${urls.length} תמונות הועלו`); e.target.value = '';
  };

  const handleExtraVideos = async (e) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    setUploading('extra-video');
    const urls = [];
    for (const file of files) {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 60 * 60 * 24 * 365 });
      urls.push(signed_url);
    }
    setUploading(null);
    setForm(f => ({ ...f, extra_videos: [...(f.extra_videos || []), ...urls] }));
    toast.success(`${urls.length} סרטונים הועלו`); e.target.value = '';
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
        setUploadedReels(r => [...r, { title: reelTitle }]);
      }
      toast.success("הריל הועלה!");
      setReelTitle(""); setReelDescription("");
    } finally { setUploading(null); e.target.value = ''; }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("חובה להזין כותרת"); return; }
    setSaving(true);
    try {
      const isCustomCat = allCategories.find(c => c.id === form.category)?.isCustom;
      const data = { ...form };
      if (!isCustomCat) delete data.custom_category;
      if (article?.id) {
        await base44.entities.NewsArticle.update(article.id, data);
      } else {
        await base44.entities.NewsArticle.create(data);
      }
      queryClient.invalidateQueries({ queryKey: ['featured-articles'] });
      toast.success("הכתבה נשמרה!");
      onSaved();
    } catch { toast.error("שגיאה בשמירה"); }
    finally { setSaving(false); }
  };

  const selectedCat = allCategories.find(c => c.id === form.category);

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
            <h2 className="text-white font-bold text-base">
              {article ? 'עריכת כתבה' : 'כתבה חדשה'}
              {selectedCat && <span className="mr-2 text-xs px-2 py-0.5 rounded-full" style={{ background: selectedCat.color + '30', color: selectedCat.color }}>{selectedCat.label}</span>}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#E31E24] hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} שמור
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Category */}
          <div>
            <label className="text-gray-400 text-xs mb-2 block">קטגוריה *</label>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
              {allCategories.map(cat => (
                <button key={cat.id} onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                  className="px-3 py-1 rounded-full text-xs font-bold transition-all border"
                  style={form.category === cat.id
                    ? { background: cat.color, borderColor: cat.color, color: 'white' }
                    : { background: 'transparent', borderColor: '#444', color: '#888' }}>
                  {cat.label}{cat.isCustom ? ' ★' : ''}
                </button>
              ))}
            </div>
            {allCategories.find(c => c.id === form.category)?.isCustom && (
              <Input value={form.custom_category} onChange={e => setForm(f => ({ ...f, custom_category: e.target.value }))}
                placeholder="שם הקטגוריה..." className="mt-2 bg-[#1a1a1a] border-gray-700 text-white text-sm placeholder:text-gray-600 focus:border-[#0057B8]" />
            )}
          </div>

          {/* Flags */}
          <div className="flex items-center gap-3">
            <button onClick={() => setForm(f => ({ ...f, is_breaking: !f.is_breaking }))}
              className={`px-3 py-2 rounded-xl border text-sm font-bold transition-colors ${form.is_breaking ? 'bg-red-600/30 border-red-600/50 text-red-400' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
              🔴 סמן כחם
            </button>
            <button onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))}
              className={`px-3 py-2 rounded-xl border text-sm font-bold transition-colors ${form.is_featured ? 'bg-[#0057B8]/30 border-[#0057B8]/50 text-[#0057B8]' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
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
              placeholder="כתוב את תוכן הכתבה כאן..." rows={6}
              className="w-full bg-[#1a1a1a] border border-gray-700 text-white text-sm rounded-xl p-3 placeholder:text-gray-600 focus:border-[#0057B8] focus:outline-none resize-none" />
          </div>

          {/* Source */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">מקור</label>
            <Input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
              placeholder="מקור הכתבה..." className="bg-[#1a1a1a] border-gray-700 text-white text-sm placeholder:text-gray-600 focus:border-[#0057B8]" />
          </div>

          {/* Media */}
          <div className="border border-gray-800 rounded-2xl overflow-hidden">
            <div className="bg-[#111] px-4 py-3 border-b border-gray-800">
              <h3 className="text-white font-bold text-sm flex items-center gap-2"><Upload className="w-4 h-4 text-[#0057B8]" /> מדיה</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-gray-400 text-xs mb-2 block">וידאו ראשי</label>
                <input ref={mainVideoRef} type="file" accept="video/*" className="hidden" onChange={handleMainVideo} />
                <div className="flex gap-2 items-center flex-wrap">
                  <button onClick={() => mainVideoRef.current?.click()} disabled={uploading === 'main-video'}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-xl border border-purple-600/30 text-sm disabled:opacity-50">
                    {uploading === 'main-video' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />} העלה וידאו
                  </button>
                  {form.video_url && <><span className="text-green-400 text-xs">✓ הועלה</span><button onClick={() => setForm(f => ({ ...f, video_url: '' }))} className="text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button></>}
                </div>
                <Input value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
                  placeholder="או הדבק URL..." className="mt-2 bg-[#1a1a1a] border-gray-700 text-white text-xs placeholder:text-gray-600 focus:border-[#0057B8]" />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-2 block">תמונה ראשית</label>
                <input ref={mainImageRef} type="file" accept="image/*" className="hidden" onChange={handleMainImage} />
                <div className="flex gap-2 items-center flex-wrap">
                  <button onClick={() => mainImageRef.current?.click()} disabled={uploading === 'main-image'}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0057B8]/20 hover:bg-[#0057B8]/40 text-[#0057B8] rounded-xl border border-[#0057B8]/30 text-sm disabled:opacity-50">
                    {uploading === 'main-image' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />} העלה תמונה
                  </button>
                  {form.image_url && <><img src={form.image_url} alt="" className="h-10 w-16 object-cover rounded" /><button onClick={() => setForm(f => ({ ...f, image_url: '' }))} className="text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button></>}
                </div>
                <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  placeholder="או הדבק URL..." className="mt-2 bg-[#1a1a1a] border-gray-700 text-white text-xs placeholder:text-gray-600 focus:border-[#0057B8]" />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-2 block">סרטונים נוספים</label>
                <input ref={extraVideoRef} type="file" accept="video/*" multiple className="hidden" onChange={handleExtraVideos} />
                <button onClick={() => extraVideoRef.current?.click()} disabled={uploading === 'extra-video'}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-xl border border-purple-600/30 text-sm disabled:opacity-50 mb-2">
                  {uploading === 'extra-video' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} הוסף סרטונים
                </button>
                {form.extra_videos?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.extra_videos.map((url, i) => (
                      <div key={i} className="relative w-24 h-16 bg-gray-900 rounded-lg overflow-hidden border border-purple-600/30 flex items-center justify-center">
                        <Play className="w-5 h-5 text-purple-400" />
                        <button onClick={() => setForm(f => ({ ...f, extra_videos: f.extra_videos.filter((_, j) => j !== i) }))}
                          className="absolute top-0.5 left-0.5 bg-black/60 rounded-full p-0.5 text-red-400"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-2 block">תמונות נוספות</label>
                <input ref={extraImageRef} type="file" accept="image/*" multiple className="hidden" onChange={handleExtraImages} />
                <button onClick={() => extraImageRef.current?.click()} disabled={uploading === 'extra-image'}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0057B8]/20 hover:bg-[#0057B8]/40 text-[#0057B8] rounded-xl border border-[#0057B8]/30 text-sm disabled:opacity-50 mb-2">
                  {uploading === 'extra-image' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} הוסף תמונות
                </button>
                {form.extra_images?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.extra_images.map((url, i) => (
                      <div key={i} className="relative w-24 h-16 rounded-lg overflow-hidden border border-[#0057B8]/30">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setForm(f => ({ ...f, extra_images: f.extra_images.filter((_, j) => j !== i) }))}
                          className="absolute top-0.5 left-0.5 bg-black/60 rounded-full p-0.5 text-red-400"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reels */}
          <div className="border border-purple-800/50 rounded-2xl overflow-hidden">
            <div className="bg-[#111] px-4 py-3 border-b border-purple-800/50">
              <h3 className="text-white font-bold text-sm flex items-center gap-2"><Clapperboard className="w-4 h-4 text-purple-400" /> העלאת ריל</h3>
            </div>
            <div className="p-4 space-y-3">
              <Input value={reelTitle} onChange={e => setReelTitle(e.target.value)} placeholder="כותרת הריל *..." className="bg-[#1a1a1a] border-gray-700 text-white text-sm placeholder:text-gray-600 focus:border-purple-500" />
              <Input value={reelDescription} onChange={e => setReelDescription(e.target.value)} placeholder="תיאור (אופציונלי)..." className="bg-[#1a1a1a] border-gray-700 text-white text-sm placeholder:text-gray-600 focus:border-purple-500" />
              <div className="flex flex-wrap gap-1">
                {allCategories.map(cat => (
                  <button key={cat.id} onClick={() => setReelCategory(cat.id)}
                    className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all border ${reelCategory === cat.id ? "bg-purple-600 border-purple-500 text-white" : "bg-gray-800 border-gray-700 text-gray-400"}`}>
                    {cat.label}
                  </button>
                ))}
              </div>
              <input ref={reelVideoRef} type="file" accept="video/*" multiple className="hidden" onChange={handleReelUpload} />
              <button onClick={() => reelVideoRef.current?.click()} disabled={uploading === 'reel' || !reelTitle.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded-xl border border-purple-600/40 text-sm disabled:opacity-50 w-full justify-center font-bold">
                {uploading === 'reel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clapperboard className="w-4 h-4" />}
                {uploading === 'reel' ? 'מעלה ריל...' : 'בחר קובץ וידאו לריל'}
              </button>
              {uploadedReels.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-green-400"><Check className="w-3 h-3" /><span>{r.title}</span></div>
              ))}
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}