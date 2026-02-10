import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Shield, Type, Contrast } from "lucide-react";

export default function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [language, setLanguage] = useState('he');
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [a11ySettings, setA11ySettings] = useState({
    textSize: 1,
    contrast: 'normal',
    dyslexia: false,
    boldText: false
  });

  useEffect(() => {
    const hasAccepted = localStorage.getItem('cookieConsent');
    const savedLang = localStorage.getItem('cookieLanguage') || 'he';
    setLanguage(savedLang);
    if (!hasAccepted) {
      setIsOpen(true);
    } else {
      setAccepted(true);
    }

    // Load accessibility settings
    const savedA11y = localStorage.getItem('a11ySettings');
    if (savedA11y) {
      setA11ySettings(JSON.parse(savedA11y));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('a11ySettings', JSON.stringify(a11ySettings));

    if (a11ySettings.textSize !== 1) {
      document.documentElement.style.fontSize = (16 * a11ySettings.textSize) + 'px';
    }

    if (a11ySettings.contrast === 'high') {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (a11ySettings.dyslexia) {
      document.documentElement.classList.add('dyslexia-font');
    } else {
      document.documentElement.classList.remove('dyslexia-font');
    }

    if (a11ySettings.boldText) {
      document.documentElement.style.fontWeight = '700';
    } else {
      document.documentElement.style.fontWeight = 'normal';
    }
  }, [a11ySettings]);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookieLanguage', language);
    setAccepted(true);
    setIsOpen(false);
  };

  const handleReject = () => {
    setIsOpen(false);
  };

  // Show accessibility panel
  if (showAccessibility) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-end justify-end p-4 pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-4 border-2 border-purple-500/60 shadow-2xl w-80 pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-purple-400" />
                נגישות
              </h3>
              <button
                onClick={() => setShowAccessibility(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-3">
              {/* Text Size */}
              <div>
                <label className="text-white font-bold text-xs mb-1.5 block">
                  <Type className="w-3 h-3 inline mr-1 text-purple-400" />
                  גודל טקסט
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[0.8, 1, 1.2, 1.4].map((size) => (
                    <button
                      key={size}
                      onClick={() => setA11ySettings({ ...a11ySettings, textSize: size })}
                      className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                        a11ySettings.textSize === size
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                    >
                      {Math.round(size * 100)}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Contrast */}
              <div>
                <label className="text-white font-bold text-xs mb-1.5 block">
                  <Contrast className="w-3 h-3 inline mr-1 text-purple-400" />
                  ניגודיות
                </label>
                <div className="flex gap-1">
                  {[
                    { value: 'normal', label: 'רגיל' },
                    { value: 'high', label: 'גבוה' }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setA11ySettings({ ...a11ySettings, contrast: opt.value })}
                      className={`flex-1 px-2 py-1 rounded text-xs font-bold transition-all ${
                        a11ySettings.contrast === opt.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dyslexia */}
              <button
                onClick={() => setA11ySettings({ ...a11ySettings, dyslexia: !a11ySettings.dyslexia })}
                className={`w-full px-2 py-1.5 rounded text-xs font-bold transition-all flex items-center justify-between ${
                  a11ySettings.dyslexia
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                <span>דיסלקסיה</span>
                <span>{a11ySettings.dyslexia ? '✓' : ''}</span>
              </button>

              {/* Bold Text */}
              <button
                onClick={() => setA11ySettings({ ...a11ySettings, boldText: !a11ySettings.boldText })}
                className={`w-full px-2 py-1.5 rounded text-xs font-bold transition-all flex items-center justify-between ${
                  a11ySettings.boldText
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                <span>טקסט מודגש</span>
                <span>{a11ySettings.boldText ? '✓' : ''}</span>
              </button>

              {/* Reset */}
              <button
                onClick={() => setA11ySettings({ textSize: 1, contrast: 'normal', dyslexia: false, boldText: false })}
                className="w-full px-2 py-1 rounded text-xs font-bold bg-red-600/30 text-white hover:bg-red-600/50 transition-all"
              >
                איפוס
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

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
                {/* Accessibility + Close Buttons */}
                <div className="absolute top-4 right-4 flex gap-2 z-20">
                  <motion.button
                    onClick={() => setShowAccessibility(true)}
                    className="p-2 rounded-full bg-purple-600/50 hover:bg-purple-600/70 transition-all border border-purple-400"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Shield className="w-5 h-5 text-white" />
                  </motion.button>
                  <button
                    onClick={handleReject}
                    className="p-2 rounded-full hover:bg-white/10 transition-all"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

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