import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Loader2, Download, Cloud, Sun, CloudRain, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function WeatherForecastModal({ isOpen, onClose, currentWeather }) {
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [script, setScript] = useState(null);
  const [error, setError] = useState(null);

  const generateForecast = async () => {
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setScript(null);

    try {
      // Generate detailed weather script
      const weatherScript = await base44.integrations.Core.InvokeLLM({
        prompt: `אתה תחזיאית מזג אוויר מקצועית ואנרגטית בשם "מיכל כהן" מהרשת החדשה.
        
תנאי מזג האוויר הנוכחיים בתל אביב:
- טמפרטורה: ${currentWeather?.temperature || 25}°C
- מצב: ${currentWeather?.description || 'בהיר'}
- לחות: ${currentWeather?.humidity || 50}%

צור סקריפט תחזית מזג אוויר בן 20-30 שניות בעברית, כולל:
1. ברכת פתיחה קצרה ואנרגטית ("שלום! אני מיכל כהן עם תחזית מזג האוויר")
2. מצב מזג האוויר היום בתל אביב ובאזור המרכז
3. תחזית לשני-שלושה הימים הקרובים
4. המלצה קצרה (מה ללבוש, האם לקחת מטריה וכו')
5. סיכום קצר ומעודד

החזר סקריפט טבעי, דינמי ומקצועי שמתאים לשידור חדשות.
השתמש במשפטים קצרים וקצביים.`,
        add_context_from_internet: true
      });

      setScript(weatherScript);

      // Generate video with D-ID
      const response = await base44.functions.invoke('generateWeatherForecast', {
        script: weatherScript
      });

      if (response.data.success) {
        setVideoUrl(response.data.video_url);
      } else {
        setError(response.data.error || 'שגיאה ביצירת התחזית');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('אירעה שגיאה ביצירת התחזית');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-6 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
                    <Sun className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">תחזית מזג האוויר</h2>
                    <p className="text-blue-100 text-sm">מיכל כהן - תחזיאנית הרשת החדשה</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Current Weather Card */}
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-2xl p-6 mb-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 mb-1">תל אביב עכשיו</p>
                    <p className="text-5xl font-bold">{currentWeather?.temperature || 25}°</p>
                    <p className="text-blue-100 mt-2">{currentWeather?.description || 'בהיר וחם'}</p>
                  </div>
                  <div className="text-right">
                    <Cloud className="w-24 h-24 opacity-40" />
                    <p className="text-sm mt-2">לחות: {currentWeather?.humidity || 50}%</p>
                  </div>
                </div>
              </div>

              {/* Video Player or Generate Button */}
              {!videoUrl && !loading && (
                <div className="text-center py-12">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                    <Play className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 dark:text-white">תחזית מזג אוויר בווידאו</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                    מיכל כהן, תחזיאנית הרשת החדשה, תספר לכם על מזג האוויר לימים הקרובים
                  </p>
                  <Button
                    onClick={generateForecast}
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-6 text-lg font-bold rounded-full shadow-lg"
                  >
                    <Play className="w-5 h-5 ml-2" />
                    הצג תחזית מלאה
                  </Button>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
                  <p className="text-lg font-bold dark:text-white mb-2">מכין את התחזית...</p>
                  <p className="text-gray-600 dark:text-gray-300">מיכל מתכוננת לשידור</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
                  <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
              )}

              {videoUrl && (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
                    <video
                      src={videoUrl}
                      controls
                      autoPlay
                      className="w-full aspect-video"
                    />
                  </div>

                  {script && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                      <h4 className="font-bold mb-2 dark:text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        סקריפט התחזית
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {script}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={generateForecast}
                      variant="outline"
                      className="flex-1"
                    >
                      <Play className="w-4 h-4 ml-2" />
                      תחזית חדשה
                    </Button>
                    <Button
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = videoUrl;
                        a.download = 'weather-forecast.mp4';
                        a.click();
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 ml-2" />
                      הורד וידאו
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}