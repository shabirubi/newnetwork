import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Tv, Play, Loader2, Sparkles, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TVAnchor() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [script, setScript] = useState("");
  const [showVideo, setShowVideo] = useState(false);

  const generateBroadcast = async () => {
    setIsGenerating(true);
    toast.info("קריין החדשות מכין את השידור...");

    try {
      const response = await base44.functions.invoke('generateTVAnchor', {});
      
      if (response?.data?.video_url) {
        setVideoUrl(response.data.video_url);
        setScript(response.data.script || "");
        setShowVideo(true);
        toast.success("השידור מוכן! 📺");
      } else {
        throw new Error('לא התקבל וידאו');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(`שגיאה: ${error.message || 'לא ניתן לייצר שידור'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={generateBroadcast}
        disabled={isGenerating}
        className="fixed bottom-32 left-6 z-50 flex flex-col items-center gap-3 group"
      >
        <div className="absolute inset-0 w-20 h-20 rounded-full bg-blue-600 opacity-20 animate-pulse" />
        
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 shadow-2xl flex items-center justify-center group-hover:shadow-blue-600/50 transition-all">
          <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-pulse opacity-50" />
          {isGenerating ? (
            <Loader2 className="w-10 h-10 text-white animate-spin relative z-10" />
          ) : (
            <Tv className="w-10 h-10 text-white relative z-10" />
          )}
        </div>
        
        <span className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg">
          {isGenerating ? "מייצר שידור..." : "קריין החדשות שלנו"}
        </span>
      </motion.button>

      {/* Video Modal */}
      {showVideo && videoUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-4"
          onClick={() => setShowVideo(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Tv className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">קריין החדשות - הרשת החדשה</h3>
                  <p className="text-white/80 text-sm">שידור חי מהסטודיו</p>
                </div>
              </div>
              <button
                onClick={() => setShowVideo(false)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative bg-black aspect-video">
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full"
              />
            </div>

            {/* Script */}
            {script && (
              <div className="p-4 bg-gray-800">
                <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  תסריט השידור
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {script}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="p-4 bg-gray-800 border-t border-gray-700 flex gap-3">
              <Button
                onClick={generateBroadcast}
                disabled={isGenerating}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    מייצר...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 ml-2" />
                    צור שידור חדש
                  </>
                )}
              </Button>
              <a
                href={videoUrl}
                download="tv-broadcast.mp4"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-600/10">
                  <Download className="w-4 h-4 ml-2" />
                  הורד
                </Button>
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}