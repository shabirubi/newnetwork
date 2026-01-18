import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Download, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ImageGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [articleText, setArticleText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async () => {
    if (!articleText.trim()) {
      toast.error("אנא הזן טקסט כתבה");
      return;
    }

    setIsGenerating(true);
    try {
      // First, get image description from article
      const description = await base44.integrations.Core.InvokeLLM({
        prompt: `על סמך הכתבה הבאה, תן לי תיאור קצר (עד 50 מילים) לתמונה שמתאימה לכתבה.
התיאור צריך להיות בסגנון צילום עיתונאי, ריאליסטי, איכותי.

כתבה:
${articleText}`,
        add_context_from_internet: false
      });

      // Generate image
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `Professional news photography, high quality, photojournalism style, realistic: ${description}. Sharp focus, professional lighting, news-worthy image.`
      });

      setImageUrl(result.url);
      toast.success("התמונה נוצרה בהצלחה!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("שגיאה ביצירת התמונה");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-pink-500/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-pink-600/20 flex items-center justify-center">
          <Image className="w-6 h-6 text-pink-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">מחולל תמונות AI</h3>
          <p className="text-gray-400 text-sm">תמונה מקצועית לכתבה</p>
        </div>
      </div>
      
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800"
      >
        <Image className="w-5 h-5 ml-2" />
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
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl border border-pink-500/30 max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-pink-600 to-pink-800 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <Image className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">מחולל תמונות AI</h2>
                      <p className="text-pink-100 text-sm">צור תמונה מקצועית לכתבה</p>
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
                  onClick={generateImage}
                  disabled={isGenerating || !articleText.trim()}
                  className="w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white py-6 text-lg font-bold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      מייצר תמונה... (עד דקה)
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 ml-2" />
                      צור תמונה
                    </>
                  )}
                </Button>

                {imageUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <h3 className="text-white font-bold text-lg">התמונה שנוצרה:</h3>
                    <div className="relative rounded-xl overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt="Generated"
                        className="w-full h-auto"
                      />
                    </div>
                    <a
                      href={imageUrl}
                      download="article-image.png"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="w-full bg-pink-600 hover:bg-pink-700">
                        <Download className="w-4 h-4 ml-2" />
                        הורד תמונה
                      </Button>
                    </a>
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