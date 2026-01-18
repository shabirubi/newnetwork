import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function FactChecker() {
  const [isOpen, setIsOpen] = useState(false);
  const [claim, setClaim] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkFact = async () => {
    if (!claim.trim()) {
      toast.error("הזן טענה לבדיקה");
      return;
    }

    setIsLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `בדוק את הטענה הבאה וספק הערכה של רמת הדיוק:

טענה: "${claim}"

תשובתך צריכה להיות בפורמט JSON:
{
  "accuracy_score": מספר בין 1-100,
  "status": "True" או "False" או "Partial" או "Unknown",
  "explanation": "הסבר מפורט בעברית",
  "sources_needed": ["רשימת מקורות שיכולים לאמת או להפריך את הטענה"]
}`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            accuracy_score: { type: "number" },
            status: { type: "string" },
            explanation: { type: "string" },
            sources_needed: { type: "array", items: { type: "string" } }
          }
        }
      });
      setResult(response);
      toast.success("בדיקה הסתיימה");
    } catch (error) {
      toast.error("שגיאה בבדיקת העובדה");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "True":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "False":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Partial":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-8 cursor-pointer shadow-2xl"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">בדיקת עובדות</h3>
            <p className="text-green-100">אימות מידע בעזרת AI</p>
          </div>
        </div>
        <p className="text-white/90 text-sm">
          בדוק את דיוק הטענות וקבל הערכה של מהימנותן
        </p>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-3xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <h2 className="text-3xl font-bold dark:text-white">בדיקת עובדות</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 dark:text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium dark:text-white mb-2">
                    הזן טענה לבדיקה
                  </label>
                  <Textarea
                    placeholder="למשל: 'דופק הלב הנורמלי של בן אדם הוא 60-100 פעמים בדקה'"
                    value={claim}
                    onChange={(e) => setClaim(e.target.value)}
                    className="h-24"
                  />
                </div>

                <Button
                  onClick={checkFact}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      בודק...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 ml-2" />
                      בדוק עובדה
                    </>
                  )}
                </Button>

                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className={`rounded-2xl p-6 ${getStatusColor(result.status)}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold">{result.status}</span>
                        <div className="text-center">
                          <div className="text-4xl font-bold">{result.accuracy_score}</div>
                          <div className="text-xs">דיוק %</div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{result.explanation}</p>
                    </div>

                    {result.sources_needed && result.sources_needed.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
                        <p className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300 mb-3">
                          <AlertCircle className="w-5 h-5" />
                          מקורות מומלצים
                        </p>
                        <ul className="space-y-2">
                          {result.sources_needed.map((source, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                              • {source}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button
                      onClick={() => {
                        setClaim("");
                        setResult(null);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      בדוק טענה אחרת
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}