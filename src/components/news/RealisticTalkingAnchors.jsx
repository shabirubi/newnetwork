import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Loader, Volume2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68238671d18a6312a669413d/a20bbab0c_image.png";

export default function RealisticTalkingAnchors({ isSpeaking = false }) {
  const [videoUrl, setVideoUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentScript, setCurrentScript] = useState("");
  const videoRef = useRef(null);

  const anchors = {
    female: {
      name: "שירה לוי",
      role: "מגישה ראשית",
      specialty: "חדשות ופוליטיקה",
      color: "#E31E24",
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
    },
    male: {
      name: "דוד כהן", 
      role: "עורך חדשות",
      specialty: "כלכלה וביטחון",
      color: "#4A90E2",
      imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80"
    }
  };

  // Fetch latest news for script
  const { data: articles = [] } = useQuery({
    queryKey: ['news-for-script'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 5),
    initialData: []
  });

  // Generate script and video when component mounts and articles are loaded
  useEffect(() => {
    if (articles.length > 0 && !videoUrl && !isGenerating && isSpeaking) {
      generateTalkingVideo();
    }
  }, [articles, isSpeaking]);

  const generateTalkingVideo = async () => {
    setIsGenerating(true);
    
    try {
      // Generate Hebrew news script using LLM
      const scriptResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `אתה כותב תסריטים לחדשות טלוויזיה בעברית.
        
צור תסריט קצר (30-45 שניות) למגישת חדשות ששמה שירה לוי.
התסריט צריך להיות טבעי, מקצועי ואנרגטי בסגנון חדשות ישראליות.

הנה הכותרות האחרונות:
${articles.map(a => `• ${a.title}`).join('\n')}

התסריט צריך:
- להתחיל ב"שלום וערב טוב"
- להזכיר 2-3 כותרות חשובות
- להיות בעברית טבעית ושוטפת
- לסיים בביטוי מעודד

החזר רק את התסריט המדויק, בלי הערות.`,
      });

      const script = scriptResponse || "שלום וערב טוב, אני שירה לוי והנה החדשות החמות של היום מהרשת החדשה.";
      setCurrentScript(script);

      // Generate talking video with D-ID
      const result = await base44.functions.generateTalkingVideo({
        text: script,
        avatarUrl: anchors.female.imageUrl,
        voice: "he-IL-AvriNeural"
      });

      if (result.success) {
        setVideoUrl(result.video_url);
        // Auto-play video when ready
        if (videoRef.current) {
          videoRef.current.play();
        }
      }
    } catch (error) {
      console.error("Error generating video:", error);
      setCurrentScript("שגיאה ביצירת הוידאו. אנא בדוק את הגדרות ה-API של D-ID.");
    } finally {
      setIsGenerating(false);
    }
  };

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

      {/* Circular Logo Rings - TV Effect */}
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

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        {isGenerating && (
          <div className="text-center">
            <Loader className="w-16 h-16 text-[#E31E24] animate-spin mx-auto mb-4" />
            <h3 className="text-white text-xl font-bold">מייצר מגישה מדברת...</h3>
            <p className="text-gray-400 mt-2">זה לוקח כ-30 שניות</p>
          </div>
        )}

        {videoUrl && (
          <div className="relative">
            {/* Video Player */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full max-w-2xl h-auto"
                autoPlay
                loop
                playsInline
                onError={(e) => console.error("Video error:", e)}
              />
              
              {/* Live Badge */}
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-2 bg-[#E31E24] text-white px-3 py-1.5 rounded-full text-sm font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  LIVE
                </div>
              </div>

              {/* Anchor Name Tag */}
              <div className="absolute bottom-4 right-4 bg-gradient-to-r from-[#E31E24] to-[#B91C1C] text-white px-4 py-2 rounded-lg">
                <div className="font-bold">{anchors.female.name}</div>
                <div className="text-xs opacity-90">{anchors.female.role}</div>
              </div>

              {/* Sound Indicator */}
              <motion.div
                className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full"
                animate={{
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity
                }}
              >
                <Volume2 size={20} />
              </motion.div>
            </motion.div>

            {/* Subtitles */}
            {currentScript && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-black/80 backdrop-blur-sm text-white p-4 rounded-xl max-w-2xl mx-auto"
              >
                <p className="text-center text-lg leading-relaxed">{currentScript}</p>
              </motion.div>
            )}
          </div>
        )}

        {!videoUrl && !isGenerating && (
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#E31E24]/20 flex items-center justify-center">
              <Radio className="w-12 h-12 text-[#E31E24]" />
            </div>
            <h3 className="text-white text-xl font-bold">מוכנים לשידור</h3>
            <p className="text-gray-400 mt-2">לחצו על play כדי להתחיל</p>
          </div>
        )}
      </div>

      {/* News Ticker */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#E31E24] text-white py-2 overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap text-sm"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {articles.map((article, i) => (
            <span key={i} className="mx-8">• {article.title}</span>
          ))}
          {articles.map((article, i) => (
            <span key={`dup-${i}`} className="mx-8">• {article.title}</span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}