import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, X, Plus, Tag } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createPageUrl } from "../../utils";
import { Link } from "react-router-dom";
import ArticleEditorModal from "./ArticleEditorModal";

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

const RANDOM_COLORS = ['#6366F1','#F59E0B','#10B981','#EF4444','#3B82F6','#8B5CF6','#EC4899','#14B8A6'];

function useCustomCategories() {
  const [custom, setCustom] = useState(() => {
    try { return JSON.parse(localStorage.getItem('customCategories') || '[]'); } catch { return []; }
  });
  const save = (list) => {
    setCustom(list);
    localStorage.setItem('customCategories', JSON.stringify(list));
  };
  const add = (label) => {
    const id = 'custom_' + Date.now();
    const color = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
    const newCat = { id, label: label.trim(), color, isCustom: true };
    save([...custom, newCat]);
    return newCat;
  };
  const remove = (id) => save(custom.filter(c => c.id !== id));
  return { custom, add, remove };
}

export default function AllCategoryEditors() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [newCatInput, setNewCatInput] = useState("");
  const [addingCat, setAddingCat] = useState(false);
  const { custom, add: addCustom, remove: removeCustom } = useCustomCategories();
  const queryClient = useQueryClient();

  const openNew = () => setEditorOpen(true);

  const handleAddCategory = () => {
    if (!newCatInput.trim()) return;
    addCustom(newCatInput.trim());
    setNewCatInput("");
    setAddingCat(false);
    toast.success(`קטגוריה "${newCatInput}" נוספה`);
  };

  const handleSaved = () => {
    setEditorOpen(false);
    queryClient.invalidateQueries({ queryKey: ['featured-articles'] });
  };

  return (
    <div className="w-full px-2 sm:px-4 mb-6" dir="rtl">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 rounded-full bg-[#E31E24]" />
            <Edit3 className="w-5 h-5 text-[#0057B8]" />
            <h2 className="text-white font-bold text-lg">עורך כתבות</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setAddingCat(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-bold rounded-xl border border-gray-700 transition-colors">
              <Tag className="w-4 h-4" /> קטגוריה חדשה
            </button>
            <button onClick={openNew}
              className="flex items-center gap-2 px-4 py-2 bg-[#E31E24] hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors">
              <Plus className="w-4 h-4" /> כתבה חדשה
            </button>
          </div>
        </div>

        {/* Add custom category inline */}
        <AnimatePresence>
          {addingCat && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-[#0d0d0d] rounded-2xl border border-gray-700 flex gap-2 items-center overflow-hidden">
              <Input value={newCatInput} onChange={e => setNewCatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                placeholder="שם הקטגוריה החדשה..." className="flex-1 bg-[#1a1a1a] border-gray-700 text-white text-sm placeholder:text-gray-600 focus:border-[#0057B8]" />
              <button onClick={handleAddCategory} disabled={!newCatInput.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors">
                הוסף
              </button>
              <button onClick={() => setAddingCat(false)} className="p-2 text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category grid — built-in */}
        <div className="flex flex-wrap gap-2 mb-2">
          {BUILTIN_CATEGORIES.map(cat => (
            <Link key={cat.id} to={createPageUrl(`Category?cat=${cat.id}`)}
              className="px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-105"
              style={{ borderColor: cat.color + '60', background: cat.color + '15', color: cat.color }}>
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Custom categories */}
        {custom.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {custom.map(cat => (
              <div key={cat.id} className="flex items-center gap-1">
                <span className="px-3 py-1.5 rounded-xl border text-xs font-bold"
                  style={{ borderColor: cat.color + '60', background: cat.color + '15', color: cat.color }}>
                  {cat.label} ★
                </span>
                <button onClick={() => removeCustom(cat.id)} className="p-0.5 text-gray-600 hover:text-red-400 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

      <AnimatePresence>
        {editorOpen && (
          <ArticleEditorModal
            article={null}
            onClose={() => setEditorOpen(false)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}