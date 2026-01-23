import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Trash2, Plus, Eye, Send, Image as ImageIcon, Tag, Clock, User, Archive } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import HistorySearch from "./HistorySearch";

export default function ArticleEditor({ article, isOpen, onClose, onPublish }) {
  const [editData, setEditData] = useState({
    title: article?.title || "",
    description: article?.description || "",
    content: article?.content || "",
    image_url: article?.image_url || "",
    category: article?.category || "breaking",
    tags: article?.tags || [],
    notes: article?.notes || ""
  });

  const [newTag, setNewTag] = useState("");
  const [activeTab, setActiveTab] = useState("edit"); // edit | images | tags | history | preview
  const [publishing, setPublishing] = useState(false);
  const imageInputRef = React.useRef(null);

  const tabs = [
    { id: "edit", label: "עריכה", icon: "✏️" },
    { id: "images", label: "תמונות", icon: "🖼️" },
    { id: "tags", label: "תגים והערות", icon: "🏷️" },
    { id: "history", label: "היסטוריה", icon: "📚" },
    { id: "preview", label: "תצוגה מקדימה", icon: "👁️" }
  ];

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading("מעלה תמונה...", { id: "img" });
      const response = await base44.integrations.Core.UploadFile({ file });
      const cleanUrl = response.file_url.includes("?") ? response.file_url.split("?")[0] : response.file_url;
      setEditData({ ...editData, image_url: cleanUrl });
      toast.success("תמונה הועלתה ✓", { id: "img" });
    } catch (error) {
      toast.error("שגיאה בהעלאת תמונה", { id: "img" });
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editData.tags.includes(newTag)) {
      setEditData({
        ...editData,
        tags: [...editData.tags, newTag.trim()]
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag) => {
    setEditData({
      ...editData,
      tags: editData.tags.filter(t => t !== tag)
    });
  };

  const handlePublish = async () => {
    if (!editData.title.trim()) {
      toast.error("כותרת חובה");
      return;
    }

    setPublishing(true);
    toast.loading("פורסם לפידים...", { id: "publish" });

    try {
      const articleData = {
        title: editData.title,
        subtitle: editData.description,
        content: editData.content,
        image_url: editData.image_url,
        category: editData.category,
        is_featured: false,
        is_breaking: editData.category === "breaking",
        source: editData.category === "history" ? "History Archive" : "Editor",
        tags: editData.tags || [],
        notes: editData.notes || ""
      };

      await base44.entities.NewsArticle.create(articleData);

      toast.success("הכתבה פורסמה בהצלחה!", { id: "publish" });
      if (onPublish) onPublish();
      onClose();
    } catch (error) {
      toast.error("שגיאה בפרסום", { id: "publish" });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10001] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-black/90 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-20 bg-gradient-to-r from-[#E31E24]/20 to-red-900/20 border-b border-[#E31E24]/30">
              <div className="px-6 py-4 flex items-center justify-between border-b border-[#E31E24]/30">
                <div>
                  <h2 className="text-white font-bold text-lg">עורך כתבות</h2>
                  <p className="text-white/50 text-xs">ערוך, הוסף תמונות, היסטוריה ופרסם</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs Navigation */}
              <div className="flex gap-1 px-4 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 whitespace-nowrap font-semibold text-sm transition-all border-b-2 ${
                      activeTab === tab.id
                        ? "border-[#E31E24] text-[#E31E24]"
                        : "border-transparent text-white/70 hover:text-white"
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {!preview ? (
                <>
                  {/* History Search */}
                  {!showHistorySearch ? (
                    <button
                      onClick={() => setShowHistorySearch(true)}
                      className="w-full px-4 py-3 border-2 border-dashed border-[#E31E24]/30 rounded-lg hover:border-[#E31E24]/50 bg-[#E31E24]/5 hover:bg-[#E31E24]/10 transition-all flex items-center justify-center gap-2 group"
                    >
                      <Archive className="w-5 h-5 text-[#E31E24] group-hover:scale-110 transition-transform" />
                      <span className="text-white font-semibold text-sm">חפש בהיסטוריה של ישראל</span>
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border border-[#E31E24]/20 rounded-lg p-4 bg-black/20"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                          <Archive className="w-4 h-4 text-[#E31E24]" />
                          חיפוש היסטורי
                        </h3>
                        <button
                          onClick={() => setShowHistorySearch(false)}
                          className="text-white/50 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <HistorySearch
                        onSelect={(result) => {
                          setEditData(result);
                          setShowHistorySearch(false);
                          toast.success("כתבה היסטורית נטענה בהצלחה");
                        }}
                      />
                    </motion.div>
                  )}

                  {/* Title */}
                  <div>
                    <label className="text-white/70 text-xs font-semibold block mb-2">כותרת</label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="w-full bg-black/30 border border-[#E31E24]/30 rounded-lg px-4 py-3 text-white text-lg focus:border-[#E31E24] focus:outline-none font-bold"
                      placeholder="כותרת הכתבה"
                      dir="rtl"
                    />
                    <p className="text-white/50 text-xs mt-1">{editData.title.length} תווים</p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-white/70 text-xs font-semibold block mb-2">תיאור קצר</label>
                    <input
                      type="text"
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="w-full bg-black/30 border border-[#E31E24]/30 rounded-lg px-4 py-2 text-white text-sm focus:border-[#E31E24] focus:outline-none"
                      placeholder="סיכום של משפט או שניים"
                      dir="rtl"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-white/70 text-xs font-semibold block mb-2">קטגוריה</label>
                    <select
                      value={editData.category}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                      className="w-full bg-black/30 border border-[#E31E24]/30 rounded-lg px-4 py-2 text-white text-sm focus:border-[#E31E24] focus:outline-none"
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
                    </select>
                  </div>

                  {/* Image Management */}
                  <div>
                    <label className="text-white/70 text-xs font-semibold block mb-2">תמונה</label>
                    <div className="space-y-3">
                      {editData.image_url && (
                        <div className="relative group rounded-lg overflow-hidden">
                          <img src={editData.image_url} alt="Article" className="w-full h-48 object-cover" />
                          <button
                            onClick={() => setEditData({ ...editData, image_url: "" })}
                            className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => imageInputRef.current?.click()}
                        className="w-full p-4 border-2 border-dashed border-[#E31E24]/30 rounded-lg hover:border-[#E31E24]/50 bg-black/20 hover:bg-black/40 transition-all flex flex-col items-center justify-center gap-2"
                      >
                        <ImageIcon className="w-6 h-6 text-[#E31E24]" />
                        <span className="text-white text-sm font-medium">העלה או החלף תמונה</span>
                        <span className="text-white/50 text-xs">PNG, JPG עד 10MB</span>
                      </button>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="text-white/70 text-xs font-semibold block mb-2">תוכן</label>
                    <textarea
                      value={editData.content}
                      onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                      className="w-full h-40 bg-black/30 border border-[#E31E24]/30 rounded-lg px-4 py-3 text-white text-sm focus:border-[#E31E24] focus:outline-none resize-none"
                      placeholder="כתוב את התוכן המלא של הכתבה..."
                      dir="rtl"
                    />
                    <p className="text-white/50 text-xs mt-1">{editData.content.length} תווים</p>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-white/70 text-xs font-semibold block mb-2">תגים</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                        placeholder="הוסף תג"
                        className="flex-1 bg-black/30 border border-[#E31E24]/30 rounded-lg px-3 py-2 text-white text-sm focus:border-[#E31E24] focus:outline-none"
                        dir="rtl"
                      />
                      <button
                        onClick={handleAddTag}
                        className="p-2 bg-[#E31E24] hover:bg-red-800 rounded-lg text-white transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editData.tags.map((tag) => (
                        <div
                          key={tag}
                          className="px-3 py-1 bg-[#E31E24]/20 border border-[#E31E24]/30 rounded-full text-[#E31E24] text-xs font-semibold flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:opacity-70"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-white/70 text-xs font-semibold block mb-2">הערות עורך</label>
                    <textarea
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      className="w-full h-20 bg-black/30 border border-[#E31E24]/30 rounded-lg px-4 py-3 text-white text-sm focus:border-[#E31E24] focus:outline-none resize-none"
                      placeholder="הערות אישיות לכתבה זו..."
                      dir="rtl"
                    />
                  </div>
                </>
              ) : (
                /* Preview Mode */
                <div className="space-y-4">
                  {editData.image_url && (
                    <img src={editData.image_url} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
                  )}
                  <div>
                    <h1 className="text-white text-2xl font-bold mb-2">{editData.title}</h1>
                    <p className="text-white/70 text-sm mb-4">{editData.description}</p>
                    <div className="flex gap-2 mb-4">
                      <span className="px-3 py-1 bg-[#E31E24] text-white text-xs rounded-full font-bold">
                        {editData.category}
                      </span>
                      {editData.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-white/10 text-white text-xs rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
                      {editData.content}
                    </p>
                    {editData.notes && (
                      <div className="mt-6 p-4 bg-[#E31E24]/10 border border-[#E31E24]/30 rounded-lg">
                        <p className="text-white/70 text-xs font-semibold mb-1">הערות עורך:</p>
                        <p className="text-white/60 text-sm">{editData.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-black/40 backdrop-blur-sm border-t border-[#E31E24]/30 px-6 py-4 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-black/50 border border-[#E31E24]/20 text-white rounded-lg text-sm font-semibold hover:bg-black/70 transition-all"
              >
                ביטול
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing || !editData.title.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#E31E24] to-red-800 hover:from-red-800 hover:to-red-900 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {publishing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    פורסום...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    פרסם לפידים
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}