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
    if (playingId === alert.id) {
      setPlayingId(null);
      return;
    }

    setLoadingId(alert.id);
    try {
      const { data } = await base44.functions.invoke('generateElevenLabsSpeech', {
        text: alert.content || alert.subtitle,
        voice_id: 'onwK4ZeVeZw25vXSwVNc'
      });

      if (data?.audio_url) {
        const audio = new Audio(data.audio_url);
        audio.play();
        setPlayingId(alert.id);
        audio.onended = () => setPlayingId(null);
      }
    } catch (error) {
      toast.error('שגיאה בהפעלת הקול');
    } finally {
      setLoadingId(null);
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
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0080FF]/20 flex items-center justify-center border-2 border-[#0080FF] animate-pulse">
            <Radio className="w-5 h-5 text-[#0080FF]" />
          </div>
          <h2 className="text-2xl font-bold text-white">דיווחים בזמן אמת</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg bg-[#0080FF]/20 hover:bg-[#0080FF]/40 text-[#0080FF] transition-colors"
            title="רענן"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <Link
            to={createPageUrl("WarRoom")}
            className="flex items-center gap-2 px-4 py-2 bg-[#0080FF] hover:bg-[#0066FF] text-white rounded-lg font-semibold transition-colors text-sm"
          >
            חדר מלחמה
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Alerts Grid */}
      {alerts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-gradient-to-br from-[#0080FF]/20 to-black/60 border border-[#0080FF]/30 rounded-xl p-4 hover:border-[#0080FF]/60 transition-all hover:shadow-[0_0_20px_rgba(0,128,255,0.3)]"
              >
                {/* Badge */}
                {alert.is_breaking && (
                  <div className="absolute top-3 right-3">
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-block px-2 py-1 bg-[#0080FF] text-white text-xs font-bold rounded-full"
                    >
                      חדשות חם
                    </motion.span>
                  </div>
                )}

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="font-bold text-white pr-16 leading-tight line-clamp-2">
                    {alert.title}
                  </h3>

                  <p className="text-gray-300 text-sm line-clamp-2">
                    {alert.subtitle || alert.content}
                  </p>

                  {/* Time */}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{alert.source}</span>
                    <span>•</span>
                    <span>{new Date(alert.created_date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#0080FF]/20">
                    <button
                      onClick={() => handlePlayAudio(alert)}
                      disabled={loadingId === alert.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 disabled:bg-gray-600 text-white rounded-lg transition-colors text-xs font-semibold"
                    >
                      {loadingId === alert.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : playingId === alert.id ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      {loadingId === alert.id ? 'טוען...' : playingId === alert.id ? 'עצור' : 'הפעל'}
                    </button>

                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg transition-colors text-xs font-semibold"
                    >
                      <Film className="w-3.5 h-3.5" />
                      וידאו
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
    </section>
  );
}