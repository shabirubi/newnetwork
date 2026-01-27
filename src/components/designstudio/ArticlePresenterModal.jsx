import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader, Newspaper, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export function ArticlePresenterModal({ isOpen, onClose, imageUrl }) {
  const [mode, setMode] = useState("select"); // select, custom
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [customText, setCustomText] = useState("");
  const [articles, setArticles] = useState([]);
  const [showArticles, setShowArticles] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState("he");

  const voices = [
    { id: "he", name: "📰 עברית - כתב חדשות (זכר)" },
    { id: "he-female", name: "📰 עברית - כתבת חדשות (נקבה)" },
    { id: "en", name: "📰 English News - Male" },
    { id: "en-female", name: "📰 English News - Female" },
    { id: "ar", name: "🌍 العربية - مذيع أخبار" },
  ];

  // Fetch articles when modal opens
  React.useEffect(() => {
    if (isOpen && !articles.length) {
      fetchArticles();
    }
  }, [isOpen]);

  const fetchArticles = async () => {
    try {
      const data = await base44.entities.NewsArticle.list("-created_date", 50);
      setArticles(data);
    } catch {
      toast.error("שגיאה בטעינת הכתבות");
    }
  };

  const handleGeneratePresentation = async () => {
    let textToPresent = "";
    let title = "";

    if (mode === "select" && selectedArticle) {
      textToPresent = selectedArticle.content;
      title = selectedArticle.title;
    } else if (mode === "custom" && customText.trim()) {
      textToPresent = customText;
      title = "הצגה מקצועית";
    } else {
      toast.error("אנא בחר כתבה או הכנס טקסט");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke("createArticlePresentation", {
        imageUrl,
        text: textToPresent,
        title,
        voice: selectedVoice,
      });

      if (response.data?.video_url) {
        setGeneratedVideo({
          url: response.data.video_url,
          title,
          duration: response.data.duration,
        });
        toast.success("✅ הצגת כתבה נוצרה בהצלחה");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("שגיאה ביצירת ההצגה");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedVideo) return;
    try {
      const response = await fetch(generatedVideo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `presentation-${Date.now()}.mp4`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("✅ הווידאו הורד בהצלחה");
    } catch {
      toast.error("שגיאה בהורדה");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-blue-900/40 to-black border border-blue-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Newspaper className="w-6 h-6 text-blue-400" />
                הגשת כתבה מקצועית
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {!generatedVideo ? (
              <div className="space-y-4">
                {/* Mode Selection */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    בחר מצב
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMode("select")}
                      className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                        mode === "select"
                          ? "bg-blue-600 text-white"
                          : "bg-black/60 text-gray-400 border border-blue-500/30"
                      }`}
                    >
                      📰 בחר כתבה
                    </button>
                    <button
                      onClick={() => setMode("custom")}
                      className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                        mode === "custom"
                          ? "bg-blue-600 text-white"
                          : "bg-black/60 text-gray-400 border border-blue-500/30"
                      }`}
                    >
                      ✍️ טקסט חופשי
                    </button>
                  </div>
                </div>

                {/* Select Article Mode */}
                {mode === "select" && (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-white">
                      בחר כתבה
                    </label>
                    <button
                      onClick={() => setShowArticles(!showArticles)}
                      className="w-full bg-black/60 border border-blue-500/30 text-white rounded-lg p-3 text-left flex justify-between items-center"
                    >
                      <span>
                        {selectedArticle
                          ? selectedArticle.title.substring(0, 30) + "..."
                          : "בחר כתבה..."}
                      </span>
                      <Newspaper className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                      {showArticles && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-black/60 border border-blue-500/30 rounded-lg max-h-64 overflow-y-auto"
                        >
                          {articles.map((article) => (
                            <button
                              key={article.id}
                              onClick={() => {
                                setSelectedArticle(article);
                                setShowArticles(false);
                              }}
                              className="w-full p-3 text-left hover:bg-blue-600/20 border-b border-blue-500/10 text-white text-sm"
                            >
                              {article.title}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Custom Text Mode */}
                {mode === "custom" && (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-white">
                      טקסט להצגה
                    </label>
                    <Textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="כתוב את הטקסט שתרצה להגיש... (זמן משוער: 30 שניות עבור 150 מילים)"
                      className="bg-black/60 border-blue-500/30 text-white placeholder-white/40 resize-none h-40"
                    />
                    <div className="text-xs text-gray-400">
                      {customText.split(" ").length} מילים
                    </div>
                  </div>
                )}

                {/* Voice Selection */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    🎤 בחר קול
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full bg-black/60 border border-blue-500/30 text-white rounded-lg p-2 text-sm"
                  >
                    {voices.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGeneratePresentation}
                  disabled={isGenerating || !imageUrl}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      יוצר הצגה...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      צור הצגה מקצועית
                    </>
                  )}
                </Button>

                {/* Tips */}
                <div className="p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg text-xs text-blue-200">
                  <span className="font-semibold">💡 טיפ:</span> הצגה טובה = תמונה ברורה + טקסט עד 1000 מילים (≈5 דקות)
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="relative bg-black rounded-lg overflow-hidden border border-blue-500/30">
                  <video
                    src={generatedVideo.url}
                    controls
                    autoPlay
                    className="w-full aspect-video bg-black"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-400">כותרת:</p>
                  <p className="text-white font-semibold">{generatedVideo.title}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleDownload}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    הורד הצגה
                  </Button>
                  <Button
                    onClick={() => {
                      setGeneratedVideo(null);
                      setSelectedArticle(null);
                      setCustomText("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    צור חדש
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}