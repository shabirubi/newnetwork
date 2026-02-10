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
      className="bg-gradient-to-br from-[#0033AA]/30 via-[#0066FF]/25 to-[#00AAFF]/20 rounded-3xl p-6 border-2 border-[#00DDFF]/50 shadow-2xl shadow-[#00DDFF]/30 overflow-hidden relative"
    >
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage: "linear-gradient(135deg, #00DDFF, #0099FF, #00DDFF)",
          backgroundSize: "200% 200%"
        }}
      />

      {/* Content */}
      <div className="relative z-10 space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00DDFF] to-[#0099FF] flex items-center justify-center shadow-lg shadow-[#00DDFF]/50">
            <Cloud className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">השירות המטאורולוגי</h2>
            <p className="text-[#00DDFF] font-semibold text-sm">הרשת החדשה</p>
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
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 221, 255, 0.5)" }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-[#00DDFF]/30 hover:border-[#00DDFF]/60 transition-all cursor-pointer group"
              >
                <div className={`${metric.color} mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-white/70 text-xs font-semibold mb-1">{metric.label}</p>
                <p className="text-white font-bold text-lg">{metric.value}</p>
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
            <div className="flex items-center gap-2 text-[#00DDFF] font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>התראות ועדכונים</span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
              {alerts.map((alert, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-[#00AAFF]/30 hover:bg-white/10 transition-all"
                >
                  <p className="text-white font-semibold text-sm mb-1">{alert.title}</p>
                  <p className="text-white/70 text-xs line-clamp-2">{alert.description}</p>
                  <a 
                    href={alert.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#00DDFF] text-xs hover:underline mt-2 inline-block"
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
              className="w-8 h-8 border-3 border-[#00DDFF]/30 border-t-[#00DDFF] rounded-full"
            />
          </div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-4 border-t border-[#00DDFF]/30"
        >
          <p className="text-white/60 text-xs">
            עדכון אחרון: {new Date().toLocaleTimeString('he-IL')} • נתונים מ-<a href="https://ims.gov.il" target="_blank" rel="noopener noreferrer" className="text-[#00DDFF] hover:underline">IMS</a>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}