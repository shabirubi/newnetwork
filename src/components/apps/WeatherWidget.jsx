import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, X, Sun, CloudRain, Wind } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function WeatherWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getWeather = async () => {
    setIsLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `תן לי תחזית מזג אויר עדכנית לישראל (ערים עיקריות: תל אביב, ירושלים, חיפה, באר שבע).
        
        החזר JSON בפורמט הבא:
        {
          "cities": [
            {
              "name": "שם העיר",
              "temp": טמפרטורה במעלות,
              "condition": "מצב מזג האוויר",
              "humidity": אחוז לחות,
              "wind": מהירות רוח
            }
          ],
          "general": "תיאור כללי של מזג האוויר בארץ היום"
        }`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            cities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  temp: { type: "number" },
                  condition: { type: "string" },
                  humidity: { type: "number" },
                  wind: { type: "number" }
                }
              }
            },
            general: { type: "string" }
          }
        }
      });
      setWeather(result);
    } catch (error) {
      toast.error("שגיאה בטעינת מזג האוויר");
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    const cond = condition?.toLowerCase() || '';
    if (cond.includes('גשם') || cond.includes('rain')) return CloudRain;
    if (cond.includes('רוח') || cond.includes('wind')) return Wind;
    if (cond.includes('שמש') || cond.includes('sun') || cond.includes('בהיר')) return Sun;
    return Cloud;
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-sky-600 to-blue-600 rounded-2xl p-8 cursor-pointer shadow-2xl"
        onClick={() => {
          setIsOpen(true);
          if (!weather) getWeather();
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Cloud className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">מזג אויר</h3>
            <p className="text-sky-100">תחזית עדכנית לכל הארץ</p>
          </div>
        </div>
        <p className="text-white/90 text-sm">
          מידע מזג אוויר בזמן אמת מכל רחבי ישראל
        </p>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Cloud className="w-8 h-8 text-sky-600" />
                  <h2 className="text-3xl font-bold dark:text-white">מזג אויר בישראל</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 dark:text-white" />
                </button>
              </div>

              {isLoading && (
                <div className="text-center space-y-4 py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400">טוען נתוני מזג אוויר...</p>
                </div>
              )}

              {weather && !isLoading && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-2xl p-6">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      {weather.general}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {weather.cities?.map((city, index) => {
                      const WeatherIcon = getWeatherIcon(city.condition);
                      return (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 rounded-2xl p-6"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-2xl font-bold dark:text-white">{city.name}</h3>
                              <p className="text-gray-600 dark:text-gray-400">{city.condition}</p>
                            </div>
                            <WeatherIcon className="w-12 h-12 text-sky-600" />
                          </div>
                          <div className="text-4xl font-bold text-sky-600 mb-4">
                            {city.temp}°C
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">לחות</p>
                              <p className="font-bold dark:text-white">{city.humidity}%</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">רוח</p>
                              <p className="font-bold dark:text-white">{city.wind} קמ״ש</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    onClick={getWeather}
                    variant="outline"
                    className="w-full"
                  >
                    רענן נתונים
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}