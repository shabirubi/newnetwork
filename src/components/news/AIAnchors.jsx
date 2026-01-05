import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio } from "lucide-react";

const anchors = {
  male: {
    name: "דוד כהן",
    role: "עיתונאי פלילי",
    specialty: "פשיעה, משטרה וצדק",
    color: "#4A90E2"
  },
  female: {
    name: "שירה לוי",
    role: "כתבת פוליטית",
    specialty: "פוליטיקה ומדיניות",
    color: "#E31E24"
  }
};

// 3D-Style Animated Avatar Component
function AnimatedAvatar({ gender, isSpeaking, color }) {
  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 200 280" className="w-full h-full">
        {/* Body/Shoulders */}
        <motion.path
          d="M 40 250 Q 40 200, 100 200 Q 160 200, 160 250 L 140 280 L 60 280 Z"
          fill={gender === "male" ? "#2C3E50" : "#8B4789"}
          animate={isSpeaking ? {
            d: [
              "M 40 250 Q 40 200, 100 200 Q 160 200, 160 250 L 140 280 L 60 280 Z",
              "M 40 252 Q 40 202, 100 202 Q 160 202, 160 252 L 140 280 L 60 280 Z",
              "M 40 250 Q 40 200, 100 200 Q 160 200, 160 250 L 140 280 L 60 280 Z"
            ]
          } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
        
        {/* Neck */}
        <rect x="85" y="180" width="30" height="25" fill="#FDBCB4" rx="5" />
        
        {/* Head */}
        <motion.ellipse
          cx="100"
          cy="120"
          rx="50"
          ry="60"
          fill="#FDBCB4"
          animate={isSpeaking ? {
            ry: [60, 62, 60]
          } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
        
        {/* Hair */}
        <motion.path
          d={gender === "male" 
            ? "M 50 100 Q 50 50, 100 50 Q 150 50, 150 100 L 150 110 Q 150 70, 100 70 Q 50 70, 50 110 Z"
            : "M 45 95 Q 45 40, 100 40 Q 155 40, 155 95 Q 155 130, 140 140 L 60 140 Q 45 130, 45 95 Z"
          }
          fill={gender === "male" ? "#2C3E50" : "#5D3A3A"}
          animate={isSpeaking ? {
            d: gender === "male"
              ? [
                  "M 50 100 Q 50 50, 100 50 Q 150 50, 150 100 L 150 110 Q 150 70, 100 70 Q 50 70, 50 110 Z",
                  "M 51 101 Q 51 51, 100 51 Q 149 51, 149 101 L 149 110 Q 149 70, 100 70 Q 51 70, 51 110 Z",
                  "M 50 100 Q 50 50, 100 50 Q 150 50, 150 100 L 150 110 Q 150 70, 100 70 Q 50 70, 50 110 Z"
                ]
              : [
                  "M 45 95 Q 45 40, 100 40 Q 155 40, 155 95 Q 155 130, 140 140 L 60 140 Q 45 130, 45 95 Z",
                  "M 46 96 Q 46 41, 100 41 Q 154 41, 154 96 Q 154 130, 140 140 L 60 140 Q 46 130, 46 96 Z",
                  "M 45 95 Q 45 40, 100 40 Q 155 40, 155 95 Q 155 130, 140 140 L 60 140 Q 45 130, 45 95 Z"
                ]
          } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
        
        {/* Eyes */}
        <motion.ellipse
          cx="80"
          cy="110"
          rx="8"
          ry="10"
          fill="#2C3E50"
          animate={{
            ry: [10, 2, 10]
          }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />
        <motion.ellipse
          cx="120"
          cy="110"
          rx="8"
          ry="10"
          fill="#2C3E50"
          animate={{
            ry: [10, 2, 10]
          }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />
        
        {/* Eye highlights */}
        <circle cx="82" cy="108" r="3" fill="white" opacity="0.8" />
        <circle cx="122" cy="108" r="3" fill="white" opacity="0.8" />
        
        {/* Nose */}
        <path
          d="M 100 120 L 95 135 L 100 137 L 105 135 Z"
          fill="#E8A598"
        />
        
        {/* Mouth - Animated when speaking */}
        <motion.path
          d="M 85 150 Q 100 155, 115 150"
          stroke="#C97777"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          animate={isSpeaking ? {
            d: [
              "M 85 150 Q 100 155, 115 150",
              "M 85 152 Q 100 160, 115 152",
              "M 85 151 Q 100 157, 115 151",
              "M 85 150 Q 100 155, 115 150"
            ]
          } : {}}
          transition={{ duration: 0.4, repeat: Infinity }}
        />
        
        {/* Microphone */}
        <motion.g
          animate={{
            y: [0, -2, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <rect x="110" y="200" width="15" height="30" fill="#34495E" rx="7" />
          <circle cx="117.5" cy="197" r="8" fill="#95A5A6" />
          <line x1="117.5" y1="230" x2="117.5" y2="245" stroke="#34495E" strokeWidth="2" />
          <ellipse cx="117.5" cy="245" rx="10" ry="3" fill="#34495E" />
        </motion.g>
        
        {/* AI Badge */}
        <motion.g
          animate={{
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <rect x="35" y="50" width="30" height="15" rx="7" fill={color} />
          <text x="50" y="61" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">AI</text>
        </motion.g>
      </svg>
      
      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1">
          <motion.div
            className="w-1.5 h-3 rounded-full"
            style={{ backgroundColor: color }}
            animate={{ height: ["12px", "20px", "12px"] }}
            transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="w-1.5 h-3 rounded-full"
            style={{ backgroundColor: color }}
            animate={{ height: ["12px", "20px", "12px"] }}
            transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
          />
          <motion.div
            className="w-1.5 h-3 rounded-full"
            style={{ backgroundColor: color }}
            animate={{ height: ["12px", "20px", "12px"] }}
            transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
        </div>
      )}
    </div>
  );
}

export default function AIAnchors({ currentSpeaker = "female", isSpeaking = true }) {
  const [activeAnchor, setActiveAnchor] = useState(currentSpeaker);

  useEffect(() => {
    setActiveAnchor(currentSpeaker);
    
    // Alternate speakers every 10 seconds
    const interval = setInterval(() => {
      setActiveAnchor(prev => prev === "male" ? "female" : "male");
    }, 10000);
    
    return () => clearInterval(interval);
  }, [currentSpeaker]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Animated Background - News Intro Style */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        {/* Animated Grid */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(227, 30, 36, 0.3) 25%, rgba(227, 30, 36, 0.3) 26%, transparent 27%, transparent 74%, rgba(227, 30, 36, 0.3) 75%, rgba(227, 30, 36, 0.3) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(227, 30, 36, 0.3) 25%, rgba(227, 30, 36, 0.3) 26%, transparent 27%, transparent 74%, rgba(227, 30, 36, 0.3) 75%, rgba(227, 30, 36, 0.3) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '50px 50px'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Animated Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#E31E24] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
        
        {/* Rotating Globe/Circle in background */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border-4 border-[#E31E24] opacity-10"
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#E31E24]" />
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-[#E31E24]" />
        </motion.div>
        
        {/* Breaking News Lines */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E31E24] to-transparent"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Logo Watermark */}
      <div className="absolute top-6 right-6 z-10">
        <motion.div
          className="flex items-center gap-2 bg-[#E31E24]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#E31E24]/30"
          animate={{
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        >
          <Radio className="w-5 h-5 text-[#E31E24]" />
          <span className="text-white font-bold text-sm">שידור חי</span>
        </motion.div>
      </div>

      {/* Studio Desk */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1a1a1a] to-transparent z-10">
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-r from-[#2a2a2a] via-[#1a1a1a] to-[#2a2a2a] opacity-80">
          {/* Desk highlights */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E31E24] to-transparent opacity-50" />
        </div>
      </div>

      {/* Anchors Container - Side by Side */}
      <div className="absolute inset-0 flex items-center justify-center gap-8 px-8">
        {/* Female Anchor (Right) */}
        <motion.div
          className="relative flex flex-col items-center"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative">
            {/* Glow effect when speaking */}
            {activeAnchor === "female" && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(227, 30, 36, 0.5)',
                    '0 0 40px rgba(227, 30, 36, 0.8)',
                    '0 0 20px rgba(227, 30, 36, 0.5)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            
            <div className="w-48 h-64 md:w-56 md:h-72">
              <AnimatedAvatar 
                gender="female" 
                isSpeaking={activeAnchor === "female" && isSpeaking}
                color={anchors.female.color}
              />
            </div>
          </div>
          
          {/* Name Tag */}
          <motion.div
            className="mt-4 text-center bg-gradient-to-r from-[#E31E24] to-[#B91C1C] px-6 py-3 rounded-full"
            animate={{
              scale: activeAnchor === "female" ? [1, 1.05, 1] : 1
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-white font-bold text-lg">{anchors.female.name}</p>
            <p className="text-white/80 text-xs">{anchors.female.role}</p>
          </motion.div>
        </motion.div>

        {/* Male Anchor (Left) */}
        <motion.div
          className="relative flex flex-col items-center"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative">
            {/* Glow effect when speaking */}
            {activeAnchor === "male" && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(74, 144, 226, 0.5)',
                    '0 0 40px rgba(74, 144, 226, 0.8)',
                    '0 0 20px rgba(74, 144, 226, 0.5)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            
            <div className="w-48 h-64 md:w-56 md:h-72">
              <AnimatedAvatar 
                gender="male" 
                isSpeaking={activeAnchor === "male" && isSpeaking}
                color={anchors.male.color}
              />
            </div>
          </div>
          
          {/* Name Tag */}
          <motion.div
            className="mt-4 text-center bg-gradient-to-r from-[#4A90E2] to-[#357ABD] px-6 py-3 rounded-full"
            animate={{
              scale: activeAnchor === "male" ? [1, 1.05, 1] : 1
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-white font-bold text-lg">{anchors.male.name}</p>
            <p className="text-white/80 text-xs">{anchors.male.role}</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Lower Third - News Ticker */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-r from-[#E31E24] to-[#B91C1C] py-3 overflow-hidden">
        <div className="flex items-center">
          <div className="bg-white text-[#E31E24] px-4 py-1 font-bold text-sm shrink-0 ml-4">
            עכשיו בשידור
          </div>
          <motion.div
            className="flex whitespace-nowrap text-white text-sm font-medium"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            <span className="mx-8">• שידור חי עם קריינות AI מתקדמת</span>
            <span className="mx-8">• {anchors.female.name} - {anchors.female.specialty}</span>
            <span className="mx-8">• {anchors.male.name} - {anchors.male.specialty}</span>
            <span className="mx-8">• טכנולוגיה חדשנית של הרשת החדשה</span>
            <span className="mx-8">• שידור חי עם קריינות AI מתקדמת</span>
            <span className="mx-8">• {anchors.female.name} - {anchors.female.specialty}</span>
          </motion.div>
        </div>
      </div>

      {/* Center Logo/Title Overlay */}
      <motion.div
        className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 2, opacity: 1 }}
        animate={{ scale: 0, opacity: 0 }}
        transition={{ duration: 2, delay: 0.5 }}
      >
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-2">הרשת החדשה</h1>
          <p className="text-xl text-[#E31E24] font-semibold">חדשות בזמן אמת</p>
        </div>
      </motion.div>
    </div>
  );
}