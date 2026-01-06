import React, { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShareButtons({ url, title, size = "default", showLabel = true }) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const shareUrl = url || window.location.href;
  const shareTitle = title || "הרשת החדשה";

  const socialNetworks = [
    {
      name: "WhatsApp",
      icon: "🟢",
      url: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`,
      color: "#25D366",
      gradient: "from-green-400 to-green-600"
    },
    {
      name: "Facebook",
      icon: "📘",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: "#1877F2",
      gradient: "from-blue-500 to-blue-700"
    },
    {
      name: "X",
      icon: "✖️",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      color: "#000000",
      gradient: "from-gray-700 to-black"
    },
    {
      name: "Telegram",
      icon: "✈️",
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      color: "#26A5E4",
      gradient: "from-blue-400 to-blue-600"
    },
    {
      name: "TikTok",
      icon: "🎵",
      url: `https://www.tiktok.com/upload?caption=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`,
      color: "#000000",
      gradient: "from-cyan-400 via-pink-500 to-yellow-400"
    },
    {
      name: "LinkedIn",
      icon: "💼",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: "#0A66C2",
      gradient: "from-blue-600 to-blue-800"
    },
    {
      name: "Reddit",
      icon: "🔴",
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
      color: "#FF4500",
      gradient: "from-orange-500 to-red-600"
    },
    {
      name: "Email",
      icon: "📧",
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`,
      color: "#EA4335",
      gradient: "from-red-400 to-red-600"
    }
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const iconSize = size === "small" ? "w-8 h-8" : size === "large" ? "w-12 h-12" : "w-10 h-10";

  return (
    <div className="relative">
      <Button
        variant="outline"
        size={size === "small" ? "sm" : "default"}
        onClick={() => setShowMenu(!showMenu)}
        className="gap-2 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
      >
        <Share2 size={size === "small" ? 14 : 18} />
        {showLabel && "שתף"}
      </Button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setShowMenu(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="absolute left-0 bottom-full mb-2 bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-800 rounded-2xl shadow-2xl border-2 border-gray-100 dark:border-gray-700 p-5 z-[9999] w-80 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base dark:text-white">שתף את התוכן</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">בחר פלטפורמה</p>
              </div>
              <button 
                onClick={() => setShowMenu(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-3 mb-4">
              {socialNetworks.map((network, index) => (
                <motion.a
                  key={network.name}
                  href={network.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 group"
                  onClick={() => setShowMenu(false)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div 
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${network.gradient} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:rotate-3 shadow-md`}
                  >
                    <span className="text-2xl">{network.icon}</span>
                  </div>
                  <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">{network.name}</span>
                </motion.a>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <button
                onClick={copyToClipboard}
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 dark:text-white shadow-sm hover:shadow-md active:scale-95"
              >
                {copied ? (
                  <>
                    <Check size={18} className="text-green-500" />
                    הקישור הועתק!
                  </>
                ) : (
                  <>
                    <Share2 size={18} />
                    העתק קישור
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}