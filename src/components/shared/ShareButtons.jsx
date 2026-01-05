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
      name: "Twitter",
      icon: "https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      color: "#000000"
    },
    {
      name: "LinkedIn",
      icon: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: "#0A66C2"
    },
    {
      name: "Telegram",
      icon: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      color: "#26A5E4"
    },
    {
      name: "Email",
      icon: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Gmail_Icon.png",
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`,
      color: "#EA4335"
    },
    {
      name: "Reddit",
      icon: "https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png",
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
      color: "#FF4500"
    },
    {
      name: "Pinterest",
      icon: "https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png",
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareTitle)}`,
      color: "#E60023"
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
            className="fixed inset-0 z-[100]" 
            onClick={() => setShowMenu(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute left-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-[101] w-72"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm dark:text-white">שתף ברשתות חברתיות</span>
              <button 
                onClick={() => setShowMenu(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-3 mb-3">
              {socialNetworks.map((network) => (
                <a
                  key={network.name}
                  href={network.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 group"
                  onClick={() => setShowMenu(false)}
                >
                  <div 
                    className={`${iconSize} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 bg-white dark:bg-gray-700 p-1.5 shadow-md`}
                  >
                    <img 
                      src={network.icon} 
                      alt={network.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[10px] text-gray-600 dark:text-gray-400 text-center">{network.name}</span>
                </a>
              ))}
            </div>

            <button
              onClick={copyToClipboard}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 dark:text-white"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-green-500" />
                  הקישור הועתק!
                </>
              ) : (
                <>
                  <Share2 size={16} />
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