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
        // Use timeout to prevent hanging
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('https://ims.gov.il/he/RSS_ForecastAlerts', {
          signal: controller.signal
        });
        clearTimeout(timeout);
        
        if (!response.ok) throw new Error('Failed to fetch');
        
        const xml = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        
        const parsedAlerts = Array.from(items).slice(0, 3).map(item => ({
          title: item.querySelector('title')?.textContent || '',
          description: item.querySelector('description')?.textContent || '',
          pubDate: item.querySelector('pubDate')?.textContent || '',
          link: item.querySelector('link')?.textContent || ''
        }));
        
        setAlerts(parsedAlerts);
        setLoading(false);
        return parsedAlerts;
      } catch (error) {
        setAlerts([]);
        setLoading(false);
        return null;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 60 * 60 * 1000, // 60 minutes - less frequent
    retry: 1, // reduce retries
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
      className="bg-gradient-to-br from-[#000033]/90 via-[#0080FF]/80 to-[#0080FF]/70 rounded-2xl p-4 border border-[#0080FF]/80 shadow-lg shadow-[#0080FF]/60 overflow-hidden relative"
    >
      {/* Static Background - no animation for performance */}
      <div
      className="absolute inset-0 opacity-10 bg-gradient-to-br from-[#0080FF] via-[#0080FF] to-transparent"
      />

      {/* Content */}
      <div className="relative z-10 space-y-4">
        
        {/* Header */}
         <div
          className="flex items-center gap-2 mb-3"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0080FF] to-[#0099FF] flex items-center justify-center shadow-md shadow-[#0080FF]/60">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">השירות המטאורולוגי</h2>
            <p className="text-[#0080FF] font-semibold text-xs animate-pulse">הרשת החדשה</p>
          </div>
        </div>

        {/* Weather Metrics Grid */}
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {mockWeatherMetrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-lg rounded-lg p-3 border border-[#0080FF]/40 hover:border-[#0080FF]/80 transition-all cursor-pointer group"
              >
                <div className={`${metric.color} mb-1.5 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-white/70 text-[10px] font-semibold mb-0.5">{metric.label}</p>
                <p className="text-white font-bold text-sm">{metric.value}</p>
              </div>
            );
          })}
        </div>

        {/* Alerts Section */}
         {alerts.length > 0 && (
          <div
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-[#0080FF] font-bold text-sm">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              <span>התראות ועדכונים</span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-[#0080FF]/40 hover:bg-white/10 transition-all"
                >
                  <p className="text-white font-semibold text-xs mb-0.5">{alert.title}</p>
                  <p className="text-white/70 text-[10px] line-clamp-2">{alert.description}</p>
                  <a 
                    href={alert.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#0080FF] text-[10px] hover:underline mt-1 inline-block"
                  >
                    קרא עוד →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div
              className="w-6 h-6 border-2 border-[#0080FF]/30 border-t-[#0080FF] rounded-full animate-spin"
            />
          </div>
        )}

        {/* Footer */}
        <div
          className="text-center pt-2 border-t border-[#0080FF]/30"
        >
          <p className="text-white/50 text-[10px]">
            עדכון: {new Date().toLocaleTimeString('he-IL')} • <a href="https://ims.gov.il" target="_blank" rel="noopener noreferrer" className="text-[#0080FF] hover:underline">IMS</a>
          </p>
        </div>
      </div>
    </motion.div>
  );
}