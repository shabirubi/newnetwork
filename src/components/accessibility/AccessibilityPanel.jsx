import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Type, Contrast } from "lucide-react";
import useAccessibility from "../../hooks/useAccessibility";

export default function AccessibilityPanel({ isOpen, onClose }) {
  const { settings, setSettings } = useAccessibility();



  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[140]"
          />
          
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl z-[150] max-w-md mx-auto sm:max-w-none sm:right-6 sm:bottom-6 sm:rounded-2xl sm:top-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-t-2xl flex items-center justify-between sm:rounded-t-lg">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
                <h2 className="text-lg font-bold">אפשרויות נגישות</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Text Size */}
              <div>
                <label className="flex items-center gap-2 text-gray-900 dark:text-white font-bold mb-3">
                  <Type className="w-5 h-5 text-purple-600" />
                  גודל טקסט
                </label>
                <div className="flex gap-2">
                  {[0.8, 1, 1.2, 1.4].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSettings({ ...settings, textSize: size })}
                      className={`px-4 py-2 rounded-lg font-bold transition-all ${
                        settings.textSize === size
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300'
                      }`}
                      style={{ fontSize: (14 * size) + 'px' }}
                    >
                      {Math.round(size * 100)}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Contrast */}
              <div>
                <label className="flex items-center gap-2 text-gray-900 dark:text-white font-bold mb-3">
                  <Contrast className="w-5 h-5 text-purple-600" />
                  ניגודיות
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'normal', label: 'רגיל' },
                    { value: 'high', label: 'גבוה' }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSettings({ ...settings, contrast: opt.value })}
                      className={`w-full px-4 py-3 rounded-lg font-bold transition-all text-right ${
                        settings.contrast === opt.value
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dyslexia Font */}
              <div>
                <button
                  onClick={() => setSettings({ ...settings, dyslexia: !settings.dyslexia })}
                  className={`w-full px-4 py-3 rounded-lg font-bold transition-all text-right flex items-center justify-between ${
                    settings.dyslexia
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300'
                  }`}
                >
                  <span>דיסלקסיה</span>
                  <span className="text-xl">{settings.dyslexia ? '✓' : ''}</span>
                </button>
              </div>

              {/* Bold Text */}
              <div>
                <button
                  onClick={() => setSettings({ ...settings, boldText: !settings.boldText })}
                  className={`w-full px-4 py-3 rounded-lg font-bold transition-all text-right flex items-center justify-between ${
                    settings.boldText
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300'
                  }`}
                >
                  <span>טקסט מודגש</span>
                  <span className="text-xl">{settings.boldText ? '✓' : ''}</span>
                </button>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => setSettings({ textSize: 1, contrast: 'normal', colorMode: 'auto', dyslexia: false, boldText: false })}
                className="w-full px-4 py-3 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white font-bold hover:bg-gray-400 transition-all"
              >
                איפוס הגדרות
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}