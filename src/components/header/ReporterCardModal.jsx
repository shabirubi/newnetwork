import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause } from "lucide-react";

export default function ReporterCardModal({ reporter, isOpen, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    if (isOpen && reporter) {
      generateVoice();
    }
  }, [isOpen, reporter]);

  const generateVoice = async () => {
    try {
      const text = `שלום, אני ${reporter.name}, ${reporter.role} בהרשת החדשה. אני מתמחה בתחום ${reporter.specialty} וכותב על ${reporter.categories?.join(", ")}. ${reporter.bio || ""}`;
      
      const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM", {
        method: "POST",
        headers: {
          "xi-api-key": import.meta.env.VITE_ELEVENLABS_API_KEY || "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audioElement = new Audio(audioUrl);
        setAudio(audioElement);
      }
    } catch (error) {
      console.error("Error generating voice:", error);
    }
  };

  const togglePlay = () => {
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
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

              {/* Audio Player */}
              <button
                onClick={togglePlay}
                className="w-full bg-[#E31E24] hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
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