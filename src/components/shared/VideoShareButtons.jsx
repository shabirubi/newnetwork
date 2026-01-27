import React from "react";
import { motion } from "framer-motion";
import { Share2, Instagram, Facebook, Twitter } from "lucide-react";
import { toast } from "sonner";

export default function VideoShareButtons({ videoUrl, title = "", className = "" }) {
  const shareToTikTok = () => {
    // TikTok doesn't have direct web share API, copy link
    navigator.clipboard.writeText(videoUrl);
    toast.success("קישור הועתק! פתח את TikTok והדבק");
  };

  const shareToInstagram = () => {
    // Instagram doesn't have direct web share, copy link
    navigator.clipboard.writeText(videoUrl);
    toast.success("קישור הועתק! פתח את Instagram והדבק");
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const text = title ? `${title}\n${videoUrl}` : videoUrl;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareGeneral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'וידאו מהרשת החדשה',
          url: videoUrl
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          navigator.clipboard.writeText(videoUrl);
          toast.success("קישור הועתק ללוח!");
        }
      }
    } else {
      navigator.clipboard.writeText(videoUrl);
      toast.success("קישור הועתק ללוח!");
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* TikTok */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={shareToTikTok}
        className="w-8 h-8 rounded-full bg-black hover:bg-gray-900 flex items-center justify-center transition-colors shadow-lg"
        title="שתף ב-TikTok"
      >
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      </motion.button>

      {/* Instagram */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={shareToInstagram}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 flex items-center justify-center transition-all shadow-lg"
        title="שתף באינסטגרם"
      >
        <Instagram className="w-4 h-4 text-white" />
      </motion.button>

      {/* Facebook */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={shareToFacebook}
        className="w-8 h-8 rounded-full bg-[#1877F2] hover:bg-[#166FE5] flex items-center justify-center transition-colors shadow-lg"
        title="שתף בפייסבוק"
      >
        <Facebook className="w-4 h-4 text-white" fill="currentColor" />
      </motion.button>

      {/* X (Twitter) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={shareToTwitter}
        className="w-8 h-8 rounded-full bg-black hover:bg-gray-900 flex items-center justify-center transition-colors shadow-lg"
        title="שתף ב-X"
      >
        <Twitter className="w-4 h-4 text-white" fill="currentColor" />
      </motion.button>

      {/* General Share */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={shareGeneral}
        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors shadow-lg border border-white/20"
        title="שתף"
      >
        <Share2 className="w-4 h-4 text-white" />
      </motion.button>
    </div>
  );
}