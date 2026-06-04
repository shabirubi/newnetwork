import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3, Save, X, ImageIcon, Video, Play,
  Plus, Trash2, Check, Loader2, Clapperboard, Upload,
  Tag, ChevronDown, ChevronUp, FileText, Film
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const BUILTIN_CATEGORIES = [
  { id: "breaking", label: "חדשות עכשיו", color: "#E31E24" },
  { id: "security", label: "ביטחון", color: "#F97316" },
  { id: "economy", label: "כלכלה", color: "#16A34A" },
  { id: "politics", label: "פוליטיקה", color: "#9333EA" },
  { id: "technology", label: "טכנולוגיה", color: "#2563EB" },
  { id: "sports", label: "ספורט", color: "#059669" },
  { id: "entertainment", label: "בידור", color: "#EC4899" },
  { id: "world", label: "עולם", color: "#4F46E5" },
  { id: "health", label: "בריאות", color: "#0D9488" },
  { id: "crime", label: "פלילים", color: "#B91C1C" },
  { id: "israel", label: "ישראל", color: "#1D4ED8" },
  { id: "military", label: "צבא", color: "#475569" },
  { id: "education", label: "חינוך", color: "#D97706" },
  { id: "culture", label: "תרבות", color: "#7C3AED" },
  { id: "environment", label: "סביבה", color: "#15803D" },
  { id: "science", label: "מדע", color: "#0369A1" },
  { id: "music", label: "מוזיקה", color: "#DB2777" },
  { id: "local", label: "מקומי", color: "#92400E" },
  { id: "law", label: "משפט", color: "#6B21A8" },
  { id: "finance", label: "פיננסים", color: "#065F46" },
];

const PALETTE = ['#E31E24','#F97316','#EAB308','#16A34A','#0D9488','#2563EB','#4F46E5','#9333EA','#DB2777','#475569'];

const TABS = [
  { id: 'article', label: 'כתבה', icon: FileText },
  { id: 'media', label: 'מדיה', icon: ImageIcon },
  { id: 'reels', label: 'ריל', icon: Film },
];

