import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Archive, Newspaper, Radio, FileText, Loader, Search } from "lucide-react";
import { toast } from "sonner";

const sourceIcons = {
  archive: Archive,
  newspaper: Newspaper,
  broadcast: Radio,
  document: FileText
};

export default function HistoricalSourceSelector({ onSourceSelect, onArticlesLoad }) {
  const [selectedSource, setSelectedSource] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingArticles, setLoadingArticles] = useState(false);

  const { data: sources = [] } = useQuery({
    queryKey: ['historical-sources'],
    queryFn: () => base44.entities.HistoricalSource.filter({ is_active: true }, 'name'),
    initialData: []
  });

  const handleSourceSelect = async (source) => {
    setSelectedSource(source);
    onSourceSelect(source);
    setLoadingArticles(true);
    
    try {
      const articles = await base44.functions.invoke("fetchHistoricalArticles", {
        sourceId: source.id,
        query: searchQuery,
        limit: 20
      });
      
      onArticlesLoad(articles.data || []);
      toast.success(`נטענו ${articles.data?.length || 0} כתבות`);
    } catch (error) {
      toast.error("שגיאה בטעינת כתבות מהמקור");
    } finally {
      setLoadingArticles(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-[#E31E24]/20 to-red-900/20 px-4 py-2 border-b border-[#E31E24]/30">
        <div className="flex items-center gap-2">
          <Archive className="w-4 h-4 text-[#E31E24]" />
          <h2 className="text-white font-semibold text-sm">ארכיונים היסטוריים</h2>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Source Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sources.length === 0 ? (
            <div className="text-center py-6 col-span-full">
              <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-[#E31E24]" />
              <p className="text-white/70 text-sm">טוען ארכיונים...</p>
            </div>
          ) : (
            sources.map((source) => {
              const Icon = sourceIcons[source.source_type] || Archive;
              return (
                <button
                  key={source.id}
                  onClick={() => handleSourceSelect(source)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedSource?.id === source.id
                      ? "border-[#E31E24] bg-[#E31E24]/20"
                      : "border-[#E31E24]/20 bg-black/20 hover:bg-black/40"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-[#E31E24]" />
                    <h3 className="text-white font-semibold text-sm">{source.name}</h3>
                  </div>
                  <p className="text-white/50 text-xs">{source.description}</p>
                </button>
              );
            })
          )}
        </div>

        {/* Search in Selected Source */}
        {selectedSource && (
          <div className="space-y-2 border-t border-[#E31E24]/20 pt-4">
            <label className="text-white/70 text-xs font-semibold">חפש בארכיון</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-[#E31E24]" />
                <input
                  type="text"
                  placeholder="חפש כתבה..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/30 border border-[#E31E24]/30 rounded-lg px-3 py-2 pr-10 text-white text-sm placeholder-white/30 focus:border-[#E31E24] focus:outline-none"
                  dir="rtl"
                />
              </div>
              <button
                onClick={() => handleSourceSelect(selectedSource)}
                disabled={loadingArticles}
                className="px-4 py-2 bg-[#E31E24] hover:bg-red-800 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
              >
                {loadingArticles ? "טוען..." : "חפש"}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}