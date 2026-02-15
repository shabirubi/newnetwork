import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Construction, Clock, Calendar, Sparkles } from "lucide-react";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

export default function UnderConstruction() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date('2026-03-07T00:00:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#001a40] to-black flex items-center justify-center p-4 overflow-hidden relative" dir="rtl">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            backgroundImage: "radial-gradient(circle at 50% 50%, #0080FF 1px, transparent 1px)",
            backgroundSize: "50px 50px"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <img 
            src={LOGO_URL} 
            alt="הרשת החדשה" 
            className="h-32 w-auto drop-shadow-2xl"
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#0080FF]/20 to-[#E31E24]/20 border-2 border-[#0080FF]/50 rounded-full px-6 py-3 backdrop-blur-xl">
            <Construction className="w-6 h-6 text-[#0080FF]" />
            <span className="text-white font-bold text-lg">האתר בבניה</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
            הרשת החדשה
          </h1>
          
          <p className="text-xl md:text-3xl text-[#0080FF] font-bold">
            בקרוב אצלכם!
          </p>
        </motion.div>

        {/* Launch Date */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-gradient-to-br from-[#0080FF]/20 to-[#E31E24]/20 border-2 border-[#0080FF]/50 rounded-3xl p-8 backdrop-blur-xl"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-[#0080FF]" />
            <h2 className="text-2xl font-bold text-white">תאריך פתיחה</h2>
          </div>
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0080FF] to-[#E31E24]">
            7 במרץ 2026
          </div>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { value: timeLeft.days, label: 'ימים' },
            { value: timeLeft.hours, label: 'שעות' },
            { value: timeLeft.minutes, label: 'דקות' },
            { value: timeLeft.seconds, label: 'שניות' }
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 + idx * 0.1 }}
              className="bg-gradient-to-br from-[#0080FF]/30 to-[#E31E24]/30 border-2 border-[#0080FF]/50 rounded-2xl p-6 backdrop-blur-xl"
            >
              <div className="text-5xl font-black text-white mb-2">
                {String(item.value).padStart(2, '0')}
              </div>
              <div className="text-[#0080FF] font-bold text-sm">
                {item.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0080FF]" />
            <p className="text-white text-lg max-w-2xl">
              ערוץ חדשות דיגיטלי מבוסס AI עם בקרה אנושית
            </p>
            <Sparkles className="w-5 h-5 text-[#0080FF]" />
          </div>
          
          <p className="text-gray-400 text-base max-w-2xl mx-auto">
            אנחנו עובדים קשה כדי להביא לכם את חווית החדשות המתקדמת ביותר. 
            מערכת חדשנית המשלבת טכנולוגיית AI עם עריכה מקצועית לתוכן איכותי ומהיר.
          </p>
        </motion.div>

        {/* Animated Line */}
        <motion.div
          className="h-1 bg-gradient-to-r from-transparent via-[#0080FF] to-transparent rounded-full"
          animate={{
            opacity: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Floating Animation */}
      <motion.div
        className="absolute top-20 right-20 w-32 h-32 bg-[#0080FF]/10 rounded-full blur-3xl"
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-40 h-40 bg-[#E31E24]/10 rounded-full blur-3xl"
        animate={{
          y: [0, 30, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}