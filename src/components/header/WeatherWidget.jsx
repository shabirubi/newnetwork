import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer, Droplets } from "lucide-react";
import { base44 } from "@/api/base44Client";
import WeatherForecastModal from "../weather/WeatherForecastModal";

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Give me the current weather in Tel Aviv, Israel. Include temperature in Celsius, condition (sunny/cloudy/rainy/snowy), humidity percentage, and whether it's summer or winter weather.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              temperature: { type: "number" },
              condition: { type: "string" },
              humidity: { type: "number" },
              season: { type: "string" },
              description: { type: "string" }
            }
          }
        });
        setWeather(result);
      } catch (error) {
        // Fallback weather
        setWeather({
          temperature: 28,
          condition: "sunny",
          humidity: 55,
          season: "summer",
          description: "בהיר וחם"
        });
      }
      setLoading(false);
    };

    fetchWeather();
  }, []);

  const getWeatherIcon = (condition) => {
    const cond = condition?.toLowerCase() || "";
    if (cond.includes("rain") || cond.includes("גשם")) return <CloudRain className="w-3.5 h-3.5 text-blue-400" />;
    if (cond.includes("snow") || cond.includes("שלג")) return <CloudSnow className="w-3.5 h-3.5 text-blue-200" />;
    if (cond.includes("cloud") || cond.includes("עננ")) return <Cloud className="w-3.5 h-3.5 text-gray-400" />;
    if (cond.includes("wind") || cond.includes("רוח")) return <Wind className="w-3.5 h-3.5 text-gray-500" />;
    return <Sun className="w-3.5 h-3.5 text-yellow-400" />;
  };

  const getSeasonColor = (season) => {
    if (season?.includes("summer") || season?.includes("קיץ")) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 animate-pulse">
        <div className="w-4 h-4 bg-white/40 rounded-full" />
        <div className="w-10 h-4 bg-white/40 rounded" />
      </div>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative group"
      >
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 transition-all hover:scale-105 hover:bg-black/70"
        >
          {getWeatherIcon(weather?.condition)}
          <div className="flex flex-col">
            <span className="font-bold text-white text-sm leading-none">{weather?.temperature || 25}°</span>
            <div className="flex items-center gap-1 text-white/80 text-[10px] leading-none mt-0.5">
              <Droplets className="w-2.5 h-2.5" />
              <span>{weather?.humidity || 50}%</span>
            </div>
          </div>
        </button>
      </motion.div>

      <WeatherForecastModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentWeather={weather}
      />
    </>
  );
}