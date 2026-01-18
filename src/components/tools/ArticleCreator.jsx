import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { FileEdit, Loader2, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const categories = [
  { value: "breaking", label: "חדשות חמות" },
  { value: "security", label: "ביטחון" },
  { value: "economy", label: "כלכלה" },
  { value: "politics", label: "פוליטיקה" },
  { value: "technology", label: "טכנולוגיה" },
  { value: "sports", label: "ספורט" },
  { value: "entertainment", label: "בידור" },
  { value: "world", label: "עולם" },
  { value: "health", label: "בריאות" }
];

export default function ArticleCreator() {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("breaking");
  const [isGenerating, setIsGenerating] = useState(false);
  const [article, setArticle] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const generateArticle = async () => {
    if (!topic.trim()) {
      toast.error("אנא הזן נושא לכתבה");
      return;
    }

    setIsGenerating(true);
    try {
      // Generate article content
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `כתוב כתבה עיתונאית מקצועית על הנושא: "${topic}"

הכתבה צריכה לכלול:
- כותרת משיכת תשומת לב (עד 12 מילים)
- כותרת משנה מעניינת
- תוכן מפורט (לפחות 300 מילים)
- סגנון עיתונאי מקצועי
- מידע מדויק ועדכני

החזר JSON במבנה הבא:`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            subtitle: { type: "string" },
            content: { type: "string" }
          }
        }
      });

      // Generate image
      const imageResult = await base44.integrations.Core.GenerateImage({
        prompt: `Professional news photography for article about: ${topic}. High quality, photojournalism style, realistic, sharp focus.`
      });

      setArticle({
        title: result.title,
        subtitle: result.subtitle,
        content: result.content,
        image_url: imageResult.url,
        category: category
      });

      toast.success("הכתבה נוצרה בהצלחה!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("שגיאה ביצירת הכתבה");
    } finally {
      setIsGenerating(false);
    }
  };

  const publishArticle = async () => {
    if (!article) return;

    setIsPublishing(true);
    try {
      await base44.entities.NewsArticle.create({
        title: article.title,
        subtitle: article.subtitle,
        content: article.content,
        image_url: article.image_url,
        category: article.category,
        is_breaking: article.category === "breaking",
        is_featured: true
      });

      toast.success("הכתבה פורסמה בהצלחה! 🎉");
      setIsOpen(false);
      setArticle(null);
      setTopic("");
    } catch (error) {
      console.error('Error:', error);
      toast.error("שגיאה בפרסום הכתבה");
    } finally {
      setIsPublishing(false);
    }
  };

  const reset = () => {
    setArticle(null);
    setTopic("");
  };

  return (
    <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
          <FileEdit className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">יוצר כתבות AI</h3>
          <p className="text-gray-400 text-sm">כתיבה ופרסום אוטומטי</p>
        </div>
      </div>
      
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
      >
        <FileEdit className="w-5 h-5 ml-2" />
        פתח כלי
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 999999 }}
            onClick={() => !isGenerating && !isPublishing && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl border border-blue-500/30 max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <FileEdit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">יוצר כתבות AI</h2>
                      <p className="text-blue-100 text-sm">כתיבה ופרסום אוטומטי לאתר</p>
                    </div>
                  </div>
                  <button
                    onClick={() => !isGenerating && !isPublishing && setIsOpen(false)}
                    disabled={isGenerating || isPublishing}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <span className="text-white text-2xl">×</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {!article ? (
                  <>
                    <div>
                      <label className="block text-white font-bold mb-3">נושא הכתבה</label>
                      <Input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="לדוגמה: הפיכה טכנולוגית בתחום הבינה המלאכותית"
                        className="bg-gray-800 border-gray-700 text-white"
                        disabled={isGenerating}
                      />
                    </div>

                    <div>
                      <label className="block text-white font-bold mb-3">קטגוריה</label>
                      <Select value={category} onValueChange={setCategory} disabled={isGenerating}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={generateArticle}
                      disabled={isGenerating || !topic.trim()}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-lg font-bold"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                          יוצר כתבה ותמונה...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 ml-2" />
                          צור כתבה
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
                      <Check className="w-6 h-6 text-green-400" />
                      <p className="text-green-300 font-medium">הכתבה מוכנה לפרסום!</p>
                    </div>

                    {article.image_url && (
                      <div className="rounded-xl overflow-hidden">
                        <img src={article.image_url} alt={article.title} className="w-full h-auto" />
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">כותרת</label>
                        <Input
                          value={article.title}
                          onChange={(e) => setArticle({...article, title: e.target.value})}
                          className="bg-gray-800 border-gray-700 text-white font-bold text-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-1">כותרת משנה</label>
                        <Input
                          value={article.subtitle}
                          onChange={(e) => setArticle({...article, subtitle: e.target.value})}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-1">תוכן</label>
                        <Textarea
                          value={article.content}
                          onChange={(e) => setArticle({...article, content: e.target.value})}
                          className="min-h-64 bg-gray-800 border-gray-700 text-white resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={publishArticle}
                        disabled={isPublishing}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 text-lg font-bold"
                      >
                        {isPublishing ? (
                          <>
                            <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                            מפרסם...
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5 ml-2" />
                            פרסם באתר
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={reset}
                        disabled={isPublishing}
                        variant="outline"
                        className="border-gray-700 text-white hover:bg-gray-800"
                      >
                        התחל מחדש
                      </Button>
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