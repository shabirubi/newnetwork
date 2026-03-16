import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    // iOS detection
    const isIOSDevice = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      setTimeout(() => setShowBanner(true), 3000);
      return;
    }

    // Android / Desktop - listen for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa_install_dismissed', Date.now().toString());
  };

  if (isInstalled || !showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 lg:bottom-6 left-4 right-4 z-[9998] mx-auto max-w-sm"
        dir="rtl"
      >
        <div className="bg-black border-2 border-[#FF6B00] rounded-2xl shadow-2xl shadow-[#FF6B00]/30 p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/20 border border-[#FF6B00]/40 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-6 h-6 text-[#FF6B00]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">התקן את הרשת החדשה</p>
            {isIOS ? (
              <p className="text-gray-400 text-xs mt-0.5">
                לחץ על <span className="text-[#FF6B00]">שתף ↑</span> ואז "הוסף למסך הבית"
              </p>
            ) : (
              <p className="text-gray-400 text-xs mt-0.5">גישה מהירה ישירות מהמסך הראשי</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isIOS && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleInstall}
                className="bg-[#FF6B00] hover:bg-[#FF8C00] text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                התקן
              </motion.button>
            )}
            <button
              onClick={handleDismiss}
              className="p-1.5 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}