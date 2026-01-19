import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tv } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const BACKGROUND_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/43de178a9_image.png";

export default function VODContent() {
  const [channelsOpen, setChannelsOpen] = useState(false);

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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setChannelsOpen(true)}
        className="absolute top-8 right-8 z-20 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-2xl hover:shadow-3xl transition-all border border-white/20"
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
              className="relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/30 w-11/12 h-5/6 max-w-2xl"
            >
              <button
                onClick={() => setChannelsOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <iframe
                src="https://raspberrytv.net/price/4"
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                style={{ marginTop: '-80px' }}
              />
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