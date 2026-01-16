import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Loader2, Download, Cloud, Sun, CloudRain, CloudSnow, Wind, Umbrella, Thermometer, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function WeatherForecastModal({ isOpen, onClose, currentWeather }) {
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState(null);

  const generateForecast = async () => {
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setAudioUrl(null);

    try {
      // Generate weather forecast data
      const forecastData = await base44.integrations.Core.InvokeLLM({
        prompt: `תן לי תחזית מזג אוויר מפורטת לתל אביב:
        
מצב נוכחי: ${currentWeather?.temperature || 25}°C, ${currentWeather?.description || 'בהיר'}

החזר JSON עם:
1. today - תחזית מפורטת להיום (טמפרטורה מקס/מין, מצב, סיכויי גשם, רוח)
2. next7days - מערך של 7 ימים הבאים (תאריך, טמפרטורה, מצב, סיכויי גשם)
3. script - סקריפט מקצועי ואנרגטי בן 30-40 שניות לתחזיאנית בשם "מיכל כהן"

הסקריפט צריך לכלול:
- ברכת פתיחה ("שלום, אני מיכל כהן עם תחזית מזג האוויר")
- מזג האוויר היום
- תחזית ל-3 הימים הקרובים
- המלצה למה ללבוש / האם לקחת מטריה
- סיום חיובי`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            today: {
              type: "object",
              properties: {
                temp_max: { type: "number" },
                temp_min: { type: "number" },
                condition: { type: "string" },
                rain_chance: { type: "number" },
                wind_speed: { type: "number" }
              }
            },
            next7days: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  day_name: { type: "string" },
                  temp_max: { type: "number" },
                  temp_min: { type: "number" },
                  condition: { type: "string" },
                  rain_chance: { type: "number" }
                }
              }
            },
            script: { type: "string" }
          }
        }
      });

      setForecast(forecastData);

      // Generate audio with ElevenLabs
      const audioResponse = await base44.functions.invoke('generateSpeech', {
        text: forecastData.script,
        voice_id: 'EXAVITQu4vr4xnSDxMaL' // Female Hebrew voice
      });

      if (audioResponse?.data) {
        const audioBlob = new Blob([audioResponse.data], { type: 'audio/mpeg' });
        const audioObjectUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioObjectUrl);
      }

      // Generate video with D-ID using the audio
      const videoResponse = await base44.functions.invoke('generateWeatherVideo', {
        script: forecastData.script
      });

      if (videoResponse.data.success) {
        setVideoUrl(videoResponse.data.video_url);
      } else {
        setError('שגיאה ביצירת הווידאו: ' + (videoResponse.data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error:', err);
      setError('שגיאה ביצירת התחזית: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    const cond = condition?.toLowerCase() || "";
    if (cond.includes("rain") || cond.includes("גשם")) return <CloudRain className="w-8 h-8" />;
    if (cond.includes("snow") || cond.includes("שלג")) return <CloudSnow className="w-8 h-8" />;
    if (cond.includes("cloud") || cond.includes("עננ")) return <Cloud className="w-8 h-8" />;
    if (cond.includes("wind") || cond.includes("רוח")) return <Wind className="w-8 h-8" />;
    return <Sun className="w-8 h-8" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="relative p-6 pb-4 pt-12">
              <button
                onClick={onClose}
                className="absolute top-4 left-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="text-center text-white">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur"
                >
                  <Sun className="w-12 h-12" />
                </motion.div>
                <h2 className="text-4xl font-bold mb-2">תחזית מזג האוויר</h2>
                <p className="text-blue-100">עם מיכל כהן - תחזיאנית הרשת החדשה</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Weather */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm mb-1">תל אביב עכשיו</p>
                    <p className="text-7xl font-bold">{currentWeather?.temperature || 25}°</p>
                    <p className="text-xl mt-2">{currentWeather?.description || 'בהיר וחם'}</p>
                  </div>
                  <div className="text-6xl opacity-40">
                    {getWeatherIcon(currentWeather?.condition)}
                  </div>
                </div>
              </motion.div>

              {/* Generate Button or Video */}
              {!videoUrl && !loading && !forecast && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <Button
                    onClick={generateForecast}
                    className="bg-white text-blue-600 hover:bg-blue-50 px-12 py-8 text-2xl font-bold rounded-2xl shadow-2xl"
                  >
                    <Play className="w-8 h-8 ml-3" />
                    הצג תחזית מלאה
                  </Button>
                </motion.div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <Loader2 className="w-20 h-20 text-white mx-auto mb-6 animate-spin" />
                  <p className="text-2xl font-bold text-white mb-2">מכינים את התחזית...</p>
                  <p className="text-white/80">מיכל כהן מתכוננת לשידור</p>
                </div>
              )}

              {error && (
                <div className="bg-red-500 text-white rounded-xl p-6 text-center font-bold">
                  {error}
                </div>
              )}

              {/* Video Player */}
              {videoUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-black rounded-2xl overflow-hidden shadow-2xl"
                >
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    className="w-full aspect-video"
                  />
                </motion.div>
              )}

              {/* Audio Player (fallback) */}
              {audioUrl && !videoUrl && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/10 backdrop-blur rounded-xl p-4"
                >
                  <audio src={audioUrl} controls autoPlay className="w-full" />
                </motion.div>
              )}

              {/* 7 Day Forecast */}
              {forecast?.next7days && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
                >
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    תחזית ל-7 ימים
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {forecast.next7days.map((day, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="bg-white/20 backdrop-blur rounded-xl p-4 text-center text-white hover:bg-white/30 transition-all"
                      >
                        <p className="text-sm font-bold mb-2">{day.day_name}</p>
                        <div className="my-3">
                          {getWeatherIcon(day.condition)}
                        </div>
                        <p className="text-2xl font-bold">{day.temp_max}°</p>
                        <p className="text-sm opacity-80">{day.temp_min}°</p>
                        {day.rain_chance > 20 && (
                          <div className="flex items-center justify-center gap-1 mt-2 text-xs">
                            <Umbrella className="w-3 h-3" />
                            {day.rain_chance}%
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              {videoUrl && (
                <div className="flex gap-3">
                  <Button
                    onClick={generateForecast}
                    className="flex-1 bg-white text-blue-600 hover:bg-blue-50 py-6 text-lg font-bold"
                  >
                    <Play className="w-5 h-5 ml-2" />
                    תחזית חדשה
                  </Button>
                  <Button
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = videoUrl;
                      a.download = 'weather-forecast.mp4';
                      a.click();
                    }}
                    className="flex-1 bg-white/20 text-white hover:bg-white/30 py-6 text-lg font-bold backdrop-blur"
                  >
                    <Download className="w-5 h-5 ml-2" />
                    הורד
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}