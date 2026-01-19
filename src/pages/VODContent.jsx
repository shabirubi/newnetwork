import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tv } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const BACKGROUND_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/43de178a9_image.png";

export default function VODContent() {
    const [channelsOpen, setChannelsOpen] = useState(false);
    const { data: channels = [] } = useQuery({
      queryKey: ['israeli-channels'],
      queryFn: () => base44.entities.IsraeliChannels.list(),
      initialData: []
    });

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{
        backgroundImage: `url('${BACKGROUND_IMAGE}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Channels Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setChannelsOpen(true)}
        className="absolute top-8 right-8 z-20 bg-gradient-to-br from-black/80 via-[#E31E24]/60 to-black/90 text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 shadow-2xl hover:shadow-[0_0_30px_rgba(227,30,36,0.8)] transition-all border-2 border-[#E31E24]/70 backdrop-blur-sm"
        style={{
          boxShadow: '0 0 20px rgba(227, 30, 36, 0.5), inset 0 0 15px rgba(227, 30, 36, 0.2)'
        }}
      >
        <Tv className="w-5 h-5" />
        ערוצים
      </motion.button>

      {/* Channels Modal */}
      <AnimatePresence>
        {channelsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center"
          >
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setChannelsOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-gradient-to-br from-black/90 via-[#1a0000]/80 to-black/90 rounded-3xl overflow-hidden shadow-2xl border-2 border-[#E31E24]/40 w-11/12 h-auto max-w-6xl max-h-[85vh] backdrop-blur-sm"
              style={{
                boxShadow: '0 0 40px rgba(227, 30, 36, 0.4), inset 0 0 20px rgba(227, 30, 36, 0.1)'
              }}
            >
              <button
                onClick={() => setChannelsOpen(false)}
                className="absolute top-6 right-6 p-3 hover:bg-[#E31E24]/30 rounded-full transition-all z-10 border border-[#E31E24]/50"
              >
                <X className="w-6 h-6 text-[#E31E24]" />
              </button>
              <div className="w-full overflow-y-auto p-8">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-[#E31E24] via-red-500 to-[#E31E24] bg-clip-text text-transparent mb-2">
                    ערוצים ישראלים
                  </h2>
                  <div className="h-1 w-32 bg-gradient-to-r from-[#E31E24] to-transparent mx-auto" />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                  {channels.map((channel) => (
                    <motion.div
                      key={channel.id}
                      whileHover={{ scale: 1.15, rotateZ: 2 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gradient-to-br from-black to-[#330000] border-2 border-[#E31E24]/60 hover:border-[#E31E24] transition-all group-hover:shadow-[0_0_20px_rgba(227,30,36,0.6)]"
                        style={{
                          boxShadow: 'inset 0 0 15px rgba(227, 30, 36, 0.1), 0 0 10px rgba(227, 30, 36, 0.3)'
                        }}
                      >
                        <img 
                          src={channel.logo}
                          alt={channel.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#E31E24]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-white text-xs text-center font-bold line-clamp-2 w-full px-1 group-hover:text-[#E31E24] transition-colors">
                        {channel.name}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Player */}
      <div className="relative z-10">
        <style>{`
          @keyframes neon-glow {
            0%, 100% { box-shadow: 0 0 10px rgba(227, 30, 36, 0.5), 0 0 20px rgba(227, 30, 36, 0.3); }
            50% { box-shadow: 0 0 20px rgba(227, 30, 36, 0.8), 0 0 40px rgba(227, 30, 36, 0.6); }
          }
        `}</style>
        <div
          className="rounded-2xl overflow-hidden bg-black border-2 border-black"
          style={{
            width: '320px',
            height: '568px',
            animation: 'neon-glow 3s ease-in-out infinite'
          }}
        >
          <iframe
            src="https://www.youtube.com/embed/4miQnYCTdS8?autoplay=1&rel=0&modestbranding=1&fs=0"
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; encrypted-media"
          />
        </div>
      </div>
    </div>
  );
}