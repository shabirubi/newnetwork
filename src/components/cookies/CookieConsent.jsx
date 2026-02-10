import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Shield } from "lucide-react";

export default function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [language, setLanguage] = useState('he');

  useEffect(() => {
    const hasAccepted = localStorage.getItem('cookieConsent');
    const savedLang = localStorage.getItem('cookieLanguage') || 'he';
    setLanguage(savedLang);
    if (!hasAccepted) {
      setIsOpen(true);
    } else {
      setAccepted(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookieLanguage', language);
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
          {/* Water Flow Background */}
          <div 
            className="absolute inset-0 rounded-3xl overflow-hidden"
            onClick={handleReject}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#001a4d]/50 via-[#003d99]/40 to-[#0066FF]/30" />
            <motion.div 
              className="absolute inset-0 opacity-30"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{
                backgroundImage: "linear-gradient(45deg, #00D4FF 25%, transparent 25%, transparent 50%, #00D4FF 50%, #00D4FF 75%, transparent 75%, transparent)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          {/* Cookie Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="bg-gradient-to-br from-[#001a4d]/90 via-[#003d99]/80 to-[#0066FF]/70 rounded-3xl p-6 sm:p-8 border-2 border-[#00D4FF]/60 shadow-2xl shadow-[#00D4FF]/30 relative overflow-hidden">
              {/* Animated Water Waves */}
              <motion.div 
                className="absolute -inset-1 opacity-20"
                animate={{
                  x: [0, 10, -10, 0],
                  y: [0, -5, 5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{
                  background: "linear-gradient(135deg, #00D4FF, #0099FF, #00D4FF)",
                  filter: "blur(40px)"
                }}
              />
              <div className="relative z-10">
                {/* Close Button */}
                <button
                  onClick={handleReject}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all z-20"
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
                        '0 0 20px rgba(0, 212, 255, 0.3)',
                        '0 0 40px rgba(0, 212, 255, 0.5)',
                        '0 0 20px rgba(0, 212, 255, 0.3)'
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#00D4FF]/20 border-2 border-[#00D4FF]/50 flex items-center justify-center"
                  >
                    <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
                  </motion.div>

                  {/* Text Content */}
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                      {language === 'he' ? 'אנחנו משתמשים בעוגיות' : 'We Use Cookies'}
                    </h3>
                    <p className="text-white/85 text-sm sm:text-base leading-relaxed">
                      {language === 'he' 
                        ? 'אנו משתמשים בעוגיות לשיפור החוויה שלך, ניתוח תעבורה והתאמה אישית של תוכן. על ידי המשך השימוש באתר, אתה מסכים לשימוש שלנו בעוגיות.'
                        : 'We use cookies to improve your experience, analyze traffic, and personalize content. By continuing to use our site, you agree to our cookie usage.'}
                    </p>
                  </div>
                </div>

                {/* Language & Buttons */}
                <div className="space-y-3">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setLanguage('he')}
                      className={`px-4 py-2 rounded-lg font-bold transition-all ${language === 'he' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70'}`}
                    >
                      עברית
                    </button>
                    <button
                      onClick={() => setLanguage('en')}
                      className={`px-4 py-2 rounded-lg font-bold transition-all ${language === 'en' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70'}`}
                    >
                      English
                    </button>
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReject}
                      className="flex-1 px-6 py-3 rounded-xl bg-[#00D4FF]/20 hover:bg-[#00D4FF]/40 text-white font-semibold transition-all border border-[#00D4FF]/40 hover:border-[#00D4FF]/60"
                    >
                      {language === 'he' ? 'דחה' : 'Reject'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAccept}
                      className="flex-1 px-6 py-3 rounded-xl bg-[#00D4FF]/80 hover:bg-[#00D4FF] text-white font-bold transition-all shadow-lg shadow-[#00D4FF]/40 hover:shadow-xl flex items-center justify-center gap-2 border border-[#00D4FF]/50"
                    >
                      <Check className="w-5 h-5" />
                      {language === 'he' ? 'אני מסכים' : 'I Accept'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}