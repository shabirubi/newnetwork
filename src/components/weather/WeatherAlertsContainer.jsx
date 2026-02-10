import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cloud, Droplets, Wind, Eye, Gauge, AlertTriangle, Thermometer, CloudRain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function WeatherAlertsContainer() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: weatherData = null } = useQuery({
    queryKey: ['weather-alerts'],
    queryFn: async () => {
      try {
        setLoading(true);
        // Fetch from IMS RSS
        const response = await fetch('https://ims.gov.il/he/RSS_ForecastAlerts');
        const xml = await response.text();
        
        // Parse XML (basic parsing)
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        
        const parsedAlerts = Array.from(items).slice(0, 5).map(item => ({
          title: item.querySelector('title')?.textContent || '',
          description: item.querySelector('description')?.textContent || '',
          pubDate: item.querySelector('pubDate')?.textContent || '',
          link: item.querySelector('link')?.textContent || ''
        }));
        
        setAlerts(parsedAlerts);
        setLoading(false);
        return parsedAlerts;
      } catch (error) {
        console.log('שגיאה בטעינת נתוני מזג אוויר:', error);
        setLoading(false);
        return null;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
  });

  const mockWeatherMetrics = [
    { icon: Thermometer, label: "טמפרטורה", value: "22°C", color: "text-orange-400" },
    { icon: Droplets, label: "לחות", value: "65%", color: "text-blue-400" },
    { icon: Wind, label: "רוח", value: "12 קמ\"ש", color: "text-cyan-400" },
    { icon: Eye, label: "ראות", value: "10 ק\"מ", color: "text-purple-400" },
    { icon: Gauge, label: "לחץ אוויר", value: "1013 mb", color: "text-green-400" },
    { icon: CloudRain, label: "סיכוי גשם", value: "15%", color: "text-blue-300" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#001F66]/80 via-[#003DA8]/70 to-[#0055CC]/60 rounded-2xl p-4 border border-[#0066FF]/50 shadow-lg shadow-[#0066FF]/20 overflow-hidden relative"
    >
      {/* Animated Background */}
      <motion.div
      className="absolute inset-0 opacity-15"
      animate={{
        backgroundPosition: ["0% 0%", "100% 100%"]
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      style={{
        backgroundImage: "linear-gradient(135deg, #0066FF, #003DA8, #0066FF)",
        backgroundSize: "200% 200%"
      }}
      />

      {/* Content */}
      <div className="relative z-10 space-y-4">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 mb-3"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066FF] to-[#003DA8] flex items-center justify-center shadow-md shadow-[#0066FF]/40">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">השירות המטאורולוגי</h2>
            <p className="text-[#0099FF] font-semibold text-xs">הרשת החדשה</p>
          </div>
        </motion.div>

        {/* Weather Metrics Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {mockWeatherMetrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0, 102, 255, 0.4)" }}
                className="bg-white/5 backdrop-blur-lg rounded-lg p-3 border border-[#0066FF]/30 hover:border-[#0066FF]/60 transition-all cursor-pointer group"
              >
                <div className={`${metric.color} mb-1.5 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-white/70 text-[10px] font-semibold mb-0.5">{metric.label}</p>
                <p className="text-white font-bold text-sm">{metric.value}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-[#0099FF] font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>התראות ועדכונים</span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
              {alerts.map((alert, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-[#0066FF]/30 hover:bg-white/10 transition-all"
                >
                  <p className="text-white font-semibold text-xs mb-0.5">{alert.title}</p>
                  <p className="text-white/70 text-[10px] line-clamp-2">{alert.description}</p>
                  <a 
                    href={alert.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#0099FF] text-[10px] hover:underline mt-1 inline-block"
                  >
                    קרא עוד →
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full"
            />
          </div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-2 border-t border-[#0066FF]/30"
        >
          <p className="text-white/50 text-[10px]">
            עדכון: {new Date().toLocaleTimeString('he-IL')} • <a href="https://ims.gov.il" target="_blank" rel="noopener noreferrer" className="text-[#0099FF] hover:underline">IMS</a>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}