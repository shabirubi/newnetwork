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
      icon: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
      url: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`,
      color: "#25D366"
    },
    {
      name: "Facebook",
      icon: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: "#1877F2"
    },
    {
      name: "X",
      icon: "https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      color: "#000000"
    },
    {
      name: "TikTok",
      icon: "https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/webapp-desktop/8152caf0c8e8bc67ae0d.png",
      url: `https://www.tiktok.com/share?url=${encodeURIComponent(shareUrl)}`,
      color: "#000000"
    },
    {
      name: "Telegram",
      icon: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      color: "#26A5E4"
    },
    {
      name: "LinkedIn",
      icon: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: "#0A66C2"
    },
    {
      name: "Reddit",
      icon: "https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png",
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
      color: "#FF4500"
    },
    {
      name: "Email",
      icon: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Gmail_Icon.png",
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`,
      color: "#EA4335"
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
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute left-0 bottom-full mb-2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-5 z-[9999] w-80 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-base text-white">שתף ברשתות חברתיות</span>
              <button 
                onClick={() => setShowMenu(false)}
                className="text-gray-400 hover:text-white transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-4">
              {socialNetworks.map((network, idx) => (
                <motion.a
                  key={network.name}
                  href={network.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex flex-col items-center gap-2 group"
                  onClick={() => setShowMenu(false)}
                >
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95 bg-white/10 backdrop-blur-sm p-2.5 shadow-lg group-hover:bg-white/20 border border-white/10"
                  >
                    <img 
                      src={network.icon} 
                      alt={network.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[10px] text-gray-300 text-center font-medium">{network.name}</span>
                </motion.a>
              ))}
            </div>

            <button
              onClick={copyToClipboard}
              className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 text-white border border-white/10 active:scale-95"
            >
              {copied ? (
                <>
                  <Check size={18} className="text-green-400" />
                  הקישור הועתק!
                </>
              ) : (
                <>
                  <Share2 size={18} />
                  העתק קישור
                </>
              )}
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}