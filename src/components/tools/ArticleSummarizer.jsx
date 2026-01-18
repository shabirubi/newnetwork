import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ArticleSummarizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [articleText, setArticleText] = useState("");
  const [summary, setSummary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateSummary = async () => {
    if (!articleText.trim()) {
      toast.error("אנא הזן טקסט כתבה");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `סכם את הכתבה הבאה ל-2-3 משפטים קצרים ותמציתיים.
התקציר צריך:
- לכלול את הנקודות העיקריות
- להיות ברור וקליט
- לשמור על טון עיתונאי
- לא יותר מ-3 משפטים

כתבה:
${articleText}`,
        add_context_from_internet: false
      });

      setSummary(result);
      toast.success("התקציר נוצר בהצלחה!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("שגיאה ביצירת התקציר");
    } finally {
      setIsGenerating(false);
    }
  };

  const copySummary = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success("התקציר הועתק!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center">
          <FileText className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">מסכם כתבות AI</h3>
          <p className="text-gray-400 text-sm">תקציר של 2-3 משפטים</p>
        </div>
      </div>
      
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
      >
        <FileText className="w-5 h-5 ml-2" />
        פתח כלי
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl border border-green-500/30 max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-green-600 to-green-800 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">מסכם כתבות AI</h2>
                      <p className="text-green-100 text-sm">קבל תקציר של 2-3 משפטים</p>
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
                    placeholder="הדבק כאן את תוכן הכתבה המלאה..."
                    className="min-h-48 bg-gray-800 border-gray-700 text-white resize-none"
                    disabled={isGenerating}
                  />
                </div>

                <Button
                  onClick={generateSummary}
                  disabled={isGenerating || !articleText.trim()}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 text-lg font-bold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      מייצר תקציר...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 ml-2" />
                      צור תקציר
                    </>
                  )}
                </Button>

                {summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <h3 className="text-white font-bold text-lg">התקציר:</h3>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                      <p className="text-white text-lg leading-relaxed">{summary}</p>
                      <button
                        onClick={copySummary}
                        className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            הועתק!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            העתק תקציר
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}