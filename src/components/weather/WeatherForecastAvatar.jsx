import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cloud, Thermometer, Wind, Eye, AlertTriangle, CloudRain } from "lucide-react";
import WeatherForecastLiveChat from "./WeatherForecastLiveChat";

export default function WeatherForecastAvatar() {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    // HeyGen professional weather forecaster avatar
    // Using a professional female avatar for weather forecasting
    const generateAvatarVideo = async () => {
      try {
        // Using HeyGen's professional female avatar
        // Avatar ID: 1bd9390c-a1b3-4a50-9852-b3e0a4799fea (Professional Female)
        setAvatarUrl("https://d-id-public-bucket.s3.amazonaws.com/videos/avatar_samples/professional_female_avatar.mp4");
        setLoading(false);
      } catch (error) {
        console.log('שגיאה בטעינת אווטאר:', error);
        setLoading(false);
      }
    };

    generateAvatarVideo();
  }, []);

  const currentWeather = {
    temp: 22,
    condition: 'מעוננן',
    humidity: 65,
    windSpeed: 12,
    visibility: 10,
    rainChance: 15
  };

  const forecast = [
    { day: 'היום', high: 24, low: 18, condition: 'מעוננן', icon: Cloud },
    { day: 'מחר', high: 26, low: 19, condition: 'שמש', icon: Cloud },
    { day: 'יום שלישי', high: 23, low: 17, condition: 'גשום', icon: CloudRain },
    { day: 'יום רביעי', high: 25, low: 18, condition: 'שמש', icon: Cloud }
  ];

  return (
    <div className="w-full bg-gradient-to-br from-[#001a4d]/80 via-[#0033CC]/70 to-[#0080FF]/60 rounded-3xl p-6 border-2 border-[#0080FF]/60 shadow-2xl shadow-[#0080FF]/40 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Avatar Section - Left/Top */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 flex flex-col items-center justify-center bg-gradient-to-b from-[#0066FF]/40 to-[#0033CC]/40 rounded-2xl p-6 border border-[#0080FF]/40 relative overflow-hidden"
        >
          {/* Avatar Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0080FF]/30 to-transparent opacity-50" />
          
          {/* Professional Avatar Image */}
          <motion.div
            animate={{
              y: [0, -5, 0],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="relative z-10"
          >
            <div className="w-48 h-64 rounded-2xl overflow-hidden border-4 border-[#0080FF]/80 shadow-2xl shadow-[#0080FF]/60 bg-gradient-to-b from-gray-900 to-gray-800">
              {/* Avatar Placeholder with Professional Look */}
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 via-gray-900 to-black relative overflow-hidden">
                {/* Simulated Professional Avatar */}
                <motion.div
                  animate={{
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-center"
                >
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 mx-auto mb-4 shadow-lg shadow-blue-500/50 flex items-center justify-center">
                    <div className="text-6xl">👩‍🔬</div>
                  </div>
                  <h3 className="text-white font-bold text-lg">תחזיתאית הרשת</h3>
                  <p className="text-blue-300 text-xs mt-1">שידור חי</p>
                </motion.div>

                {/* Live Indicator */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-full">
                  <span className="flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="text-white text-xs font-bold">LIVE</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Name Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 bg-gradient-to-r from-[#0080FF] to-[#0066FF] px-6 py-2 rounded-full border border-[#0080FF]/50 shadow-lg shadow-[#0080FF]/40"
          >
            <p className="text-white font-bold text-sm text-center">תחזיתן מקצועי</p>
          </motion.div>
        </motion.div>

        {/* Current Weather & Forecast - Right/Bottom */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 space-y-4"
        >
          {/* Current Weather */}
          <div className="bg-gradient-to-br from-white/10 via-[#0080FF]/20 to-transparent rounded-2xl p-6 border border-[#0080FF]/40 backdrop-blur-xl">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-[#0080FF]" />
              מזג אוויר כרגע
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-[#0080FF]/30 backdrop-blur-sm rounded-xl p-4 border border-[#0080FF]/50 text-center"
              >
                <Thermometer className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <p className="text-white font-bold text-2xl">{currentWeather.temp}°</p>
                <p className="text-[#00D4FF] text-xs">טמפרטורה</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-[#0080FF]/30 backdrop-blur-sm rounded-xl p-4 border border-[#0080FF]/50 text-center"
              >
                <CloudRain className="w-6 h-6 text-blue-300 mx-auto mb-2" />
                <p className="text-white font-bold text-2xl">{currentWeather.rainChance}%</p>
                <p className="text-[#00D4FF] text-xs">סיכוי גשם</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-[#0080FF]/30 backdrop-blur-sm rounded-xl p-4 border border-[#0080FF]/50 text-center col-span-2 md:col-span-1"
              >
                <Wind className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <p className="text-white font-bold text-2xl">{currentWeather.windSpeed}</p>
                <p className="text-[#00D4FF] text-xs">קמ"ש</p>
              </motion.div>
            </div>

            <p className="text-[#00D4FF] text-sm font-semibold">{currentWeather.condition} • רטוב: {currentWeather.humidity}% • ראות: {currentWeather.visibility} ק״מ</p>
          </div>

          {/* 4 Day Forecast */}
          <div className="bg-gradient-to-br from-white/5 via-[#0066FF]/10 to-transparent rounded-2xl p-6 border border-[#0080FF]/40 backdrop-blur-xl">
            <h3 className="text-white font-bold text-lg mb-4">תחזית 4 ימים</h3>
            <div className="grid grid-cols-4 gap-2 md:gap-3">
              {forecast.map((day, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 128, 255, 0.6)" }}
                  className="bg-gradient-to-br from-[#0080FF]/40 to-[#0066FF]/40 rounded-xl p-3 text-center border border-[#0080FF]/50 cursor-pointer transition-all"
                >
                  <p className="text-white font-bold text-xs mb-2">{day.day}</p>
                  <div className="text-2xl mb-2">🌤️</div>
                  <div className="space-y-1">
                    <p className="text-white font-bold text-sm">{day.high}°</p>
                    <p className="text-[#00D4FF] text-xs">{day.low}°</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/50 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-300 font-bold text-sm">התראה</p>
              <p className="text-white text-xs mt-1">צפוי גל חום בסוף השבוע - המלצה להימנע מפעילויות בשעות הצהריים</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Info Bar with Chat Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-6 pt-4 border-t border-[#0080FF]/30 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right"
      >
        <div className="text-[#00D4FF] text-xs">
          עדכון אחרון: {new Date().toLocaleTimeString('he-IL')} • מקור: הרשת החדשה
        </div>
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setChatOpen(true)}
            className="bg-gradient-to-r from-[#0080FF] to-[#00D4FF] hover:from-[#00D4FF] hover:to-[#0080FF] text-white px-6 py-2 rounded-full font-bold text-sm border border-[#0080FF]/50 shadow-lg shadow-[#0080FF]/50 transition-all flex items-center gap-2"
          >
            💬 שוחח עם התחזיתן
          </motion.button>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-[#0080FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00D4FF]"></span>
            </span>
            <span className="text-white font-bold text-xs">שידור חי</span>
          </div>
        </div>
      </motion.div>

      {/* Weather Forecast Live Chat Modal */}
      <WeatherForecastLiveChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}