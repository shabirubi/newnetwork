import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function AnimatedCharacter({ imageUrl, script }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);

  useEffect(() => {
    if (!script) return;
    const wordList = script.split(" ");
    setWords(wordList);
  }, [script]);

  // Simulate word-by-word playback
  useEffect(() => {
    if (!isPlaying || words.length === 0) {
      setCurrentWordIndex(-1);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      setCurrentWordIndex(index);
      index++;
      if (index >= words.length) {
        setIsPlaying(false);
        setCurrentWordIndex(-1);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying, words]);

  // Get mouth opening based on word
  const getMouthOpening = (word) => {
    const vowels = /[aeiouאאוaeiouיe]/i;
    return vowels.test(word) ? 1 : 0;
  };

  // Get head tilt pattern
  const getHeadTilt = (index) => {
    const pattern = [0, 2, -2, 1, -1, 0, 3, -3];
    return pattern[index % pattern.length];
  };

  // Get eye focus shift
  const getEyeShift = (index) => {
    const shifts = [
      { x: 0, y: 0 },
      { x: 3, y: -1 },
      { x: -3, y: -1 },
      { x: 2, y: 1 },
      { x: -2, y: 1 },
    ];
    return shifts[index % shifts.length];
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-black to-slate-900 border-2 border-purple-500/40">
        {/* Character Container */}
        <div className="relative w-full aspect-video flex items-center justify-center bg-black overflow-hidden">
          {/* Main Image */}
          <motion.div
            className="absolute inset-0"
            animate={
              isPlaying && currentWordIndex >= 0
                ? {
                    rotateZ: getHeadTilt(currentWordIndex),
                    rotateX: 0,
                    scale: 1.02,
                  }
                : { rotateZ: 0, rotateX: 0, scale: 1 }
            }
            transition={{ duration: 0.1, ease: "easeInOut" }}
            style={{ transformOrigin: "center center" }}
          >
            <img
              src={imageUrl}
              alt="Character"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Mouth Movement Layer */}
          {isPlaying && currentWordIndex >= 0 && (
            <motion.div
              className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-8 h-6 bg-black/40 rounded-full pointer-events-none"
              animate={{
                scaleY: getMouthOpening(words[currentWordIndex]) ? [1, 1.4, 1] : 0.8,
                scaleX: [1, 1.2, 1],
              }}
              transition={{ duration: 0.1 }}
            />
          )}

          {/* Eye Movement Highlights */}
          {isPlaying && currentWordIndex >= 0 && (
            <>
              <motion.div
                className="absolute top-[28%] left-[35%] w-3 h-3 rounded-full bg-white/30 pointer-events-none"
                animate={{
                  x: getEyeShift(currentWordIndex).x,
                  y: getEyeShift(currentWordIndex).y,
                }}
                transition={{ duration: 0.1 }}
              />
              <motion.div
                className="absolute top-[28%] right-[35%] w-3 h-3 rounded-full bg-white/30 pointer-events-none"
                animate={{
                  x: -getEyeShift(currentWordIndex).x,
                  y: getEyeShift(currentWordIndex).y,
                }}
                transition={{ duration: 0.1 }}
              />
            </>
          )}

          {/* Breathing Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none"
            animate={{
              opacity: isPlaying ? [0.3, 0.6, 0.3] : 0,
            }}
            transition={{
              duration: 0.5,
              repeat: isPlaying ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Word Display with Timing */}
        <div className="bg-black/90 backdrop-blur-sm p-4 min-h-24">
          <div className="space-y-3">
            {/* Current Word (Large) */}
            {currentWordIndex >= 0 && (
              <motion.div
                key={`current-${currentWordIndex}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="text-center"
              >
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {words[currentWordIndex]}
                </span>
              </motion.div>
            )}

            {/* Word List */}
            <div className="flex flex-wrap gap-2 justify-center">
              {words.map((word, index) => (
                <motion.span
                  key={index}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    index === currentWordIndex
                      ? "bg-purple-600 text-white border-purple-400 scale-110"
                      : index < currentWordIndex
                      ? "bg-purple-600/30 text-purple-300 border-purple-500/30"
                      : "bg-slate-700/40 text-gray-400 border-slate-600/30"
                  }`}
                  animate={
                    index === currentWordIndex
                      ? { scale: [1, 1.1, 1] }
                      : {}
                  }
                  transition={{ duration: 0.15 }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => {
            setIsPlaying(!isPlaying);
            if (!isPlaying) setCurrentWordIndex(-1);
          }}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-lg font-semibold transition-all active:scale-95"
        >
          {isPlaying ? "⏸ עצור" : "▶ שחק"}
        </button>
        <button
          onClick={() => {
            setIsPlaying(false);
            setCurrentWordIndex(-1);
          }}
          className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
        >
          ⟲ איפוס
        </button>
      </div>

      {/* Info */}
      <p className="text-xs text-gray-400 mt-3 text-center">
        {words.length} מילים • {(words.length * 0.15).toFixed(1)} שניות
        {currentWordIndex >= 0 && (
          <span className="ml-2 text-purple-400">
            ({currentWordIndex + 1}/{words.length})
          </span>
        )}
      </p>
    </div>
  );
}