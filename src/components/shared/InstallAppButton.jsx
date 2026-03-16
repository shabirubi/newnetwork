import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone, Share } from "lucide-react";

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed recently (3 days)
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 3 * 24 * 60 * 60 * 1000) {
      return;
    }

    const ua = navigator.userAgent;
    const isIOSDevice = /iPhone|iPad|iPod/.test(ua) && !window.MSStream;
    const isAndroidDevice = /Android/.test(ua);

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    if (isIOSDevice) {
      // Always show for iOS since there's no event
      setTimeout(() => setShowBanner(true), 4000);
      return;
    }

    // Android / Chrome Desktop - capture install event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowBanner(true), 4000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Fallback: show for Android even without event (some browsers)
    if (isAndroidDevice) {
      setTimeout(() => {
        setShowBanner(prev => prev ? prev : true);
      }, 6000);
    }

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
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem('pwa_install_dismissed', Date.now().toString());
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Install Banner */}
      <AnimatePresence>
        {showBanner && !showIOSGuide && (
          <motion.div
            key="banner"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed bottom-20 lg:bottom-6 left-3 right-3 z-[9997] mx-auto max-w-sm"
            dir="rtl"
          >
            <div className="bg-black border-2 border-[#FF6B00] rounded-2xl shadow-2xl shadow-[#FF6B00]/40 p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/20 border border-[#FF6B00]/40 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-[#FF6B00]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">🔥 הוסף למסך הבית</p>
                <p className="text-gray-400 text-xs mt-0.5 leading-tight">
                  {isIOS
                    ? 'גישה מהירה ישירות מהמסך הראשי שלך'
                    : 'התקן כאפליקציה - ללא חנות אפליקציות!'}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleInstall}
                  className="bg-[#FF6B00] hover:bg-[#FF8C00] text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
                >
                  {isIOS ? <Share className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                  {isIOS ? 'הנחיות' : 'התקן'}
                </motion.button>
                <button onClick={handleDismiss} className="p-1.5 text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Step-by-step Guide */}
      <AnimatePresence>
        {showIOSGuide && (
          <motion.div
            key="ios-guide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-end justify-center"
            dir="rtl"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleDismiss} />
            <motion.div
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              className="relative w-full max-w-lg bg-black border-t-2 border-[#FF6B00] rounded-t-3xl p-6 pb-10"
            >
              <button onClick={handleDismiss} className="absolute top-4 left-4 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-white font-bold text-lg mb-1 text-center">הוסף למסך הבית</h3>
              <p className="text-gray-400 text-sm text-center mb-6">עקוב אחרי השלבים הבאים ב-Safari</p>

              <div className="space-y-4">
                {[
                  { step: '1', icon: '↑', text: 'לחץ על כפתור השיתוף בתחתית Safari', sub: 'הריבוע עם החץ למעלה' },
                  { step: '2', icon: '➕', text: 'גלול מטה ובחר "הוסף למסך הבית"', sub: 'Add to Home Screen' },
                  { step: '3', icon: '✓', text: 'לחץ "הוסף" בפינה הימנית העליונה', sub: 'האפליקציה תופיע במסך הבית שלך' },
                ].map(({ step, icon, text, sub }) => (
                  <div key={step} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {icon}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{text}</p>
                      <p className="text-gray-500 text-xs">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleDismiss}
                className="mt-6 w-full py-3 border border-gray-700 rounded-xl text-gray-400 text-sm hover:text-white transition-colors"
              >
                סגור
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}