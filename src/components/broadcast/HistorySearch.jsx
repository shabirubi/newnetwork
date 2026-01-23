import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader, Archive, Calendar, FileText, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function HistorySearch({ onSelect }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("הקלד שאילתה");
      return;
    }

    setSearching(true);
    toast.loading("מחפש בהיסטוריה של ישראל...", { id: "history" });

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `חפש בהיסטוריה של מדינת ישראל על: "${searchQuery}"
        
        החזר עד 10 תוצאות מ:
        1. אירועים היסטוריים חשובים
        2. דמויות היסטוריות
        3. תאריכים משמעותיים
        4. קורות היסטוריים
        5. טקסטים וחקיקה היסטוריים
        
        עבור כל תוצאה, תן:
        - שם/כותרת
        - תיאור מפורט (2-3 משפטים)
        - תאריך/תקופה
        - קטגוריה (אירוע/דמות/חקיקה/תרבות)
        - מקור/הערה
        
        בפורמט JSON.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  date: { type: "string" },
                  category: { type: "string" },
                  source: { type: "string" }
                }
              }
            }
          }
        }
      });

      setResults(response.results || []);
      toast.success(`נמצאו ${response.results?.length || 0} תוצאות`, { id: "history" });
    } catch (error) {
      toast.error("שגיאה בחיפוש", { id: "history" });
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectResult = (result) => {
    setSelectedResult(result);
    onSelect({
      title: result.title,
      description: result.description,
      content: `${result.description}\n\nתאריך: ${result.date}\nקטגוריה: ${result.category}\nמקור: ${result.source}`,
      category: "history",
      image_url: ""
    });
    toast.success("כתבה היסטורית נבחרה ✓");
  };

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Archive className="absolute right-3 top-3 w-4 h-4 text-[#E31E24]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חפש בהיסטוריה של ישראל..."
              className="w-full bg-black/30 border border-[#E31E24]/30 rounded-lg px-4 py-2 pr-10 text-white text-sm placeholder-white/30 focus:border-[#E31E24] focus:outline-none"
              dir="rtl"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-4 py-2 bg-[#E31E24] hover:bg-red-800 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {searching ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>

      {/* Results Grid */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 max-h-80 overflow-y-auto"
        >
          <p className="text-white/70 text-xs font-semibold">תוצאות חיפוש:</p>
          <div className="grid grid-cols-1 gap-2">
            <AnimatePresence>
              {results.map((result, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => handleSelectResult(result)}
                  className={`p-3 rounded-lg border-2 transition-all text-left group ${
                    selectedResult?.title === result.title
                      ? "border-[#E31E24] bg-[#E31E24]/20"
                      : "border-[#E31E24]/20 bg-black/20 hover:bg-black/40 hover:border-[#E31E24]/50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm line-clamp-1 mb-1">
                        {result.title}
                      </h3>
                      <p className="text-white/70 text-xs line-clamp-2 mb-2">
                        {result.description}
                      </p>
                      <div className="flex gap-2 flex-wrap text-[10px]">
                        <span className="px-2 py-0.5 bg-[#E31E24]/20 text-[#E31E24] rounded">
                          {result.category}
                        </span>
                        <span className="px-2 py-0.5 bg-white/10 text-white/70 rounded flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {result.date}
                        </span>
                      </div>
                    </div>
                    {selectedResult?.title === result.title && (
                      <CheckCircle className="w-5 h-5 text-[#E31E24] flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!searching && results.length === 0 && searchQuery && (
        <div className="text-center py-6">
          <FileText className="w-8 h-8 text-[#E31E24]/50 mx-auto mb-2" />
          <p className="text-white/70 text-sm">לא נמצאו תוצאות</p>
        </div>
      )}

      {!searching && results.length === 0 && !searchQuery && (
        <div className="text-center py-6 text-white/50 text-xs">
          חפש בהיסטוריה של ישראל כדי למצוא כתבות היסטוריות
        </div>
      )}
    </div>
  );
}