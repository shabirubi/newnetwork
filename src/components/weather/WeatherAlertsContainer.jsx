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
      className="bg-black/90 rounded-2xl p-3 sm:p-4 border border-gray-800 shadow-lg overflow-hidden relative mx-0"
    >
      {/* Content */}
      <div className="relative z-10 space-y-3 sm:space-y-4">
        
        {/* Header */}
         <div
          className="flex items-center gap-2 mb-2 sm:mb-3"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-900 flex items-center justify-center border border-gray-700">
            <Cloud className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">השירות המטאורולוגי</h2>
            <p className="text-gray-400 font-semibold text-[10px] sm:text-xs">הרשת החדשה</p>
          </div>
        </div>

        {/* Weather Metrics Grid */}
        <div
          className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-3"
        >
          {mockWeatherMetrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div
                key={idx}
                className="bg-gray-900 rounded-lg p-1.5 sm:p-3 border border-gray-800 hover:border-gray-700 transition-all cursor-pointer group"
              >
                <div className={`${metric.color} mb-0.5 sm:mb-1.5 group-hover:scale-110 transition-transform flex justify-center`}>
                  <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </div>
                <p className="text-gray-400 text-[8px] sm:text-[10px] font-semibold mb-0.5 text-center truncate">{metric.label}</p>
                <p className="text-white font-bold text-[10px] sm:text-sm text-center">{metric.value}</p>
              </div>
            );
          })}
        </div>

        {/* Alerts Section */}
         {alerts.length > 0 && (
          <div
            className="space-y-2 sm:space-y-3"
          >
            <div className="flex items-center gap-2 text-gray-300 font-bold text-xs sm:text-sm">
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
              <span>התראות ועדכונים</span>
            </div>
            <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto scrollbar-hide">
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="bg-gray-900 rounded-lg p-2 border border-gray-800 hover:bg-gray-800 transition-all"
                >
                  <p className="text-white font-semibold text-[10px] sm:text-xs mb-0.5">{alert.title}</p>
                  <p className="text-gray-400 text-[9px] sm:text-[10px] line-clamp-2">{alert.description}</p>
                  <a 
                    href={alert.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-300 text-[9px] sm:text-[10px] hover:underline mt-1 inline-block"
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
          <div className="flex items-center justify-center py-6 sm:py-8">
            <div
              className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-700 border-t-gray-300 rounded-full animate-spin"
            />
          </div>
        )}

        {/* Footer */}
        <div
          className="text-center pt-2 border-t border-gray-800"
        >
          <p className="text-gray-500 text-[9px] sm:text-[10px]">
            עדכון: {new Date().toLocaleTimeString('he-IL')} • <a href="https://ims.gov.il" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:underline">IMS</a>
          </p>
        </div>
      </div>
    </motion.div>
  );
}