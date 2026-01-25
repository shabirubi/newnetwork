import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Play, X, User, Clock } from "lucide-react";
import moment from "moment";

export default function ReporterResponsesFeed() {
  const [fullscreenVideo, setFullscreenVideo] = useState(null);

  // טעינת תשובות כתבים - מכל המשתמשים
  const { data: responses = [], isLoading } = useQuery({
    queryKey: ['reporter-responses'],
    queryFn: async () => {
      const data = await base44.entities.ReporterChat.filter(
        { sender_type: 'reporter' },
        '-created_date',
        50
      );
      return data;
    },
    refetchInterval: 10000, // רענון כל 10 שניות
    initialData: []
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-black via-red-900/20 to-black rounded-2xl p-8 border border-[#E31E24]/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#E31E24]/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-[#E31E24]" />
          </div>
          <h2 className="text-2xl font-bold text-white">תשובות הכתבים</h2>
        </div>
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-[#E31E24]/20 border-t-[#E31E24] rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="bg-gradient-to-br from-black via-red-900/20 to-black rounded-2xl p-8 border border-[#E31E24]/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#E31E24]/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-[#E31E24]" />
          </div>
          <h2 className="text-2xl font-bold text-white">תשובות הכתבים</h2>
        </div>
        <div className="text-center py-8">
          <User className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60 text-sm">אין תשובות עדיין</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-black via-red-900/20 to-black rounded-2xl p-4 sm:p-8 border border-[#E31E24]/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#E31E24]/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-[#E31E24]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">תשובות הכתבים</h2>
            <p className="text-white/60 text-xs sm:text-sm">תשובות מקצועיות מהכתבים</p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {responses.map((response, idx) => (
            <motion.button
              key={response.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setFullscreenVideo(response)}
              className="group relative bg-black/40 rounded-xl overflow-hidden border border-[#E31E24]/30 hover:border-[#E31E24]/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {/* Video/Text Thumbnail */}
              <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black">
                {response.voice_url ? (
                  <>
                    <video
                      src={response.voice_url}
                      className="w-full h-full object-cover"
                      playsInline
                    />
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-[#E31E24] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-white mr-1" fill="white" />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-bold">
                      וידאו
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <MessageCircle className="w-12 h-12 text-[#E31E24]/30" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#E31E24]/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-[#E31E24]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm line-clamp-1">{response.reporter_name}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-white/50 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {moment(response.created_date).fromNow()}
                      </p>
                      {response.user_name && (
                        <p className="text-white/40 text-xs">• {response.user_name}</p>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-white/80 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                  {response.message}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Fullscreen Video Modal */}
      <AnimatePresence>
        {fullscreenVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[100000] flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-b from-black/80 to-transparent px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E31E24]/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-[#E31E24]" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{fullscreenVideo.reporter_name}</p>
                  <p className="text-white/70 text-xs">{moment(fullscreenVideo.created_date).format('DD/MM/YYYY HH:mm')}</p>
                </div>
              </div>
              <button
                onClick={() => setFullscreenVideo(null)}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors active:scale-95"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Video/Text */}
            <div className="flex-1 relative flex items-center justify-center p-4">
              {fullscreenVideo.voice_url ? (
                <video
                  src={fullscreenVideo.voice_url}
                  autoPlay
                  playsInline
                  controls
                  className="w-full h-full object-contain"
                  onEnded={() => setFullscreenVideo(null)}
                />
              ) : (
                <div className="max-w-2xl bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-[#E31E24]/30">
                  <p className="text-white text-lg leading-relaxed">
                    {fullscreenVideo.response_text || fullscreenVideo.message}
                  </p>
                </div>
              )}
            </div>

            {/* Message */}
            <div className="bg-gradient-to-t from-black via-black/95 to-transparent px-4 py-4 border-t border-white/10">
              <div className="max-w-3xl mx-auto">
                <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                  {fullscreenVideo.message}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}