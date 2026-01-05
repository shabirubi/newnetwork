import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Radio, Loader, Volume2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const anchors = {
  male: {
    name: "דוד כהן",
    role: "עיתונאי פלילי",
    specialty: "פשיעה, משטרה וצדק"
  },
  female: {
    name: "שירה לוי", 
    role: "כתבת פוליטית",
    specialty: "פוליטיקה ומדיניות"
  }
};

export default function TalkingAIAnchors({ isSpeaking = true }) {
  const [currentSpeaker, setCurrentSpeaker] = useState("female");
  const [maleImage, setMaleImage] = useState(null);
  const [femaleImage, setFemaleImage] = useState(null);
  const [script, setScript] = useState(null);
  const [loadingImages, setLoadingImages] = useState(true);
  const [loadingScript, setLoadingScript] = useState(false);

  // Generate realistic AI anchor images
  useEffect(() => {
    const generateImages = async () => {
      try {
        setLoadingImages(true);
        
        // Generate female anchor
        const femaleResult = await base44.integrations.Core.GenerateImage({
          prompt: "Professional female news anchor, age 35, Israeli appearance, brunette hair in professional updo, wearing elegant burgundy blazer, white blouse, pearl necklace, sitting at news desk with microphone, confident smile, professional makeup, studio lighting, photorealistic, high quality, 8k, detailed face"
        });
        setFemaleImage(femaleResult.url);

        // Wait a bit before second image
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate male anchor  
        const maleResult = await base44.integrations.Core.GenerateImage({
          prompt: "Professional male news anchor, age 40, Israeli appearance, short dark hair, clean shaven, wearing navy blue suit, light blue shirt, red tie, sitting at news desk with microphone, confident professional look, studio lighting, photorealistic, high quality, 8k, detailed face"
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

  // Fetch latest news for script
  const { data: articles = [] } = useQuery({
    queryKey: ['latest-news-script'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 5),
    initialData: []
  });

  // Generate daily script
  useEffect(() => {
    const generateScript = async () => {
      if (!articles.length) return;
      
      try {
        setLoadingScript(true);
        
        const newsItems = articles.slice(0, 3).map(a => 
          `- ${a.title}: ${a.subtitle || a.content?.slice(0, 150)}`
        ).join('\n');

        const prompt = `You are writing a script for two Israeli TV news anchors presenting the news in Hebrew.

Anchors:
- ${anchors.female.name} (${anchors.female.role})
- ${anchors.male.name} (${anchors.male.role})

Today's top stories:
${newsItems}

Write a natural, conversational 2-minute news broadcast script in Hebrew where they take turns presenting the news. Make it sound natural and engaging, like a real Israeli news broadcast.

Format as a dialogue with speaker names.`;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt: prompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              dialogue: {
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

        setScript(response.dialogue);
        setLoadingScript(false);
      } catch (error) {
        console.error("Error generating script:", error);
        setLoadingScript(false);
      }
    };

    if (articles.length > 0 && !loadingImages) {
      generateScript();
    }
  }, [articles, loadingImages]);

  // Rotate speakers based on script
  useEffect(() => {
    if (!script || !isSpeaking) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < script.length) {
        const speaker = script[index].speaker.includes("שירה") || script[index].speaker.includes("female") ? "female" : "male";
        setCurrentSpeaker(speaker);
        index++;
      } else {
        index = 0;
      }
    }, 8000); // Each speaker talks for 8 seconds

    return () => clearInterval(interval);
  }, [script, isSpeaking]);

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
    <div className="relative w-full h-full overflow-hidden">
      {/* Studio Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        {/* Animated background elements */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(227, 30, 36, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 50%, rgba(227, 30, 36, 0.3) 0%, transparent 50%)`
          }}
          animate={{
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Animated grid */}
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(227, 30, 36, 0.3) 1px, transparent 1px),
                             linear-gradient(0deg, rgba(227, 30, 36, 0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '40px 40px']
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

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

      {/* Studio Desk */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent z-10">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E31E24] to-transparent opacity-50" />
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
            {currentSpeaker === "female" && isSpeaking && (
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

            {/* Anchor Image */}
            <div className="w-64 h-80 md:w-72 md:h-96 rounded-lg overflow-hidden border-4 border-[#E31E24] shadow-2xl bg-gray-800">
              {femaleImage ? (
                <img 
                  src={femaleImage}
                  alt={anchors.female.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader className="w-8 h-8 text-[#E31E24] animate-spin" />
                </div>
              )}
            </div>

            {/* AI Badge */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              AI
            </div>

            {/* Speaking Indicator */}
            {currentSpeaker === "female" && isSpeaking && (
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
            {currentSpeaker === "male" && isSpeaking && (
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

            {/* Anchor Image */}
            <div className="w-64 h-80 md:w-72 md:h-96 rounded-lg overflow-hidden border-4 border-[#4A90E2] shadow-2xl bg-gray-800">
              {maleImage ? (
                <img 
                  src={maleImage}
                  alt={anchors.male.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader className="w-8 h-8 text-[#4A90E2] animate-spin" />
                </div>
              )}
            </div>

            {/* AI Badge */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              AI
            </div>

            {/* Speaking Indicator */}
            {currentSpeaker === "male" && isSpeaking && (
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
              </motion.div>
            )}
          </div>

          {/* Name Tag */}
          <motion.div
            className="mt-8 text-center bg-gradient-to-r from-[#4A90E2] to-[#357ABD] px-6 py-3 rounded-full shadow-lg"
            animate={{
              scale: currentSpeaker === "male" ? [1, 1.05, 1] : 1
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-white font-bold text-lg">{anchors.male.name}</p>
            <p className="text-white/80 text-xs">{anchors.male.role}</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Current Script Display (Subtitles) */}
      {script && !loadingScript && currentSpeaker && (
        <div className="absolute bottom-20 left-0 right-0 z-20 px-8">
          <motion.div
            key={currentSpeaker}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto bg-black/70 backdrop-blur-sm px-6 py-3 rounded-lg"
          >
            <p className="text-white text-center text-sm md:text-base">
              {script.find(s => 
                (currentSpeaker === "female" && (s.speaker.includes("שירה") || s.speaker.includes("female"))) ||
                (currentSpeaker === "male" && (s.speaker.includes("דוד") || s.speaker.includes("male")))
              )?.text || ""}
            </p>
          </motion.div>
        </div>
      )}

      {/* News Ticker */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-r from-[#E31E24] to-[#B91C1C] py-3 overflow-hidden">
        <div className="flex items-center">
          <div className="bg-white text-[#E31E24] px-4 py-1 font-bold text-sm shrink-0 ml-4">
            עכשיו בשידור
          </div>
          <motion.div
            className="flex whitespace-nowrap text-white text-sm font-medium"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            <span className="mx-8">• שידור חי עם קריינות AI פוטוריאליסטיות</span>
            <span className="mx-8">• תסריט יומי מבוסס חדשות אמיתיות</span>
            <span className="mx-8">• טכנולוגיה מתקדמת של הרשת החדשה</span>
            <span className="mx-8">• {anchors.female.name} ו-{anchors.male.name} בשידור</span>
            <span className="mx-8">• שידור חי עם קריינות AI פוטוריאליסטיות</span>
          </motion.div>
        </div>
      </div>

      {/* Loading Script Indicator */}
      {loadingScript && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 px-6 py-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Loader className="w-5 h-5 text-[#E31E24] animate-spin" />
            <span className="text-white">טוען תסריט יומי...</span>
          </div>
        </div>
      )}
    </div>
  );
}