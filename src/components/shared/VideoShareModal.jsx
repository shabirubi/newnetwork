import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Copy, Check, Facebook, Twitter, Send, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

export default function VideoShareModal({ isOpen, onClose, videoUrl, videoTitle }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = videoUrl || window.location.href;
  const title = videoTitle || "צפה בסרטון זה מהרשת החדשה";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("הקישור הועתק בהצלחה");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + shareUrl)}`, '_blank');
  };

  const handleShareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`, '_blank');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-md w-full bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 shadow-2xl border border-white/10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E31E24] to-[#B91C1C] flex items-center justify-center mx-auto mb-3">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">שתף סרטון</h2>
            <p className="text-gray-400 text-sm mt-2">בחר היכן לשתף את הסרטון</p>
          </div>

          {/* Share Options */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleShareWhatsApp}
              className="w-full flex items-center gap-4 px-4 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl text-white transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <span className="font-bold text-lg">WhatsApp</span>
            </button>

            <button
              onClick={handleShareFacebook}
              className="w-full flex items-center gap-4 px-4 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-white transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Facebook className="w-6 h-6" />
              </div>
              <span className="font-bold text-lg">Facebook</span>
            </button>

            <button
              onClick={handleShareTwitter}
              className="w-full flex items-center gap-4 px-4 py-4 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 rounded-xl text-white transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Twitter className="w-6 h-6" />
              </div>
              <span className="font-bold text-lg">Twitter</span>
            </button>

            <button
              onClick={handleShareTelegram}
              className="w-full flex items-center gap-4 px-4 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 rounded-xl text-white transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Send className="w-6 h-6" />
              </div>
              <span className="font-bold text-lg">Telegram</span>
            </button>
          </div>

          {/* Copy Link */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-gray-400 text-sm mb-3">או העתק קישור</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-3 bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#E31E24] rounded-xl text-white font-bold transition-all"
              >
                {copied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}