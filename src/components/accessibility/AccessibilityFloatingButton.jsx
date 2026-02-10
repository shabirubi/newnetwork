import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Palette, Accessibility } from "lucide-react";
import AccessibilityPanel from "./AccessibilityPanel";

export default function AccessibilityFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [themeColor, setThemeColor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('themeColor') || '#0080FF';
    }
    return '#0080FF';
  });

  const colors = [
    { color: '#0080FF', name: 'כחול' }, 
    { color: '#00D4FF', name: 'ציאן' }, 
    { color: '#00FF88', name: 'ירוק' }, 
    { color: '#FFD700', name: 'זהב' }, 
    { color: '#FF6B35', name: 'כתום' }, 
    { color: '#E31E24', name: 'אדום' }, 
    { color: '#9D4EDD', name: 'סגול' }, 
    { color: '#FF1493', name: 'ורוד' },
    { color: '#00CED1', name: 'טורקיז' },
    { color: '#32CD32', name: 'ליים' },
  ];

  const handleColorChange = (color) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', color);
    root.style.setProperty('--accent', color);
    localStorage.setItem('themeColor', color);
    setThemeColor(color);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed right-6 bottom-32 sm:bottom-24 lg:bottom-32 z-[130] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center border-3 transition-all"
        style={{
          backgroundColor: themeColor,
          borderColor: 'white',
          boxShadow: `0 0 30px ${themeColor}80`
        }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          scale: [1, 1.08, 1],
          boxShadow: [
            `0 0 20px ${themeColor}60`,
            `0 0 40px ${themeColor}a0`,
            `0 0 20px ${themeColor}60`
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Accessibility className="w-9 h-9 text-white drop-shadow-xl" />
      </motion.button>

      {/* Accessibility Panel Modal */}
      <AccessibilityPanel 
        isOpen={isOpen} 
        onClose={() => {
          setIsOpen(false);
          setShowColorPicker(false);
        }} 
      />

      {/* Color Picker Modal */}
      <AnimatePresence>
        {isOpen && showColorPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[145]"
            onClick={() => setShowColorPicker(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && showColorPicker && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 z-[155] bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl p-6 border-2 shadow-2xl max-w-sm w-80"
            style={{ borderColor: themeColor }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5" style={{ color: themeColor }} />
                <h3 className="font-bold text-white">בחר צבע</h3>
              </div>
              <button
                onClick={() => setShowColorPicker(false)}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Color Grid */}
            <div className="grid grid-cols-5 gap-2">
              {colors.map((item) => (
                <motion.button
                  key={item.color}
                  onClick={() => handleColorChange(item.color)}
                  className="w-full aspect-square rounded-xl border-2 transition-all"
                  style={{
                    backgroundColor: item.color,
                    borderColor: themeColor === item.color ? 'white' : item.color,
                    borderWidth: themeColor === item.color ? '3px' : '2px'
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title={item.name}
                >
                  {themeColor === item.color && (
                    <span className="text-white font-bold">✓</span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Color Input */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <label className="text-white text-sm font-bold mb-2 block">צבע מותאם:</label>
              <input
                type="color"
                value={themeColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color Picker Button - Inside Accessibility Panel */}
      {isOpen && !showColorPicker && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-24 right-6 z-[155] w-14 h-14 rounded-full shadow-xl flex items-center justify-center border-2 border-white transition-all"
          style={{
            backgroundColor: themeColor,
            boxShadow: `0 0 20px ${themeColor}80`
          }}
          onClick={() => setShowColorPicker(true)}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
        >
          <Palette className="w-6 h-6 text-white drop-shadow-lg" />
        </motion.button>
      )}
    </>
  );
}