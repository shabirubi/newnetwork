import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function ReporterCardModal({ reporter, isOpen, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();

  const handleChatClick = () => {
    localStorage.setItem('selectedReporter', JSON.stringify(reporter));
    navigate(createPageUrl('ReporterStudio'));
    onClose();
  };

  const togglePlay = () => {
    if (!reporter) return;
    
    const text = `שלום, אני ${reporter.name}, ${reporter.role} בהרשת החדשה. אני מתמחה בתחום ${reporter.specialty} וכותב על ${reporter.categories?.join(", ")}. ${reporter.bio || ""}`;
    
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    
    // Wait for voices to load
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => playVoice(text);
    } else {
      playVoice(text);
    }
  };

  const playVoice = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL';
    utterance.volume = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    
    if (reporter.gender === 'female') {
      const femaleVoices = voices.filter(v => 
        (v.lang.includes('he') || v.lang.includes('iw')) &&
        (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman'))
      );
      if (femaleVoices.length > 0) {
        utterance.voice = femaleVoices[0];
        utterance.pitch = 1.3;
      } else {
        utterance.pitch = 1.8;
      }
    } else {
      const maleVoices = voices.filter(v => 
        (v.lang.includes('he') || v.lang.includes('iw')) &&
        (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('man'))
      );
      if (maleVoices.length > 0) {
        utterance.voice = maleVoices[0];
        utterance.pitch = 0.85;
      } else {
        utterance.pitch = 0.7;
      }
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
  };



  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden max-w-sm w-full mx-4 border border-[#E31E24]/30"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Image */}
            <div className="relative h-64 overflow-hidden">
              <img
                src={reporter.image}
                alt={reporter.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="p-6 text-white">
              <h2 className="text-2xl font-bold mb-1">{reporter.name}</h2>
              <p className="text-[#E31E24] font-bold text-sm mb-4">{reporter.role}</p>

              <div className="mb-4">
                <p className="text-sm text-gray-300 mb-3">
                  <span className="font-bold">מתמחה בתחום:</span> {reporter.specialty}
                </p>
                {reporter.bio && (
                  <p className="text-sm text-gray-400 mb-3">{reporter.bio}</p>
                )}
                {reporter.categories && (
                  <div className="flex flex-wrap gap-2">
                    {reporter.categories.map((cat) => (
                      <span
                        key={cat}
                        className="text-xs bg-gray-700/60 text-gray-200 px-2.5 py-1 rounded-full"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Chat Button */}
              <button
                onClick={handleChatClick}
                className="w-full bg-gradient-to-r from-[#E31E24] to-purple-600 hover:from-[#B91C1C] hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 mb-3"
              >
                <MessageCircle className="w-5 h-5" />
                התחבר לצ'אט
              </button>

              {/* Audio Player */}
              <button
                onClick={togglePlay}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    עצור
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    השמע הצגה
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}