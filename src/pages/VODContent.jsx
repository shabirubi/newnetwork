import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tv } from "lucide-react";

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

      {/* Video Player */}
      <div className="relative z-10 w-11/12 max-w-4xl">
        <style>{`
          @keyframes neon-glow {
            0%, 100% { box-shadow: 0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 0, 0.3); }
            50% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 0, 0.5); }
          }
        `}</style>
        <div
          className="rounded-2xl overflow-hidden aspect-video bg-black border-2 border-black"
          style={{
            animation: 'neon-glow 3s ease-in-out infinite'
          }}
        >
          <iframe
            src="https://www.youtube.com/embed/4miQnYCTdS8?autoplay=1&rel=0&modestbranding=1"
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