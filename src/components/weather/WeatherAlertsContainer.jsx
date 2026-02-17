import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cloud, Wind, Droplets, Eye, AlertTriangle, Thermometer, CloudRain, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function WeatherAlertsContainer() {
  const mockWeatherData = {
    temp: 22,
    condition: "בעיקר מעונן",
    humidity: 65,
    windSpeed: 12,
    visibility: 10,
    pressure: 1013,
    feelsLike: 20
  };

  const mockAlerts = [
    { id: 1, type: 'wind', severity: 'medium', message: 'אזהרה: רוחות חזקות בחזוי לערב' },
    { id: 2, type: 'rain', severity: 'low', message: 'סיכוי גשם קל בימים הקרובים' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 w-full"
    >
      {/* Main Weather Card */}
      <div className="bg-gradient-to-br from-[#0080FF]/30 via-blue-900/20 to-black/60 rounded-3xl p-4 sm:p-6 border-2 border-[#0080FF]/40 shadow-2xl overflow-hidden">
        
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#0080FF] rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#0080FF]/30 border-2 border-[#0080FF] flex items-center justify-center">
                <Cloud className="w-6 h-6 text-[#0080FF]" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">תנאי מזג האוויר</h3>
                <p className="text-gray-300 text-sm">עדכון כל שעה</p>
              </div>
            </div>
          </div>

          {/* Main Temperature Section */}
          <div className="bg-gradient-to-r from-black/40 to-black/20 rounded-2xl p-4 sm:p-6 mb-6 border border-[#0080FF]/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-5xl sm:text-6xl font-bold text-white mb-2">
                  {mockWeatherData.temp}°C
                </div>
                <p className="text-gray-300 text-base sm:text-lg">{mockWeatherData.condition}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm mb-2">הרגשה כמו</p>
                <p className="text-3xl font-bold text-[#0080FF]">{mockWeatherData.feelsLike}°</p>
              </div>
            </div>
          </div>

          {/* Weather Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {[
              { icon: Droplets, label: 'לחות', value: `${mockWeatherData.humidity}%`, color: 'from-blue-500 to-blue-600' },
              { icon: Wind, label: 'רוח', value: `${mockWeatherData.windSpeed} קמ"ש`, color: 'from-cyan-500 to-cyan-600' },
              { icon: Eye, label: 'ראות', value: `${mockWeatherData.visibility} ק"מ`, color: 'from-purple-500 to-purple-600' },
              { icon: Thermometer, label: 'לחץ', value: `${mockWeatherData.pressure} mb`, color: 'from-orange-500 to-orange-600' },
              { icon: CloudRain, label: 'גשם', value: '15%', color: 'from-indigo-500 to-indigo-600' },
              { icon: MapPin, label: 'מיקום', value: 'תל אביב', color: 'from-green-500 to-green-600' }
            ].map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-gradient-to-br ${metric.color} rounded-xl p-3 sm:p-4 border border-white/10 hover:border-white/30 transition-all group cursor-pointer`}
                >
                  <Icon className="w-5 h-5 text-white mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-white/70 text-[10px] sm:text-xs font-semibold mb-1">{metric.label}</p>
                  <p className="text-white font-bold text-sm sm:text-base">{metric.value}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Alerts Section */}
          {mockAlerts.length > 0 && (
            <div className="bg-black/40 rounded-2xl p-3 sm:p-4 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                <h4 className="text-white font-bold text-sm sm:text-base">אזהרות</h4>
              </div>
              <div className="space-y-2">
                {mockAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-2 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-100 text-xs sm:text-sm">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-xs">עדכון אחרון: {new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}