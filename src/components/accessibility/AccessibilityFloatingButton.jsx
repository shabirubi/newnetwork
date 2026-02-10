import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Accessibility, Type, Contrast } from "lucide-react";

export default function AccessibilityFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    textSize: 1,
    contrast: 'normal',
    dyslexia: false,
    boldText: false
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('a11ySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('a11ySettings', JSON.stringify(settings));

    if (settings.textSize !== 1) {
      document.documentElement.style.fontSize = (16 * settings.textSize) + 'px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }

    if (settings.contrast === 'high') {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (settings.dyslexia) {
      document.documentElement.classList.add('dyslexia-font');
    } else {
      document.documentElement.classList.remove('dyslexia-font');
    }

    if (settings.boldText) {
      document.documentElement.style.fontWeight = '700';
    } else {
      document.documentElement.style.fontWeight = 'normal';
    }
  }, [settings]);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-6 bottom-32 sm:bottom-24 lg:bottom-32 z-[130] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center border-3 bg-purple-600 border-white transition-all"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          scale: [1, 1.08, 1],
          boxShadow: [
            '0 0 20px rgba(147, 78, 221, 0.6)',
            '0 0 40px rgba(147, 78, 221, 0.8)',
            '0 0 20px rgba(147, 78, 221, 0.6)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Accessibility className="w-9 h-9 text-white drop-shadow-xl" />
      </motion.button>

      {/* Accessibility Panel Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-[140]"
            />
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="fixed bottom-32 right-6 z-[150] w-80 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl shadow-2xl border-2 border-purple-500/50"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-t-3xl flex items-center justify-between">
                <h2 className="text-base font-bold">נגישות</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Text Size */}
                <div>
                  <label className="text-white font-bold mb-2 block text-sm">
                    <Type className="w-4 h-4 inline mr-2 text-purple-400" />
                    גודל טקסט
                  </label>
                  <div className="flex gap-2">
                    {[0.8, 1, 1.2, 1.4].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSettings({ ...settings, textSize: size })}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                          settings.textSize === size
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                        style={{ fontSize: (12 * size) + 'px' }}
                      >
                        {Math.round(size * 100)}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contrast */}
                <div>
                  <label className="text-white font-bold mb-2 block text-sm">
                    <Contrast className="w-4 h-4 inline mr-2 text-purple-400" />
                    ניגודיות
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'normal', label: 'רגיל' },
                      { value: 'high', label: 'גבוה' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSettings({ ...settings, contrast: opt.value })}
                        className={`flex-1 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                          settings.contrast === opt.value
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dyslexia Font */}
                <button
                  onClick={() => setSettings({ ...settings, dyslexia: !settings.dyslexia })}
                  className={`w-full px-3 py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-between ${
                    settings.dyslexia
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  <span>דיסלקסיה</span>
                  <span>{settings.dyslexia ? '✓' : ''}</span>
                </button>

                {/* Bold Text */}
                <button
                  onClick={() => setSettings({ ...settings, boldText: !settings.boldText })}
                  className={`w-full px-3 py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-between ${
                    settings.boldText
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  <span>טקסט מודגש</span>
                  <span>{settings.boldText ? '✓' : ''}</span>
                </button>

                {/* Reset Button */}
                <button
                  onClick={() => setSettings({ textSize: 1, contrast: 'normal', dyslexia: false, boldText: false })}
                  className="w-full px-3 py-2 rounded-lg bg-red-600/30 text-white font-bold text-xs hover:bg-red-600/50 transition-all"
                >
                  איפוס
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}