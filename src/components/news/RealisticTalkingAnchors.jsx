import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Loader, Volume2, VolumeX } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68238671d18a6312a669413d/a20bbab0c_image.png";

export default function RealisticTalkingAnchors({ isSpeaking = false }) {
  const [currentSpeaker, setCurrentSpeaker] = useState("female");
  const [isTalking, setIsTalking] = useState(false);
  const [femaleImage, setFemaleImage] = useState(null);
  const [maleImage, setMaleImage] = useState(null);
  const [loadingImages, setLoadingImages] = useState(true);
  const [script, setScript] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const utteranceRef = useRef(null);

  const anchors = {
    female: {
      name: "שירה לוי",
      role: "מגישה ראשית",
      color: "#E31E24",
      voice: "he-IL" // Hebrew voice
    },
    male: {
      name: "דוד כהן", 
      role: "עורך חדשות",
      color: "#4A90E2",
      voice: "he-IL"
    }
  };

  // Fetch latest news for script
  const { data: articles = [] } = useQuery({
    queryKey: ['news-for-script'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 5),
    initialData: []
  });

  // Generate realistic AI anchor images
  useEffect(() => {
    const generateImages = async () => {
      try {
        setLoadingImages(true);
        
        // Generate female anchor
        const femaleResult = await base44.integrations.Core.GenerateImage({
          prompt: "Professional female Israeli news anchor, age 35, brunette hair in elegant updo, wearing burgundy blazer, white blouse, pearl necklace, confident smile, professional studio lighting, photorealistic portrait, high quality"
        });
        setFemaleImage(femaleResult.url);

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate male anchor  
        const maleResult = await base44.integrations.Core.GenerateImage({
          prompt: "Professional male Israeli news anchor, age 40, short dark hair, clean shaven, wearing navy suit, light blue shirt, red tie, confident professional look, studio lighting, photorealistic portrait, high quality"
        });
        setMaleImage(maleResult.url);
        
        setLoadingImages(false);
      } catch (error) {
        console.error("Error generating images:", error);
        setLoadingImages(false);
      }
    };

    generateImages();
  }, []);

  // Generate script when articles are loaded
  useEffect(() => {
    const generateScript = async () => {
      if (!articles.length) return;
      
      try {
        const newsItems = articles.slice(0, 3).map(a => 
          `${a.title}`
        ).join('\n');

        const prompt = `אתה כותב תסריט לשני מגישי חדשות בעברית.

מגישים:
- ${anchors.female.name} (${anchors.female.role})
- ${anchors.male.name} (${anchors.male.role})

הכותרות של היום:
${newsItems}

כתוב דיאלוג קצר (4-6 משפטים) שבו הם מציגים את החדשות בתורות.
התחל עם ברכה והזכר 2-3 כותרות חשובות.
התסריט צריך להיות טבעי ומקצועי.

פורמט:
שירה: [טקסט]
דוד: [טקסט]
שירה: [טקסט]`;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt: prompt,
          response_json_schema: {
            type: "object",
            properties: {
              lines: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    speaker: { type: "string" },
                    text: { type: "string" }
                  }
                }
              }
            }
          }
        });

        setScript(response.lines || []);
      } catch (error) {
        console.error("Error generating script:", error);
        // Fallback script
        setScript([
          { speaker: "female", text: "שלום וערב טוב, אני שירה לוי" },
          { speaker: "male", text: "ואני דוד כהן" },
          { speaker: "female", text: "והנה החדשות החמות של היום מהרשת החדשה" }
        ]);
      }
    };

    if (articles.length > 0 && !loadingImages) {
      generateScript();
    }
  }, [articles, loadingImages]);

  // Speech synthesis function
  const speakText = (text, speaker) => {
    if (muted || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL';
    utterance.rate = 0.95;
    utterance.pitch = speaker === "female" ? 1.1 : 0.9;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsTalking(true);
    };

    utterance.onend = () => {
      setIsTalking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Auto-play script when speaking
  useEffect(() => {
    if (!isSpeaking || !script.length || loadingImages) return;

    let index = 0;
    const playScript = () => {
      if (index < script.length) {
        const line = script[index];
        const speaker = line.speaker === "female" || line.speaker.includes("שירה") ? "female" : "male";
        
        setCurrentSpeaker(speaker);
        setCurrentLineIndex(index);
        speakText(line.text, speaker);
        
        // Wait for speech to finish + pause, then next line
        const duration = line.text.length * 80; // Estimate duration
        setTimeout(() => {
          index++;
          if (index < script.length) {
            playScript();
          } else {
            // Loop back to start
            index = 0;
            setTimeout(playScript, 2000);
          }
        }, duration);
      }
    };

    playScript();

    return () => {
      window.speechSynthesis.cancel();
      setIsTalking(false);
    };
  }, [isSpeaking, script, loadingImages, muted]);

  if (loadingImages) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#E31E24] animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">יוצר מגישים מבוססי AI...</p>
          <p className="text-gray-400 text-sm mt-2">ייצור דמויות פוטוריאליסטיות</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
      {/* Logo Background - TV Studio Style */}
      <div className="absolute inset-0 flex items-center justify-center opacity-15">
        <motion.img
          src={LOGO_URL}
          alt="לוגו"
          className="w-96 h-96 object-contain"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Circular Logo Rings */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-[600px] h-[600px] rounded-full border-2 border-[#E31E24] opacity-10" />
      </motion.div>

      {/* Broadcast Lines Effect */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E31E24] to-transparent"
          style={{ top: `${20 + i * 15}%` }}
          animate={{
            opacity: [0, 0.3, 0],
            scaleX: [0, 1, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.3
          }}
        />
      ))}

      {/* Logo Watermark */}
      <div className="absolute top-6 right-6 z-10">
        <motion.div
          className="flex items-center gap-2 bg-[#E31E24]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#E31E24]/30"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Radio className="w-5 h-5 text-[#E31E24]" />
          <span className="text-white font-bold text-sm">שידור חי</span>
        </motion.div>
      </div>

      {/* Mute Button */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          onClick={() => setMuted(!muted)}
          variant="ghost"
          size="icon"
          className="bg-black/40 hover:bg-black/60 text-white"
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </Button>
      </div>

      {/* Anchors Side by Side */}
      <div className="absolute inset-0 flex items-center justify-center gap-12 px-8">
        {/* Female Anchor (Right) */}
        <motion.div
          className="relative flex flex-col items-center"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative">
            {/* Glow when speaking */}
            {currentSpeaker === "female" && isTalking && (
              <motion.div
                className="absolute -inset-4 rounded-lg"
                animate={{
                  boxShadow: [
                    '0 0 30px rgba(227, 30, 36, 0.4)',
                    '0 0 50px rgba(227, 30, 36, 0.8)',
                    '0 0 30px rgba(227, 30, 36, 0.4)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}

            {/* Anchor Image with Animations */}
            <motion.div 
              className="w-64 h-80 md:w-72 md:h-96 rounded-lg overflow-hidden border-4 border-[#E31E24] shadow-2xl bg-gray-800"
              animate={currentSpeaker === "female" && isTalking ? {
                scale: [1, 1.02, 1],
                y: [0, -2, 0]
              } : {
                y: [0, -1, 0]
              }}
              transition={{
                duration: currentSpeaker === "female" && isTalking ? 0.5 : 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {femaleImage ? (
                <motion.img 
                  src={femaleImage}
                  alt={anchors.female.name}
                  className="w-full h-full object-cover"
                  animate={currentSpeaker === "female" && isTalking ? {
                    scale: [1, 1.05, 1.03, 1],
                  } : {}}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader className="w-8 h-8 text-[#E31E24] animate-spin" />
                </div>
              )}
              
              {/* Lip Sync Overlay Effect */}
              {currentSpeaker === "female" && isTalking && (
                <>
                  <motion.div
                    className="absolute bottom-[35%] left-1/2 transform -translate-x-1/2 w-12 h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent rounded-full"
                    animate={{
                      scaleY: [1, 1.3, 1.1, 1],
                      opacity: [0.3, 0.6, 0.4, 0.3]
                    }}
                    transition={{
                      duration: 0.25,
                      repeat: Infinity
                    }}
                  />
                  <motion.div
                    className="absolute top-[25%] left-[45%] w-2 h-2 bg-white/30 rounded-full"
                    animate={{
                      y: [0, -1, 0],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                      duration: 0.4,
                      repeat: Infinity
                    }}
                  />
                  <motion.div
                    className="absolute top-[25%] right-[45%] w-2 h-2 bg-white/30 rounded-full"
                    animate={{
                      y: [0, -1, 0],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                      duration: 0.4,
                      repeat: Infinity,
                      delay: 0.1
                    }}
                  />
                </>
              )}
            </motion.div>

            {/* AI Badge */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              AI
            </div>

            {/* Speaking Indicator */}
            {currentSpeaker === "female" && isTalking && (
              <motion.div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-1">
                <motion.div
                  className="w-2 h-4 bg-[#E31E24] rounded-full"
                  animate={{ height: ["8px", "16px", "8px"] }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                />
                <motion.div
                  className="w-2 h-4 bg-[#E31E24] rounded-full"
                  animate={{ height: ["8px", "16px", "8px"] }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: 0.1 }}
                />
                <motion.div
                  className="w-2 h-4 bg-[#E31E24] rounded-full"
                  animate={{ height: ["8px", "16px", "8px"] }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: 0.2 }}
                />
              </motion.div>
            )}
          </div>

          {/* Name Tag */}
          <motion.div
            className="mt-8 text-center bg-gradient-to-r from-[#E31E24] to-[#B91C1C] px-6 py-3 rounded-full shadow-lg"
            animate={{
              scale: currentSpeaker === "female" ? [1, 1.05, 1] : 1
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-white font-bold text-lg">{anchors.female.name}</p>
            <p className="text-white/80 text-xs">{anchors.female.role}</p>
          </motion.div>
        </motion.div>

        {/* Male Anchor (Left) */}
        <motion.div
          className="relative flex flex-col items-center"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative">
            {/* Glow when speaking */}
            {currentSpeaker === "male" && isTalking && (
              <motion.div
                className="absolute -inset-4 rounded-lg"
                animate={{
                  boxShadow: [
                    '0 0 30px rgba(74, 144, 226, 0.4)',
                    '0 0 50px rgba(74, 144, 226, 0.8)',
                    '0 0 30px rgba(74, 144, 226, 0.4)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}

            {/* Anchor Image with Animations */}
            <motion.div 
              className="w-64 h-80 md:w-72 md:h-96 rounded-lg overflow-hidden border-4 border-[#4A90E2] shadow-2xl bg-gray-800"
              animate={currentSpeaker === "male" && isTalking ? {
                scale: [1, 1.02, 1],
                y: [0, -2, 0]
              } : {
                y: [0, -1, 0]
              }}
              transition={{
                duration: currentSpeaker === "male" && isTalking ? 0.5 : 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {maleImage ? (
                <motion.img 
                  src={maleImage}
                  alt={anchors.male.name}
                  className="w-full h-full object-cover"
                  animate={currentSpeaker === "male" && isTalking ? {
                    scale: [1, 1.05, 1.03, 1],
                  } : {}}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader className="w-8 h-8 text-[#4A90E2] animate-spin" />
                </div>
              )}
              
              {/* Lip Sync Overlay Effect */}
              {currentSpeaker === "male" && isTalking && (
                <>
                  <motion.div
                    className="absolute bottom-[35%] left-1/2 transform -translate-x-1/2 w-12 h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent rounded-full"
                    animate={{
                      scaleY: [1, 1.3, 1.1, 1],
                      opacity: [0.3, 0.6, 0.4, 0.3]
                    }}
                    transition={{
                      duration: 0.25,
                      repeat: Infinity
                    }}
                  />
                  <motion.div
                    className="absolute top-[25%] left-[45%] w-2 h-2 bg-white/30 rounded-full"
                    animate={{
                      y: [0, -1, 0],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                      duration: 0.4,
                      repeat: Infinity
                    }}
                  />
                  <motion.div
                    className="absolute top-[25%] right-[45%] w-2 h-2 bg-white/30 rounded-full"
                    animate={{
                      y: [0, -1, 0],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                      duration: 0.4,
                      repeat: Infinity,
                      delay: 0.1
                    }}
                  />
                </>
              )}
            </motion.div>

            {/* AI Badge */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              AI
            </div>

            {/* Speaking Indicator */}
            {currentSpeaker === "male" && isTalking && (
              <motion.div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-1">
                <motion.div
                  className="w-2 h-4 bg-[#4A90E2] rounded-full"
                  animate={{ height: ["8px", "16px", "8px"] }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                />
                <motion.div
                  className="w-2 h-4 bg-[#4A90E2] rounded-full"
                  animate={{ height: ["8px", "16px", "8px"] }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: 0.1 }}
                />
                <motion.div
                  className="w-2 h-4 bg-[#4A90E2] rounded-full"
                  animate={{ height: ["8px", "16px", "8px"] }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: 0.2 }}
                />
              </motion