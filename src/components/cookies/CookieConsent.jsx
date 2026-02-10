import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Shield } from "lucide-react";

export default function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('cookieConsent');
    if (!hasAccepted) {
      setIsOpen(true);
    } else {
      setAccepted(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setAccepted(true);
    setIsOpen(false);
  };

  const handleReject = () => {
    setIsOpen(false);
  };

  if (accepted || !isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-0 left-0 right-0 z-[10000] p-4 sm:p-6"
        >
          {/* Blur Background */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-md rounded-3xl"
            onClick={handleReject}
          />

          {/* Cookie Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="bg-gradient-to-br from-[#0080FF]/40 via-[#0066FF]/30 to-[#0080FF]/25 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border-2 border-[#0080FF]/50 shadow-2xl shadow-[#0080FF]/40">
              {/* Close Button */}
              <button
                onClick={handleReject}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Content */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                {/* Shield Icon with Animation */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      '0 0 20px rgba(0, 128, 255, 0.3)',
                      '0 0 40px rgba(0, 128, 255, 0.5)',
                      '0 0 20px rgba(0, 128, 255, 0.3)'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#0080FF]/20 border-2 border-[#0080FF]/50 flex items-center justify-center"
                >
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
                </motion.div>

                {/* Text Content */}
                <div className="flex-1 text-right sm:text-right">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                    אנחנו משתמשים בעוגיות
                  </h3>
                  <p className="text-white/85 text-sm sm:text-base leading-relaxed">
                    אנו משתמשים בעוגיות לשיפור החוויה שלך, ניתוח תעבורה והתאמה אישית של תוכן. על ידי המשך השימוש באתר, אתה מסכים לשימוש שלנו בעוגיות.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6 sm:mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReject}
                  className="flex-1 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all border border-white/30 hover:border-white/50"
                >
                  דחה
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAccept}
                  className="flex-1 px-6 py-3 rounded-xl bg-white text-[#0080FF] font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  אני מסכים
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}