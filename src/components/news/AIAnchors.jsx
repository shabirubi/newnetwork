import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

const anchors = {
  male: {
    name: "דוד כהן",
    role: "עיתונאי פלילי",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=faces",
    specialty: "פשיעה, משטרה וצדק"
  },
  female: {
    name: "שירה לוי",
    role: "כתבת פוליטית",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces",
    specialty: "פוליטיקה ומדיניות"
  }
};

export default function AIAnchors({ currentSpeaker = "female", isSpeaking = true }) {
  const [activeAnchor, setActiveAnchor] = useState(currentSpeaker);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setActiveAnchor(currentSpeaker);
  }, [currentSpeaker]);

  const currentAnchor = anchors[activeAnchor];
  const otherAnchor = anchors[activeAnchor === "male" ? "female" : "male"];

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#1a0000] via-[#2d0a0a] to-[#1a0000]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500 via-transparent to-transparent" />
      </div>

      {/* Main Anchor (Center/Large) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          key={activeAnchor}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Anchor Image */}
          <div className="relative">
            {/* Animated Ring when speaking */}
            {isSpeaking && (
              <>
                <motion.div
                  className="absolute -inset-4 rounded-full border-4 border-[#E31E24]"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 0.3, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute -inset-8 rounded-full border-2 border-[#E31E24]"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.3
                  }}
                />
              </>
            )}

            {/* AI Badge */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10 flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              AI
            </div>

            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-[#E31E24] shadow-2xl">
              <img 
                src={currentAnchor.avatar}
                alt={currentAnchor.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Anchor Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {currentAnchor.name}
            </h3>
            <p className="text-[#E31E24] font-semibold text-lg mb-1">
              {currentAnchor.role}
            </p>
            <p className="text-gray-400 text-sm">
              {currentAnchor.specialty}
            </p>
          </motion.div>

          {/* Speaking Indicator */}
          {isSpeaking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1"
            >
              <motion.div
                className="w-2 h-4 bg-[#E31E24] rounded-full"
                animate={{ height: ["8px", "16px", "8px"] }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="w-2 h-4 bg-[#E31E24] rounded-full"
                animate={{ height: ["8px", "16px", "8px"] }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
              />
              <motion.div
                className="w-2 h-4 bg-[#E31E24] rounded-full"
                animate={{ height: ["8px", "16px", "8px"] }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Secondary Anchor (Small/Corner) */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-8 left-8 hidden md:block"
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-600 shadow-lg opacity-60 hover:opacity-100 transition-opacity">
            <img 
              src={otherAnchor.avatar}
              alt={otherAnchor.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -top-1 -right-1 bg-gray-700 text-white px-2 py-0.5 rounded-full text-xs">
            בהמתנה
          </div>
        </div>
        <p className="text-white text-xs mt-2 text-center">{otherAnchor.name}</p>
      </motion.div>

      {/* News Ticker */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#E31E24] py-2 overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap text-white text-sm"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <span className="mx-8">• משדרים אליכם בשידור חי עם מגישים מבוססי AI</span>
          <span className="mx-8">• טכנולוגיה חדשנית של הרשת החדשה</span>
          <span className="mx-8">• עדכונים בזמן אמת 24/7</span>
          <span className="mx-8">• משדרים אליכם בשידור חי עם מגישים מבוססי AI</span>
          <span className="mx-8">• טכנולוגיה חדשנית של הרשת החדשה</span>
        </motion.div>
      </div>

      {/* Branding */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
          <span className="text-white font-bold text-sm">קריינות AI</span>
        </div>
      </div>
    </div>
  );
}