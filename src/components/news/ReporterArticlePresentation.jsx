import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import UploadArticleToPlayer from "./UploadArticleToPlayer";

export default function ReporterArticlePresentation({ article, reporter }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVideo, setShowVideo] = useState(!!article.video_url);
  const [videoUrl, setVideoUrl] = useState(article.video_url || null);

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    toast.loading("יוצר וידאו הצגה של הכתבה...", { id: 'report-gen' });

    try {
      const response = await base44.functions.invoke('createReporterNewsVideo', {
        articleId: article.id,
        reporterId: reporter.id,
        reporterName: reporter.name,
        reporterImage: reporter.image,
        reporterGender: reporter.gender || 'male'
      });

      if (response.data.video_url) {
        setVideoUrl(response.data.video_url);
        setShowVideo(true);
        toast.success("הוידאו מוכן! 🎬", { id: 'report-gen' });
      } else {
        throw new Error('לא התקבל URL');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("שגיאה ביצירת הוידאו", { id: 'report-gen' });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!reporter) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-black/40 to-black/20 rounded-xl p-4 border border-[#E31E24]/30"
    >
      {showVideo && videoUrl ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg overflow-hidden bg-black"
        >
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-auto max-h-96 object-cover"
            onError={() => {
              toast.error("שגיאה בטעינת הוידאו");
              setShowVideo(false);
            }}
          />
          <div className="p-3 bg-black/80 border-t border-[#E31E24]/30">
            <p className="text-sm text-white flex items-center gap-2">
              <span className="text-[#E31E24]">📺</span>
              הצגת הכתבה על ידי {reporter.name}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-[#E31E24]/50">
            <img
              src={reporter.image}
              alt={reporter.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">{reporter.name}</p>
            <p className="text-xs text-gray-400">{reporter.specialty}</p>
          </div>
          <Button
            onClick={handleGenerateVideo}
            disabled={isGenerating}
            className="bg-gradient-to-r from-[#E31E24] to-red-700 hover:from-red-700 hover:to-red-800 text-white"
            size="sm"
          >
            {isGenerating ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                הצג כתבה
              </>
            )}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}