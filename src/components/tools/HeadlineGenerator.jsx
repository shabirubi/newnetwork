import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, Loader2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function HeadlineGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [articleText, setArticleText] = useState("");
  const [headlines, setHeadlines] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const generateHeadlines = async () => {
    if (!articleText.trim()) {
      toast.error("אנא הזן טקסט כתבה");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `תן לי 10 כותרות משיכות תשומת לב, קליטות ויצירתיות לכתבה הבאה.
הכותרות צריכות להיות:
- קצרות (עד 12 מילים)
- משיכות עין
- מעוררות סקרנות
- מדויקות לתוכן

כתבה:
${articleText}

החזר JSON עם 10 כותרות בלבד.`,
        response_json_schema: {
          type: "object",
          properties: {
            headlines: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setHeadlines(result.headlines || []);
      toast.success("הכותרות נוצרו בהצלחה!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("שגיאה ביצירת הכותרות");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyHeadline = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("הכותרת הועתקה!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-indigo-600/20 flex items-center justify-center">
          <Type className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">מחולל כותרות AI</h3>
          <p className="text-gray-400 text-sm">10 כותרות יצירתיות לכתבה</p>
        </div>
      </div>
      
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
      >
        <Type className="w-5 h-5 ml-2" />
        פתח כלי
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl border border-indigo-500/30 max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <Type className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">מחולל כותרות AI</h2>
                      <p className="text-indigo-100 text-sm">קבל 10 כותרות יצירתיות לכתבה שלך</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <span className="text-white text-2xl">×</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-white font-bold mb-3">הדבק את הכתבה שלך</label>
                  <Textarea
                    value={articleText}
                    onChange={(e) => setArticleText(e.target.value)}
                    placeholder="הדבק כאן את תוכן הכתבה..."
                    className="min-h-48 bg-gray-800 border-gray-700 text-white resize-none"
                    disabled={isGenerating}
                  />
                </div>

                <Button
                  onClick={generateHeadlines}
                  disabled={isGenerating || !articleText.trim()}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-6 text-lg font-bold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      מייצר כותרות...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 ml-2" />
                      צור 10 כותרות
                    </>
                  )}
                </Button>

                {headlines.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-white font-bold text-lg">הכותרות שנוצרו:</h3>
                    {headlines.map((headline, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-start justify-between gap-3 hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex-1">
                          <span className="text-indigo-400 font-bold text-sm">#{idx + 1}</span>
                          <p className="text-white text-lg mt-1">{headline}</p>
                        </div>
                        <button
                          onClick={() => copyHeadline(headline, idx)}
                          className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center transition-colors"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-5 h-5 text-white" />
                          ) : (
                            <Copy className="w-5 h-5 text-white" />
                          )}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}