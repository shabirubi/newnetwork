import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function AnimatedCharacter({ imageUrl, script }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [words, setWords] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!script) return;
    // פיצול הטקסט למילים לשם timing של התנועות
    const wordList = script.split(" ");
    setWords(wordList);
  }, [script]);

  const getHeadRotation = (index) => {
    const patterns = [-5, 5, -3, 3, 0, -4, 4];
    return patterns[index % patterns.length];
  };

  const getEyeBlinkFrame = (index) => {
    return index % 8 === 7 ? 1 : 0; // שקיעת עיניים כל 8 מילים
  };

  const getHandMovement = (index) => {
    const movements = [
      { x: 0, y: 0 },
      { x: 10, y: -5 },
      { x: -10, y: -8 },
      { x: 15, y: -3 },
      { x: -8, y: -10 },
    ];
    return movements[index % movements.length];
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-black to-slate-900 border border-purple-500/30">
        {/* Character Container */}
        <div className="relative w-full aspect-video flex items-center justify-center bg-black">
          <img
            src={imageUrl}
            alt="Character"
            className="w-full h-full object-cover"
          />

          {/* Head Movement Layer */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={
              isPlaying && words.length > 0
                ? {
                    rotateZ: words.map((_, i) => getHeadRotation(i)),
                  }
                : {}
            }
            transition={{
              duration: words.length * 0.15,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: "center 30%" }}
          />

          {/* Eye Blink Overlay */}
          {isPlaying && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent pointer-events-none"
              animate={{
                opacity: words.map((_, i) => (getEyeBlinkFrame(i) ? 0.7 : 0)),
              }}
              transition={{
                duration: words.length * 0.15,
                ease: "easeInOut",
              }}
            />
          )}

          {/* Hand Movement Indicators */}
          {isPlaying && (
            <div className="absolute inset-0 pointer-events-none">
              {words.map((word, index) => (
                <motion.div
                  key={index}
                  className="absolute w-8 h-8 rounded-full bg-purple-400/20"
                  style={{
                    right: "15%",
                    top: "35%",
                  }}
                  animate={{
                    x: getHandMovement(index).x,
                    y: getHandMovement(index).y,
                    opacity: index % 3 === 0 ? [0, 0.5, 0] : 0,
                  }}
                  transition={{
                    duration: 0.15,
                    delay: index * 0.15,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Text Display */}
        <div className="bg-black/80 backdrop-blur-sm p-4 min-h-24">
          <div className="flex flex-wrap gap-2">
            {words.map((word, index) => (
              <motion.span
                key={index}
                className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                animate={
                  isPlaying
                    ? {
                        backgroundColor: [
                          "rgba(147, 51, 234, 0.2)",
                          "rgba(168, 85, 247, 0.5)",
                          "rgba(147, 51, 234, 0.2)",
                        ],
                        scale: [1, 1.05, 1],
                      }
                    : {}
                }
                transition={{
                  duration: 0.15,
                  delay: index * 0.15,
                }}
              >
                {word}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
        >
          {isPlaying ? "⏸ עצור" : "▶ שחק"}
        </button>
      </div>

      {/* Info */}
      <p className="text-xs text-gray-400 mt-2 text-center">
        {words.length} מילים • {(words.length * 0.15).toFixed(1)} שניות
      </p>
    </div>
  );
}