export default function ArticleEditorModal({ article, onClose, onSaved }) {
  const [tab, setTab] = useState('article');
  const [customCategories, setCustomCategories] = useState([]);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatColor, setNewCatColor] = useState(PALETTE[0]);
  const [addingCat, setAddingCat] = useState(false);
  const [savingCat, setSavingCat] = useState(false);
  const [catSheetOpen, setCatSheetOpen] = useState(false);

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

  // Load custom categories from DB
  useEffect(() => {
    base44.entities.CustomCategory.list('-created_date', 50)
      .then(cats => setCustomCategories(cats || []))
      .catch(() => {});
  }, []);

  const allCategories = [
    ...BUILTIN_CATEGORIES,
    ...customCategories.map(c => ({ id: c.id, label: c.label, color: c.color || '#6366F1', isCustom: true, dbId: c.id }))
  ];

  const handleAddCategory = async () => {
    if (!newCatLabel.trim()) return;
    setSavingCat(true);
    try {
      const saved = await base44.entities.CustomCategory.create({ label: newCatLabel.trim(), color: newCatColor });
      setCustomCategories(prev => [...prev, saved]);
      setForm(f => ({ ...f, category: saved.id }));
      setNewCatLabel("");
      setAddingCat(false);
      toast.success(`קטגוריה "${saved.label}" נוספה`);
    } catch { toast.error("שגיאה בהוספת קטגוריה"); }
    finally { setSavingCat(false); }
  };

  const handleDeleteCategory = async (cat) => {
    try {
      await base44.entities.CustomCategory.delete(cat.dbId);
      setCustomCategories(prev => prev.filter(c => c.id !== cat.dbId));
      if (form.category === cat.id) setForm(f => ({ ...f, category: 'breaking' }));
      toast.success("קטגוריה נמחקה");
    } catch { toast.error("שגיאה במחיקה"); }
  };

  // כל ההעלאות — public URL שלא יפוג
  const uploadFile = async (file, type) => {
    setUploading(type);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    } finally { setUploading(null); }
  };

  const handleMainImage = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    toast.info("מעלה תמונה...");
    const url = await uploadFile(file, 'main-image');
    setForm(f => ({ ...f, image_url: url }));
    toast.success("תמונה הועלתה"); e.target.value = '';
  };

  const handleMainVideo = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    toast.info("מעלה וידאו...");
    const url = await uploadFile(file, 'main-video');
    setForm(f => ({ ...f, video_url: url }));
    toast.success("וידאו הועלה"); e.target.value = '';
  };

  const handleExtraImages = async (e) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    setUploading('extra-image');
    const urls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    setUploading(null);
    setForm(f => ({ ...f, extra_images: [...(f.extra_images || []), ...urls] }));
    toast.success(`${urls.length} תמונות הועלו`); e.target.value = '';
  };

  const handleExtraVideos = async (e) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    setUploading('extra-video');
    const urls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
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
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        await base44.entities.UserVideo.create({
          title: reelTitle, description: reelDescription, video_url: file_url,
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
      // Map custom category id → use "custom" enum value + store label
      if (isCustomCat) {
        const cat = allCategories.find(c => c.id === form.category);
        data.category = "custom";
        data.custom_category = cat?.label || form.custom_category;
      } else {
        delete data.custom_category;
      }
      if (article?.id) {
        await base44.entities.NewsArticle.update(article.id, data);
      } else {
        await base44.entities.NewsArticle.create(data);
      }
      queryClient.invalidateQueries({ queryKey: ['featured-articles'] });
      queryClient.invalidateQueries({ queryKey: ['home-all-articles'] });
      toast.success("הכתבה נשמרה!");
      onSaved();
    } catch { toast.error("שגיאה בשמירה"); }
    finally { setSaving(false); }
  };

  const selectedCat = allCategories.find(c => c.id === form.category);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{ background: 'rgba(0,0,0,0.97)' }}
      dir="rtl"
    >
      {/* ── Native Mobile Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#0a0a0a] flex-shrink-0 safe-area-top">
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 active:bg-gray-700 transition-colors">
          <X className="w-5 h-5 text-gray-300" />
        </button>
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-[#0057B8]" />
          <h1 className="text-white font-bold text-base">{article ? 'עריכת כתבה' : 'כתבה חדשה'}</h1>
          {selectedCat && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: selectedCat.color + '25', color: selectedCat.color }}>
              {selectedCat.label}
            </span>
          )}
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-bold active:scale-95 transition-all disabled:opacity-50"
          style={{ background: saving ? '#333' : '#E31E24' }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span className="hidden sm:inline">שמור</span>
        </button>
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex border-b border-gray-800 bg-[#0a0a0a] flex-shrink-0">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-bold transition-colors relative ${tab === t.id ? 'text-white' : 'text-gray-600'}`}>
            <t.icon className="w-5 h-5" />
            {t.label}
            {tab === t.id && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-[#E31E24]" />}
          </button>
        ))}
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── TAB: ARTICLE ── */}
        {tab === 'article' && (
          <div className="p-4 space-y-5 pb-32">

            {/* Flags */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setForm(f => ({ ...f, is_breaking: !f.is_breaking }))}
                className={`py-3.5 rounded-2xl border-2 text-sm font-bold transition-all active:scale-95 ${form.is_breaking ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-gray-900 border-gray-700 text-gray-500'}`}>
                🔴 ידיעה חמה
              </button>
              <button onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))}
                className={`py-3.5 rounded-2xl border-2 text-sm font-bold transition-all active:scale-95 ${form.is_featured ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-gray-900 border-gray-700 text-gray-500'}`}>
                ⭐ מרכזית
              </button>
            </div>

            {/* Category picker — dropdown trigger */}
            <div className="space-y-1.5">
              <label className="text-gray-400 text-xs px-1">קטגוריה *</label>
              <button onClick={() => setCatSheetOpen(true)}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-900 border border-gray-700 rounded-2xl active:bg-gray-800 transition-colors"
                style={{ fontSize: '16px' }}>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: selectedCat?.color || '#888' }} />
                  <span className="text-white font-bold">{selectedCat?.label || 'בחר קטגוריה'}</span>
                  {selectedCat?.isCustom && <span className="text-xs text-yellow-400">★</span>}
                </div>
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Category Bottom Sheet */}
            <AnimatePresence>
              {catSheetOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[10000] flex flex-col justify-end"
                  style={{ background: 'rgba(0,0,0,0.7)' }}
                  onClick={(e) => { if (e.target === e.currentTarget) setCatSheetOpen(false); }}>
                  <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="bg-[#111] rounded-t-3xl overflow-hidden"
                    style={{ maxHeight: '80vh' }}
                    onClick={e => e.stopPropagation()}>

                    {/* Sheet Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                      <span className="text-white font-bold text-base">בחר קטגוריה</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setAddingCat(v => !v)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#0057B8] rounded-xl text-white text-xs font-bold active:scale-95">
                          <Plus className="w-3.5 h-3.5" /> חדשה
                        </button>
                        <button onClick={() => setCatSheetOpen(false)} className="p-2 rounded-full bg-gray-800 text-gray-400 active:bg-gray-700">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Add new category form */}
                    <AnimatePresence>
                      {addingCat && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-b border-gray-800">
                          <div className="p-4 space-y-3">
                            <Input value={newCatLabel} onChange={e => setNewCatLabel(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                              placeholder="שם הקטגוריה החדשה..."
                              className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-600 focus:border-[#0057B8] rounded-xl h-12"
                              style={{ fontSize: '16px' }} autoFocus />
                            <div className="flex gap-2 flex-wrap">
                              {PALETTE.map(c => (
                                <button key={c} onClick={() => setNewCatColor(c)}
                                  className={`w-8 h-8 rounded-full active:scale-90 border-2 transition-all ${newCatColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                                  style={{ background: c }} />
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <button onClick={handleAddCategory} disabled={savingCat || !newCatLabel.trim()}
                                className="flex-1 py-3 rounded-xl bg-green-600 active:bg-green-700 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                                {savingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} שמור
                              </button>
                              <button onClick={() => { setAddingCat(false); setNewCatLabel(''); }}
                                className="px-4 py-3 rounded-xl bg-gray-800 active:bg-gray-700 text-gray-400">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Category list */}
                    <div className="overflow-y-auto" style={{ maxHeight: '50vh' }}>
                      {/* Built-in */}
                      <div className="p-3 space-y-1">
                        {BUILTIN_CATEGORIES.map(cat => (
                          <button key={cat.id} onClick={() => { setForm(f => ({ ...f, category: cat.id })); setCatSheetOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl active:bg-gray-800 transition-colors"
                            style={{ background: form.category === cat.id ? cat.color + '20' : 'transparent' }}>
                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                            <span className="text-white font-medium flex-1 text-right">{cat.label}</span>
                            {form.category === cat.id && <Check className="w-4 h-4 text-green-400 flex-shrink-0" />}
                          </button>
                        ))}
                      </div>

                      {/* Custom */}
                      {customCategories.length > 0 && (
                        <div className="p-3 pt-0 space-y-1 border-t border-gray-800">
                          <p className="text-gray-600 text-xs px-4 py-2">קטגוריות מותאמות</p>
                          {customCategories.map(cat => (
                            <div key={cat.id} className="flex items-center gap-1">
                              <button onClick={() => { setForm(f => ({ ...f, category: cat.id })); setCatSheetOpen(false); }}
                                className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl active:bg-gray-800 transition-colors"
                                style={{ background: form.category === cat.id ? (cat.color || '#6366F1') + '20' : 'transparent' }}>
                                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color || '#6366F1' }} />
                                <span className="text-yellow-300 font-medium flex-1 text-right">★ {cat.label}</span>
                                {form.category === cat.id && <Check className="w-4 h-4 text-green-400 flex-shrink-0" />}
                              </button>
                              <button onClick={() => handleDeleteCategory({ id: cat.id, dbId: cat.id })}
                                className="p-2.5 text-gray-700 active:text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-gray-400 text-xs px-1">כותרת ראשית *</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="כותרת ראשית..."
                className="bg-gray-900 border-gray-700 text-white text-base font-bold placeholder:text-gray-600 focus:border-[#0057B8] rounded-2xl h-14"
                style={{ fontSize: '16px' }} />
            </div>

            {/* Subtitle */}
            <div className="space-y-1.5">
              <label className="text-gray-400 text-xs px-1">כותרת משנה</label>
              <Input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                placeholder="כותרת משנה..."
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-[#0057B8] rounded-2xl h-12"
                style={{ fontSize: '16px' }} />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <label className="text-gray-400 text-xs px-1">תוכן הכתבה</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="כתוב את תוכן הכתבה כאן..." rows={8}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-2xl p-4 placeholder:text-gray-600 focus:border-[#0057B8] focus:outline-none resize-none leading-relaxed"
                style={{ fontSize: '16px' }} />
            </div>

            {/* Source */}
            <div className="space-y-1.5">
              <label className="text-gray-400 text-xs px-1">מקור</label>
              <Input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                placeholder="מקור הכתבה..."
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-[#0057B8] rounded-2xl h-12"
                style={{ fontSize: '16px' }} />
            </div>
          </div>
        )}

        {/* ── TAB: MEDIA ── */}
        {tab === 'media' && (
          <div className="p-4 space-y-4 pb-32">
            {/* Hidden inputs */}
            <input ref={mainVideoRef} type="file" accept="video/*" className="hidden" onChange={handleMainVideo} />
            <input ref={mainImageRef} type="file" accept="image/*" className="hidden" onChange={handleMainImage} />
            <input ref={extraImageRef} type="file" accept="image/*" multiple className="hidden" onChange={handleExtraImages} />
            <input ref={extraVideoRef} type="file" accept="video/*" multiple className="hidden" onChange={handleExtraVideos} />

            {/* Main Video */}
            <div className="bg-gray-900 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800">
                <span className="text-white font-bold text-sm flex items-center gap-2"><Video className="w-4 h-4 text-purple-400" />וידאו ראשי</span>
              </div>
              <div className="p-4 space-y-3">
                <button onClick={() => mainVideoRef.current?.click()} disabled={uploading === 'main-video'}
                  className="w-full py-4 rounded-2xl border-2 border-dashed border-purple-600/40 bg-purple-600/10 flex items-center justify-center gap-2 text-purple-400 font-bold active:scale-98 transition-all disabled:opacity-50"
                  style={{ fontSize: '15px' }}>
                  {uploading === 'main-video' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {uploading === 'main-video' ? 'מעלה...' : 'העלה וידאו'}
                </button>
                {form.video_url && (
                  <div className="flex items-center gap-2 p-3 bg-purple-600/10 rounded-xl border border-purple-600/30">
                    <Play className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="text-green-400 text-sm flex-1 truncate">✓ וידאו הועלה</span>
                    <button onClick={() => setForm(f => ({ ...f, video_url: '' }))} className="text-gray-500 active:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
                <Input value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
                  placeholder="או הדבק URL לוידאו..."
                  className="bg-[#111] border-gray-700 text-white text-sm placeholder:text-gray-600 focus:border-purple-500 rounded-xl"
                  style={{ fontSize: '16px' }} />
              </div>
            </div>

            {/* Main Image */}
            <div className="bg-gray-900 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800">
                <span className="text-white font-bold text-sm flex items-center gap-2"><ImageIcon className="w-4 h-4 text-[#0057B8]" />תמונה ראשית</span>
              </div>
              <div className="p-4 space-y-3">
                <button onClick={() => mainImageRef.current?.click()} disabled={uploading === 'main-image'}
                  className="w-full py-4 rounded-2xl border-2 border-dashed border-[#0057B8]/40 bg-[#0057B8]/10 flex items-center justify-center gap-2 text-[#0057B8] font-bold active:scale-98 transition-all disabled:opacity-50"
                  style={{ fontSize: '15px' }}>
                  {uploading === 'main-image' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {uploading === 'main-image' ? 'מעלה...' : 'העלה תמונה'}
                </button>
                {form.image_url && (
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={form.image_url} alt="" className="w-full h-40 object-cover" />
                    <button onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                      className="absolute top-2 left-2 bg-black/70 rounded-full p-1.5 text-red-400 active:scale-90">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  placeholder="או הדבק URL לתמונה..."
                  className="bg-[#111] border-gray-700 text-white text-sm placeholder:text-gray-600 focus:border-[#0057B8] rounded-xl"
                  style={{ fontSize: '16px' }} />
              </div>
            </div>

            {/* Extra images */}
            <div className="bg-gray-900 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                <span className="text-white font-bold text-sm">תמונות נוספות</span>
                <button onClick={() => extraImageRef.current?.click()} disabled={uploading === 'extra-image'}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#0057B8]/20 rounded-xl text-[#0057B8] text-xs font-bold active:scale-95 disabled:opacity-50">
                  {uploading === 'extra-image' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} הוסף
                </button>
              </div>
              {form.extra_images?.length > 0 && (
                <div className="p-3 grid grid-cols-3 gap-2">
                  {form.extra_images.map((url, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden aspect-square">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setForm(f => ({ ...f, extra_images: f.extra_images.filter((_, j) => j !== i) }))}
                        className="absolute top-1 left-1 bg-black/70 rounded-full p-1 text-red-400"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
              {!form.extra_images?.length && <p className="text-gray-700 text-xs text-center py-4">אין תמונות נוספות</p>}
            </div>

            {/* Extra videos */}
            <div className="bg-gray-900 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                <span className="text-white font-bold text-sm">סרטונים נוספים</span>
                <button onClick={() => extraVideoRef.current?.click()} disabled={uploading === 'extra-video'}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-600/20 rounded-xl text-purple-400 text-xs font-bold active:scale-95 disabled:opacity-50">
                  {uploading === 'extra-video' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} הוסף
                </button>
              </div>
              {form.extra_videos?.length > 0 && (
                <div className="p-3 grid grid-cols-3 gap-2">
                  {form.extra_videos.map((url, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden aspect-square bg-purple-900/20 flex items-center justify-center border border-purple-600/20">
                      <Play className="w-6 h-6 text-purple-400" />
                      <button onClick={() => setForm(f => ({ ...f, extra_videos: f.extra_videos.filter((_, j) => j !== i) }))}
                        className="absolute top-1 left-1 bg-black/70 rounded-full p-1 text-red-400"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
              {!form.extra_videos?.length && <p className="text-gray-700 text-xs text-center py-4">אין סרטונים נוספים</p>}
            </div>
          </div>
        )}

        {/* ── TAB: REELS ── */}
        {tab === 'reels' && (
          <div className="p-4 space-y-4 pb-32">
            <input ref={reelVideoRef} type="file" accept="video/*" multiple className="hidden" onChange={handleReelUpload} />

            <div className="bg-gray-900 rounded-2xl overflow-hidden">
              <div className="px-4 py-4 border-b border-gray-800">
                <p className="text-white font-bold">העלאת ריל חדש</p>
                <p className="text-gray-500 text-xs mt-0.5">הסרטון יועלה לפיד הריילס</p>
              </div>
              <div className="p-4 space-y-3">
                <Input value={reelTitle} onChange={e => setReelTitle(e.target.value)}
                  placeholder="כותרת הריל *"
                  className="bg-[#111] border-gray-700 text-white placeholder:text-gray-600 focus:border-purple-500 rounded-2xl h-12"
                  style={{ fontSize: '16px' }} />
                <Input value={reelDescription} onChange={e => setReelDescription(e.target.value)}
                  placeholder="תיאור (אופציונלי)"
                  className="bg-[#111] border-gray-700 text-white placeholder:text-gray-600 focus:border-purple-500 rounded-2xl h-12"
                  style={{ fontSize: '16px' }} />

                <div>
                  <p className="text-gray-500 text-xs mb-2 px-1">קטגוריה לריל:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[...BUILTIN_CATEGORIES, ...customCategories.map(c => ({ id: c.id, label: c.label, color: c.color || '#6366F1', isCustom: true }))].map(cat => (
                      <button key={cat.id} onClick={() => setReelCategory(cat.id)}
                        className="px-2.5 py-1 rounded-full text-xs font-bold transition-all active:scale-95 border"
                        style={reelCategory === cat.id
                          ? { background: cat.color, borderColor: cat.color, color: '#fff' }
                          : { background: 'transparent', borderColor: '#333', color: '#666' }}>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => reelVideoRef.current?.click()}
                  disabled={uploading === 'reel' || !reelTitle.trim()}
                  className="w-full py-4 rounded-2xl border-2 border-dashed border-purple-600/50 bg-purple-600/10 flex items-center justify-center gap-2 text-purple-300 font-bold active:scale-98 disabled:opacity-50 transition-all"
                  style={{ fontSize: '15px' }}>
                  {uploading === 'reel' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Clapperboard className="w-5 h-5" />}
                  {uploading === 'reel' ? 'מעלה ריל...' : 'בחר קובץ וידאו'}
                </button>
              </div>
            </div>

            {uploadedReels.length > 0 && (
              <div className="bg-green-900/20 rounded-2xl border border-green-600/30 p-4 space-y-2">
                <p className="text-green-400 font-bold text-sm">✓ ריילס שהועלו בסשן זה:</p>
                {uploadedReels.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-green-300">
                    <Check className="w-4 h-4" /> {r.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Fixed bottom Save bar ── */}
      <div className="flex-shrink-0 border-t border-gray-800 bg-[#0a0a0a] px-4 py-3 safe-area-bottom">
        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 transition-all"
          style={{ background: saving ? '#333' : '#E31E24', fontSize: '16px' }}>
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'שומר...' : 'שמור כתבה'}
        </button>
      </div>
    </motion.div>
  );
}