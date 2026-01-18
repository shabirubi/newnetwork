import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Loader2, Flame, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TrendsAnalyzer() {
  const [isOpen, setIsOpen] = useState(false);
  const [trends, setTrends] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const analyzeTrends = async () => {
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `נתח את המגמות החמות בחדשות ישראליות כרגע (7.1.2026).
תן לי:
1. 5 נושאים חמים ביותר
2. 10 מילות מפתח פופולריות
3. 3 טרנדים עולים

החזר JSON במבנה הבא:`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            hot_topics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  topic: { type: "string" },
                  popularity: { type: "number" }
                }
              }
            },
            keywords: {
              type: "array",
              items: { type: "string" }
            },
            rising_trends: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setTrends(result);
      toast.success("הניתוח הושלם!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("שגיאה בניתוח המגמות");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-orange-600/20 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">ניתוח מגמות AI</h3>
          <p className="text-gray-400 text-sm">נושאים חמים ומילות מפתח</p>
        </div>
      </div>
      
      <Button
        onClick={() => {
          setIsOpen(true);
          if (!trends) analyzeTrends();
        }}
        className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
      >
        <TrendingUp className="w-5 h-5 ml-2" />
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
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl border border-orange-500/30 max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-orange-600 to-orange-800 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">ניתוח מגמות חדשות</h2>
                      <p className="text-orange-100 text-sm">נושאים חמים ומילות מפתח</p>
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
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                    <p className="text-white">מנתח מגמות...</p>
                  </div>
                ) : trends ? (
                  <>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        נושאים חמים
                      </h3>
                      <div className="space-y-3">
                        {trends.hot_topics?.map((topic, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-white text-lg">{topic.topic}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-orange-500"
                                    style={{ width: `${topic.popularity}%` }}
                                  />
                                </div>
                                <span className="text-orange-400 font-bold text-sm">{topic.popularity}%</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <Hash className="w-5 h-5 text-orange-500" />
                        מילות מפתח פופולריות
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {trends.keywords?.map((keyword, idx) => (
                          <motion.span
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="px-4 py-2 bg-orange-600/20 border border-orange-500/30 rounded-full text-orange-300 font-medium"
                          >
                            {keyword}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        טרנדים עולים
                      </h3>
                      <div className="space-y-2">
                        {trends.rising_trends?.map((trend, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-green-900/20 border border-green-500/30 rounded-xl p-3 text-green-300"
                          >
                            ↗ {trend}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={analyzeTrends}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      <TrendingUp className="w-4 h-4 ml-2" />
                      רענן ניתוח
                    </Button>
                  </>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}