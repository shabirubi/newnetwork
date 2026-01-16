import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Play, Pause, Download, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function RadioAnnouncer() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef(null);

  const generateRadioShow = async () => {
    setIsGenerating(true);
    toast.info("רוז פיזם מכינה את השידור...");

    try {
      const response = await base44.functions.invoke('generateRadioShow', {});
      
      if (response?.data) {
        const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        toast.success("השידור מוכן! 🎙️");
      }
    } catch (error) {
      console.error('Error generating radio show:', error);
      toast.error("שגיאה ביצירת השידור");
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = 'radio-show-rose-fizm.mp3';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("הורדת השידור בהצלחה!");
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false);
    }
  }, [audioUrl]);

  return (
    <div className="fixed bottom-24 left-6 z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-6 w-80"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">רוז פיזם</h3>
            <p className="text-white/80 text-sm">שדרנית חדשות AI</p>
          </div>
        </div>

        {/* Controls */}
        {!audioUrl ? (
          <Button
            onClick={generateRadioShow}
            disabled={isGenerating}
            className="w-full bg-white text-purple-600 hover:bg-white/90 font-bold py-6 rounded-xl"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin ml-2" />
                מייצרת שידור...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 ml-2" />
                צור שידור חדשות עכשיו
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <p className="text-white text-sm font-medium">השידור מוכן!</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={togglePlay}
                className="flex-1 bg-white text-purple-600 hover:bg-white/90 font-bold"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 ml-2" />
                    עצור
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 ml-2" />
                    הפעל
                  </>
                )}
              </Button>
              
              <Button
                onClick={downloadAudio}
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              onClick={generateRadioShow}
              disabled={isGenerating}
              variant="outline"
              className="w-full border-white/30 text-white hover:bg-white/10"
            >
              צור שידור חדש
            </Button>
          </div>
        )}

        {/* Audio Element */}
        {audioUrl && (
          <audio ref={audioRef} src={audioUrl} className="hidden" />
        )}

        {/* Info */}
        <div className="mt-4 text-center">
          <p className="text-white/70 text-xs">
            מופעל ע"י ElevenLabs - קול מקצועי בעברית
          </p>
        </div>
      </motion.div>
    </div>
  );
}