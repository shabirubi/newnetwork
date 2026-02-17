import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Radio, RefreshCw, Play, Pause, Loader2, Film, ChevronRight, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function RealTimeAlertsContainer() {
  const [playingId, setPlayingId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [generatingVideoId, setGeneratingVideoId] = useState(null);
  const [selectedVideoAlert, setSelectedVideoAlert] = useState(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null);
  const [audioInstance, setAudioInstance] = useState(null);

  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ['realtime-alerts-container'],
    queryFn: async () => {
      try {
        const articles = await base44.entities.NewsArticle.filter(
          { category: 'security', is_breaking: true },
          '-created_date',
          6
        );
        return articles || [];
      } catch (error) {
        console.error('Error fetching alerts:', error);
        return [];
      }
    },
    staleTime: 15000,
    refetchInterval: 30000
  });

  const handlePlayAudio = async (alert) => {
    // Stop current audio if playing
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
      setAudioInstance(null);
    }

    if (playingId === alert.id) {
      setPlayingId(null);
      return;
    }

    setLoadingId(alert.id);
    try {
      const { data } = await base44.functions.invoke('generateElevenLabsSpeech', {
        text: alert.title + '. ' + (alert.content || alert.subtitle || ''),
        voice_id: 'onwK4ZeVeZw25vXSwVNc'
      });

      if (data?.audio_url) {
        const audio = new Audio(data.audio_url);
        setAudioInstance(audio);
        
        audio.onended = () => {
          setPlayingId(null);
          setAudioInstance(null);
        };
        
        audio.onerror = () => {
          toast.error('שגיאה בהפעלת הקול');
          setPlayingId(null);
          setAudioInstance(null);
        };

        await audio.play();
        setPlayingId(alert.id);
        toast.success('מפעיל הקראה קולית');
      } else {
        toast.error('שגיאה ביצירת קול');
      }
    } catch (error) {
      console.error('Audio error:', error);
      toast.error('שגיאה: ' + error.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleGenerateVideo = async (alert) => {
    setGeneratingVideoId(alert.id);
    setSelectedVideoAlert(alert);
    setGeneratedVideoUrl(null);
    
    try {
      const { data } = await base44.functions.invoke('createLumaVideo', {
        prompt: `${alert.title}. ${alert.content || alert.subtitle || ''}`,
        duration: 15
      });

      if (data?.video_url) {
        setGeneratedVideoUrl(data.video_url);
        toast.success('וידאו נוצר בהצלחה');
      } else {
        toast.error('שגיאה ביצירת וידאו');
      }
    } catch (error) {
      console.error('Video generation error:', error);
      toast.error('שגיאה ביצירת וידאו: ' + error.message);
    } finally {
      setGeneratingVideoId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-[#0080FF]/20 to-black rounded-2xl p-6 border border-[#0080FF]/30">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-[#0080FF] animate-spin" />
          <span className="text-white">טוען דיווחים בזמן אמת...</span>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-3 sm:space-y-4 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#0080FF]/20 flex items-center justify-center border-2 border-[#0080FF] animate-pulse">
            <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-[#0080FF]" />
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-white">דיווחים בזמן אמת</h2>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => refetch()}
            className="p-1.5 sm:p-2 rounded-lg bg-[#0080FF]/20 hover:bg-[#0080FF]/40 text-[#0080FF] transition-colors"
            title="רענן"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <Link
            to={createPageUrl("WarRoom")}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-[#0080FF] hover:bg-[#0066FF] text-white rounded-lg font-semibold transition-colors text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">חדר מלחמה</span>
            <span className="sm:hidden">חדר</span>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div>
      </div>

      {/* Alerts Grid */}
      {alerts.length > 0 ? (
        <div className="space-y-3 sm:space-y-4 w-full sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          <AnimatePresence>
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-gradient-to-br from-[#0080FF]/20 to-black/60 border border-[#0080FF]/30 rounded-xl p-3 sm:p-4 hover:border-[#0080FF]/60 transition-all hover:shadow-[0_0_20px_rgba(0,128,255,0.3)] w-full"
              >
                {/* Badge */}
                {alert.is_breaking && (
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#0080FF] text-white text-[10px] sm:text-xs font-bold rounded-full"
                    >
                      חם
                    </motion.span>
                  </div>
                )}

                {/* Content */}
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="font-bold text-white pr-10 sm:pr-16 leading-tight line-clamp-2 text-sm sm:text-base">
                    {alert.title}
                  </h3>

                  <p className="text-gray-300 text-xs sm:text-sm line-clamp-2">
                    {alert.subtitle || alert.content}
                  </p>

                  {/* Time */}
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-400">
                    <span className="truncate max-w-[100px]">{alert.source}</span>
                    <span>•</span>
                    <span>{new Date(alert.created_date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#0080FF]/20">
                    <button
                      onClick={() => handlePlayAudio(alert)}
                      disabled={loadingId === alert.id}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600/80 hover:bg-blue-600 disabled:bg-gray-600 text-white rounded-lg transition-colors text-xs font-semibold"
                    >
                      {loadingId === alert.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : playingId === alert.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      <span>{loadingId === alert.id ? 'טוען...' : playingId === alert.id ? 'עצור' : 'הפעל'}</span>
                    </button>

                    <button
                      onClick={() => handleGenerateVideo(alert)}
                      disabled={generatingVideoId === alert.id}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#0080FF]/80 hover:bg-[#0080FF] disabled:bg-gray-600 text-white rounded-lg transition-colors text-xs font-semibold"
                    >
                      {generatingVideoId === alert.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Film className="w-4 h-4" />
                      )}
                      <span>{generatingVideoId === alert.id ? 'יוצר...' : 'וידאו'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12 bg-black/40 rounded-xl border border-[#0080FF]/20">
          <AlertTriangle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">אין דיווחים בזמן אמת כרגע</p>
        </div>
      )}

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideoAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={() => {
              setSelectedVideoAlert(null);
              setGeneratedVideoUrl(null);
            }}
          >
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-2xl bg-black rounded-2xl overflow-hidden border-2 border-[#0080FF]/60"
              style={{
                boxShadow: '0 0 40px rgba(0, 128, 255, 0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setSelectedVideoAlert(null);
                  setGeneratedVideoUrl(null);
                }}
                className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-all border border-white/20"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {!generatedVideoUrl ? (
                <div className="aspect-video flex flex-col items-center justify-center p-8">
                  <Loader2 className="w-12 h-12 text-[#0080FF] animate-spin mb-4" />
                  <p className="text-white text-lg font-semibold">יוצר וידאו...</p>
                  <p className="text-gray-400 text-sm mt-2">זה עלול לקחת כמה דקות</p>
                </div>
              ) : (
                <video
                  src={generatedVideoUrl}
                  className="w-full h-full bg-black"
                  controls
                  autoPlay
                  playsInline
                  style={{ objectFit: 'contain' }}
                ></video>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}