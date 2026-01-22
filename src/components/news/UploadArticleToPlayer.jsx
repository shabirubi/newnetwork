import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Loader, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function UploadArticleToPlayer({ article, reporter }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadToPlayer = async () => {
    if (!reporter || !reporter.image) {
      toast.error("דרוש בחירת כתב/כתבת");
      return;
    }

    setIsUploading(true);
    toast.loading("מעלה כתבה לנגן...", { id: 'upload-player' });

    try {
      // Generate video
      const videoResponse = await base44.functions.invoke('createReporterNewsVideo', {
        articleId: article.id,
        reporterId: reporter.id,
        reporterName: reporter.name,
        reporterImage: reporter.image,
        reporterGender: reporter.gender || 'male'
      });

      if (videoResponse.data.video_url) {
        // Dispatch event to send to main player
        window.dispatchEvent(new CustomEvent('uploadArticleToPlayer', {
          detail: {
            videoUrl: videoResponse.data.video_url,
            articleTitle: article.title,
            reporterName: reporter.name,
            articleId: article.id
          }
        }));

        toast.success("כתבה הועלתה לנגן! 🎬", { id: 'upload-player' });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("שגיאה בהעלאת הכתבה", { id: 'upload-player' });
    } finally {
      setIsUploading(false);
    }
  };

  if (!reporter) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleUploadToPlayer}
      disabled={isUploading}
      className="w-full bg-gradient-to-r from-[#E31E24] to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
    >
      {isUploading ? (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          מעלה לנגן...
        </>
      ) : (
        <>
          <Upload className="w-5 h-5" />
          העלה לנגן הראשי
        </>
      )}
    </motion.button>
  );
}