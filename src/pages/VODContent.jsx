import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tv, ChevronLeft, Upload } from "lucide-react";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import VideoUploadModal from "../components/vod/VideoUploadModal";

const BACKGROUND_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/43de178a9_image.png";
const NEXT_VIDEO_URL = "https://youtu.be/2q9lcnXBicQ";

export default function VODContent() {
    const [channelsOpen, setChannelsOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const queryClient = useQueryClient();

    const { data: channels = [] } = useQuery({
      queryKey: ['israeli-channels'],
      queryFn: () => base44.entities.IsraeliChannels.list(),
      initialData: []
    });

    const { data: userVideos = [] } = useQuery({
      queryKey: ['user-videos'],
      queryFn: () => base44.entities.UserVideo.filter({ status: 'ready' }, '-created_date', 50),
      initialData: []
    });

    const handleVideoUploaded = (video) => {
      queryClient.invalidateQueries({ queryKey: ['user-videos'] });
    };

    const videoQueue = [
      { id: 'initial', url: 'https://www.youtube.com/embed/4miQnYCTdS8?autoplay=1&rel=0' },
      { id: 'next', url: `https://www.youtube.com/embed/${NEXT_VIDEO_URL.split('/').pop()}?autoplay=1&rel=0` },
      ...userVideos.map(v => ({ id: v.id, url: v.video_url }))
    ];

    const currentVideo = videoQueue[currentVideoIndex];

    const handleVideoEnded = () => {
      if (currentVideoIndex < videoQueue.length - 1) {
        setCurrentVideoIndex(currentVideoIndex + 1);
      } else {
        setCurrentVideoIndex(0);
      }
    };

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

      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.location.href = createPageUrl("Home")}
        className="absolute top-8 left-8 z-20 bg-gradient-to-br from-black/80 via-[#E31E24]/60 to-black/90 text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 shadow-2xl hover:shadow-[0_0_30px_rgba(227,30,36,0.8)] transition-all border-2 border-[#E31E24]/70 backdrop-blur-sm"
        style={{
          boxShadow: '0 0 20px rgba(227, 30, 36, 0.5), inset 0 0 15px rgba(227, 30, 36, 0.2)'
        }}
      >
        <ChevronLeft className="w-5 h-5" />
        חזרה חדשות הרשת
      </motion.button>

      <style>{`
        .channels-scroll::-webkit-scrollbar {
          display: none;
        }
        .channels-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>

      {/* Channels Modal */}
            <AnimatePresence>
              {channelsOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-30 flex items-center justify-center p-4 sm:p-6"
                >
                  <div
                    className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    onClick={() => setChannelsOpen(false)}
                  />
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative bg-gradient-to-br from-black/95 via-[#0a0000]/90 to-black/95 rounded-3xl overflow-hidden shadow-2xl border-2 border-[#E31E24]/50 w-full h-full max-w-7xl max-h-[90vh] backdrop-blur-sm flex flex-col"
                    style={{
                      boxShadow: '0 0 60px rgba(227, 30, 36, 0.5), inset 0 0 30px rgba(227, 30, 36, 0.15)'
                    }}
                  >
                    <button
                      onClick={() => setChannelsOpen(false)}
                      className="absolute top-6 right-6 p-3 hover:bg-[#E31E24]/40 rounded-full transition-all z-10 border-2 border-[#E31E24]/60 hover:border-[#E31E24] bg-black/50 backdrop-blur-sm"
                    >
                      <X className="w-7 h-7 text-[#E31E24]" />
                    </button>
                    <div className="channels-scroll flex-1 overflow-y-auto p-8 sm:p-12">
                <div className="text-center mb-12">
                  <h2 className="text-5xl font-bold bg-gradient-to-r from-[#E31E24] via-red-600 to-[#E31E24] bg-clip-text text-transparent mb-4">
                    ערוצים ישראלים
                  </h2>
                  <div className="h-1.5 w-48 bg-gradient-to-r from-[#E31E24] via-transparent to-[#E31E24] mx-auto rounded-full" 
                    style={{ boxShadow: '0 0 20px rgba(227, 30, 36, 0.6)' }}
                  />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 2xl:grid-cols-8 gap-6 auto-rows-max justify-items-center">
                  {channels.map((channel) => (
                    <motion.div
                      key={channel.id}
                      whileHover={{ scale: 1.2, rotateZ: 3 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex flex-col items-center gap-3 group"
                    >
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-black to-[#220000] border-2 border-[#E31E24]/70 hover:border-[#E31E24] transition-all group-hover:shadow-[0_0_30px_rgba(227,30,36,0.8)]"
                        style={{
                          boxShadow: 'inset 0 0 20px rgba(227, 30, 36, 0.15), 0 0 15px rgba(227, 30, 36, 0.4)'
                        }}
                      >
                        <img 
                          src={channel.logo}
                          alt={channel.name}
                          className="w-full h-full object-cover group-hover:scale-120 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#E31E24]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-white text-sm text-center font-bold line-clamp-2 w-full px-2 group-hover:text-[#E31E24] transition-colors">
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