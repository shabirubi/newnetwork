import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ReporterAudioPlayer({ reporter, article, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioText, setAudioText] = useState("");
  const audioRef = useRef(null);

  const generateAndPlayAudio = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsLoading(true);
    setIsPlaying(true);

    try {
      // Create narration text with professional, dramatic structure
      const genderText = reporter.gender === 'female' ? 'כתבת' : 'כתב';
      const closingText = reporter.gender === 'female' ? 'נתראה בהמשך' : 'נתראה בהמשך';
      
      const narrationPrompt = `
צור קריינות חדשותית מקצועית, דרמטית וטבעית עבור ${genderText} חדשות.

הקריינות חייבת לכלול בדיוק את המבנה הזה:
1. פתיחה: "שלום, אני ${reporter.name}, ${reporter.role} מחדשות הרשת החדשה"
2. תוכן הכתבה: סיפור דרמטי ומעניין עם טון מתאים לנושא (15-25 שניות):
   - אם הכתבה דרמטית/רצינית - השתמש בטון דרמטי עם הדגשות ורגש
   - אם הכתבה קלה/הומוריסטית - השתמש בטון קליל וטבעי
   - הוסף הפסקות דרמטיות במקומות מתאימים
   - דבר בלשון ${reporter.gender === 'female' ? 'נקבה' : 'זכר'}
3. סיום: "${closingText}"

פרטי הכתבה:
כותרת: ${article.title}
${article.subtitle ? `תת-כותרת: ${article.subtitle}` : ''}
תוכן: ${article.content?.slice(0, 500) || article.title}

חשוב מאוד:
- דבר בלשון ${reporter.gender === 'female' ? 'נקבה' : 'זכר'} בכל הקריינות!
- התאם את הטון למצב הרוח של הכתבה
- אם זה נושא רציני - הוסף דרמה ומתח
- אם זה נושא קליל - היה טבעי וקליל
- הקריינות צריכה להישמע כמו ${genderText} אמיתי/ת בשטח

החזר רק את טקסט הקריינות המלא, ללא הסברים נוספים.
`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: narrationPrompt,
        add_context_from_internet: false
      });

      setAudioText(result);

      // Use Web Speech API for Hebrew TTS
      if ('speechSynthesis' in window) {
        // Load voices first
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          return voices;
        };
        
        // Wait for voices to load
        let voices = loadVoices();
        if (voices.length === 0) {
          window.speechSynthesis.addEventListener('voiceschanged', () => {
            voices = loadVoices();
          });
        }
        
        const utterance = new SpeechSynthesisUtterance(result);
        utterance.lang = 'he-IL';
        utterance.rate = 0.92;
        
        console.log('Reporter gender:', reporter.gender);
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
        
        // Set pitch and voice based on gender
        if (reporter.gender === 'female') {
          utterance.pitch = 1.3;
          // Try to find female Hebrew voice
          const femaleVoice = voices.find(voice => 
            (voice.lang.includes('he') || voice.lang.includes('iw')) && 
            (voice.name.toLowerCase().includes('female') || 
             voice.name.toLowerCase().includes('zira') ||
             voice.name.toLowerCase().includes('carmit') ||
             voice.name.toLowerCase().includes('hadar'))
          ) || voices.find(voice => voice.lang.includes('he') || voice.lang.includes('iw'));
          
          if (femaleVoice) {
            utterance.voice = femaleVoice;
            console.log('Selected female voice:', femaleVoice.name);
          }
        } else {
          utterance.pitch = 0.8;
          // Try to find male Hebrew voice
          const maleVoice = voices.find(voice => 
            (voice.lang.includes('he') || voice.lang.includes('iw')) && 
            (voice.name.toLowerCase().includes('male') || 
             voice.name.toLowerCase().includes('asaf') ||
             voice.name.toLowerCase().includes('david'))
          ) || voices.find(voice => voice.lang.includes('he') || voice.lang.includes('iw'));
          
          if (maleVoice) {
            utterance.voice = maleVoice;
            console.log('Selected male voice:', maleVoice.name);
          }
        }

        utterance.onend = () => {
          setIsPlaying(false);
        };

        utterance.onerror = () => {
          setIsPlaying(false);
          setIsLoading(false);
        };

        window.speechSynthesis.speak(utterance);
        audioRef.current = utterance;
      }

    } catch (error) {
      console.error('Error generating audio:', error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      if (isMuted) {
        window.speechSynthesis.resume();
      } else {
        window.speechSynthesis.pause();
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="relative h-48 bg-gradient-to-br from-[#E31E24] to-[#B91C1C]">
            <button
              onClick={onClose}
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors z-10"
            >
              <X size={20} />
            </button>

            {/* Reporter Image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden">
                  <img
                    src={reporter.image}
                    alt={reporter.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {isPlaying && (
                  <div className="absolute inset-0 rounded-full border-4 border-white animate-pulse"></div>
                )}
              </div>
            </div>

            {/* Live indicator */}
            {isPlaying && (
              <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="text-white text-xs font-bold">ON AIR</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {reporter.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {reporter.role}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {reporter.specialty}
              </p>
            </div>

            {/* Article Title */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2">
                {article.title}
              </h3>
              {article.subtitle && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                  {article.subtitle}
                </p>
              )}
            </div>

            {/* Audio Text Preview */}
            {audioText && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4 max-h-32 overflow-y-auto">
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  {audioText}
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleMute}
                disabled={!isPlaying}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isPlaying
                    ? 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    : 'bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                }`}
              >
                {isMuted ? (
                  <VolumeX size={20} className="text-gray-600 dark:text-gray-300" />
                ) : (
                  <Volume2 size={20} className="text-gray-600 dark:text-gray-300" />
                )}
              </button>

              <button
                onClick={generateAndPlayAudio}
                disabled={isLoading}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isPlaying
                    ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                    : 'bg-gradient-to-br from-[#E31E24] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B1B]'
                }`}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isPlaying ? (
                  <Pause size={28} className="text-white" fill="white" />
                ) : (
                  <Play size={28} className="text-white mr-[-3px]" fill="white" />
                )}
              </button>

              <div className="w-12 h-12"></div>
            </div>

            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
              {isPlaying ? 'מנגן כעת...' : 'לחץ להפעלת קריינות'}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}