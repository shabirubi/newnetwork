import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit3, Save, X, Upload, Image, Video, Tag, Type, 
  Play, Pause, ChevronDown, Plus, Trash2, Eye, EyeOff,
  Check, Loader2, Camera
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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

export default function FeaturedArticleEditor() {
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const videoRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: article, isLoading } = useQuery({
    queryKey: ['featured-main-article'],
    queryFn: async () => {
      const all = await base44.entities.NewsArticle.filter({ is_featured: true }, '-created_date', 1);
      if (all.length > 0) return all[0];
      // fallback to latest
      const latest = await base44.entities.NewsArticle.list('-created_date', 1);
      return latest[0] || null;
    },
    staleTime: 30 * 1000
  });

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    content: "",
    category: "breaking",
    image_url: "",
    video_url: "",
    is_breaking: false,
    is_featured: true,
    source: ""
  });

  // Sync form when article loads
  React.useEffect(() => {
    if (article) {
      setForm({
        title: article.title || "",
        subtitle: article.subtitle || "",
        content: article.content || "",
        category: article.category || "breaking",
        image_url: article.image_url || "",
        video_url: article.video_url || "",
        is_breaking: article.is_breaking || false,
        is_featured: true,
        source: article.source || ""
      });
    }
  }, [article]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(prev => ({ ...prev, image_url: file_url }));
      toast.success("תמונה הועלתה בהצלחה");
    } catch {
      toast.error("שגיאה בהעלאת תמונה");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(prev => ({ ...prev, video_url: file_url }));
      toast.success("וידאו הועלה בהצלחה");
    } catch {
      toast.error("שגיאה בהעלאת וידאו");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("חובה להזין כותרת");
      return;
    }
    setSaving(true);
    try {
      if (article?.id) {
        await base44.entities.NewsArticle.update(article.id, form);
      } else {
        await base44.entities.NewsArticle.create(form);
      }
      queryClient.invalidateQueries({ queryKey: ['featured-main-article'] });
      queryClient.invalidateQueries({ queryKey: ['featured-articles'] });
      queryClient.invalidateQueries({ queryKey: ['cat-articles'] });
      toast.success("הכתבה נשמרה בהצלחה!");
      setEditMode(false);
    } catch {
      toast.error("שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  const handleNewArticle = () => {
    setForm({
      title: "",
      subtitle: "",
      content: "",
      category: "breaking",
      image_url: "",
      video_url: "",
      is_breaking: false,
      is_featured: true,
      source: ""
    });
    setEditMode(true);
  };

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setVideoPlaying(!videoPlaying);
  };

  const selectedCategory = CATEGORIES.find(c => c.id === (editMode ? form.category : article?.category));
  const displayData = editMode ? form : article;

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] bg-[#0d0d0d] rounded-2xl animate-pulse flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 mb-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-[#E31E24] rounded-full" />
            <h2 className="text-white font-bold text-lg">כתבה מרכזית</h2>
            {article?.is_breaking && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">חם</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewArticle}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg border border-green-600/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              כתבה חדשה
            </button>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#0057B8]/20 hover:bg-[#0057B8]/40 text-[#0057B8] rounded-lg border border-[#0057B8]/30 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                ערוך
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditMode(false)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  ביטול
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#E31E24] hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  שמור
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Featured Article */}
        <div className="bg-[#0d0d0d] rounded-2xl overflow-hidden border border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[60vh]">
            
            {/* LEFT: Media (video/image) */}
            <div className="relative bg-black flex flex-col" style={{ minHeight: '360px' }}>
              {/* Video */}
              {displayData?.video_url ? (
                <div className="relative flex-1 group">
                  <video
                    ref={videoRef}
                    src={displayData.video_url}
                    className="w-full h-full object-cover"
                    style={{ minHeight: '360px', maxHeight: '70vh' }}
                    onPlay={() => setVideoPlaying(true)}
                    onPause={() => setVideoPlaying(false)}
                    onEnded={() => setVideoPlaying(false)}
                    playsInline
                    poster={displayData?.image_url || undefined}
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={toggleVideoPlay}
                  >
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      {videoPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white fill-white" />}
                    </div>
                  </div>
                  <span className="absolute top-3 left-3 bg-[#0057B8] text-white text-[10px] font-bold px-2 py-1 rounded">וידאו</span>
                </div>
              ) : displayData?.image_url ? (
                <div className="relative flex-1">
                  <img
                    src={displayData.image_url}
                    alt={displayData.title}
                    className="w-full h-full object-cover"
                    style={{ minHeight: '360px', maxHeight: '70vh' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-900" style={{ minHeight: '360px' }}>
                  <div className="text-center text-gray-600">
                    <Camera className="w-16 h-16 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">אין תמונה או וידאו</p>
                    {editMode && <p className="text-xs mt-1 text-gray-500">העלה מהצד הימני</p>}
                  </div>
                </div>
              )}

              {/* Upload Overlay in edit mode */}
              {editMode && (
                <div className="flex gap-2 p-3 bg-black/80 border-t border-gray-800">
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                  
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#0057B8]/30 hover:bg-[#0057B8]/50 text-[#0057B8] rounded-lg border border-[#0057B8]/30 text-xs transition-colors"
                  >
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                    העלה תמונה
                  </button>
                  
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    disabled={uploadingVideo}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-400 rounded-lg border border-purple-600/30 text-xs transition-colors"
                  >
                    {uploadingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                    העלה וידאו
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT: Content */}
            <div className="flex flex-col p-5 sm:p-6 gap-4">
              
              {/* Category + Breaking Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                {editMode ? (
                  <div className="relative">
                    <button
                      onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#0057B8]/20 hover:bg-[#0057B8]/30 text-[#0057B8] rounded-lg border border-[#0057B8]/30 text-xs transition-colors"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      {selectedCategory?.label || "בחר קטגוריה"}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <AnimatePresence>
                      {categoryDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute top-full mt-1 right-0 z-50 bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto w-48"
                        >
                          {CATEGORIES.map(cat => (
                            <button
                              key={cat.id}
                              onClick={() => {
                                setForm(prev => ({ ...prev, category: cat.id }));
                                setCategoryDropdownOpen(false);
                              }}
                              className="w-full text-right px-4 py-2 text-sm text-gray-300 hover:bg-[#0057B8]/20 hover:text-white flex items-center justify-between"
                            >
                              {cat.label}
                              {form.category === cat.id && <Check className="w-3.5 h-3.5 text-[#0057B8]" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <span className="px-3 py-1 bg-[#0057B8]/20 text-[#0057B8] rounded-lg text-xs font-bold">
                    {selectedCategory?.label}
                  </span>
                )}

                {editMode ? (
                  <button
                    onClick={() => setForm(prev => ({ ...prev, is_breaking: !prev.is_breaking }))}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs transition-colors ${
                      form.is_breaking
                        ? 'bg-red-600/30 border-red-600/50 text-red-400'
                        : 'bg-gray-800 border-gray-700 text-gray-500'
                    }`}
                  >
                    🔴 חם
                  </button>
                ) : article?.is_breaking && (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">🔴 חם</span>
                )}
              </div>

              {/* Title */}
              {editMode ? (
                <Input
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="כותרת ראשית..."
                  className="bg-[#1a1a1a] border-gray-700 text-white text-xl font-bold placeholder:text-gray-600 focus:border-[#0057B8]"
                />
              ) : (
                <h1 className="text-white text-2xl sm:text-3xl font-bold leading-tight">
                  {article?.title || "אין כתבה מרכזית"}
                </h1>
              )}

              {/* Subtitle */}
              {editMode ? (
                <Input
                  value={form.subtitle}
                  onChange={e => setForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="כותרת משנה..."
                  className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-600 focus:border-[#0057B8]"
                />
              ) : article?.subtitle && (
                <p className="text-gray-300 text-base sm:text-lg">{article.subtitle}</p>
              )}

              {/* Content */}
              {editMode ? (
                <textarea
                  value={form.content}
                  onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="תוכן הכתבה..."
                  rows={6}
                  className="flex-1 w-full bg-[#1a1a1a] border border-gray-700 text-white text-sm rounded-lg p-3 placeholder:text-gray-600 focus:border-[#0057B8] focus:outline-none resize-none"
                />
              ) : (
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-6 flex-1">
                  {article?.content}
                </p>
              )}

              {/* Source */}
              {editMode ? (
                <Input
                  value={form.source}
                  onChange={e => setForm(prev => ({ ...prev, source: e.target.value }))}
                  placeholder="מקור הכתבה..."
                  className="bg-[#1a1a1a] border-gray-700 text-white text-sm placeholder:text-gray-600 focus:border-[#0057B8]"
                />
              ) : article?.source && (
                <p className="text-gray-500 text-xs">מקור: {article.source}</p>
              )}

              {/* URL inputs in edit mode */}
              {editMode && (
                <div className="space-y-2 border-t border-gray-800 pt-3">
                  <p className="text-gray-500 text-xs">או הזן URL ישירות:</p>
                  <Input
                    value={form.image_url}
                    onChange={e => setForm(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="קישור לתמונה (URL)..."
                    className="bg-[#1a1a1a] border-gray-700 text-white text-xs placeholder:text-gray-600 focus:border-[#0057B8]"
                  />
                  <Input
                    value={form.video_url}
                    onChange={e => setForm(prev => ({ ...prev, video_url: e.target.value }))}
                    placeholder="קישור לוידאו (URL)..."
                    className="bg-[#1a1a1a] border-gray-700 text-white text-xs placeholder:text-gray-600 focus:border-[#0057B8]"
                  />
                </div>
              )}

              {/* Read More button when not editing */}
              {!editMode && article && (
                <div className="mt-auto pt-3">
                  <a
                    href={`/Article?id=${article.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0057B8] hover:bg-[#1a6fd4] text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    קרא עוד
                    <ChevronDown className="w-4 h-4 rotate-90" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}