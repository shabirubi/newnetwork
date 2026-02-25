import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Maximize, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

export default function LivePlayer({ 
  title = "שידור חי - הרשת החדשה",
  viewerCount = 0,
  isLive = true,
  thumbnailUrl = null,
  streamUrl = ""
}) {
  const [isPlaying, setIsPlaying] = useState(!!streamUrl);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [showControls, setShowControls] = useState(true);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(streamUrl || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c48a88e22_video.mp4");
  const [playerTitle, setPlayerTitle] = useState(title);
  const [dynamicViewerCount, setDynamicViewerCount] = useState(viewerCount || 2847);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Update viewer count dynamically
  useEffect(() => {
    const interval = setInterval(() => {
      setDynamicViewerCount(prev => {
        const change = Math.random() > 0.3 
          ? Math.floor(Math.random() * 25) + 10
          : Math.floor(Math.random() * 10) - 5;
        return Math.max(1000, prev + change);
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Listen for video events
  useEffect(() => {
    const handlePlayVideo = (event) => {
      const { url, title: videoTitle, autoPlay } = event.detail;
      setCurrentVideoUrl(url);
      setPlayerTitle(videoTitle || title);
      setIsPlaying(autoPlay || true);
    };

    const handleUploadArticle = (event) => {
      const { videoUrl, articleTitle, reporterName } = event.detail;
      setCurrentVideoUrl(videoUrl);
      setPlayerTitle(`${articleTitle} - ${reporterName}`);
      setIsPlaying(true);
    };

    window.addEventListener('playVideo', handlePlayVideo);
    window.addEventListener('uploadArticleToPlayer', handleUploadArticle);
    return () => {
      window.removeEventListener('playVideo', handlePlayVideo);
      window.removeEventListener('uploadArticleToPlayer', handleUploadArticle);
    };
  }, [title]);

  // Update video when streamUrl changes
  useEffect(() => {
    if (streamUrl) {
      setCurrentVideoUrl(streamUrl);
      setIsPlaying(true);
    }
  }, [streamUrl]);

  // Handle video volume and mute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-[#0080FF]/50"
      style={{
        boxShadow: '0 0 40px rgba(0, 128, 255, 0.4)'
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Main Video Container */}
      <div className="relative w-full h-screen">
        {/* Video Player */}
        {currentVideoUrl && (
          <video
            ref={videoRef}
            src={currentVideoUrl}
            className="absolute inset-0 w-full h-full object-contain bg-black"
            controls
            playsInline
            preload="metadata"
            poster={thumbnailUrl || ""}
          />
        )}

        {/* No Video Placeholder */}
        {!currentVideoUrl && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#0080FF]/20 flex items-center justify-center">
                <Radio className="w-12 h-12 text-[#0080FF]" />
              </div>
              <h3 className="text-white text-xl font-bold">{playerTitle}</h3>
              <p className="text-gray-400 mt-2">בהמתנה לסרטון...</p>
            </div>
          </div>
        )}

        {/* Branding Frame - Top */}
        <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-b from-black via-black/90 to-transparent z-30 pointer-events-none">
          <div className="flex items-center justify-between px-4 sm:px-6 h-full">
            <motion.img 
              src={LOGO_URL}
              alt="הרשת החדשה"
              className="h-10 sm:h-14 w-auto drop-shadow-2xl"
              animate={{ 
                scale: [1, 1.05, 1],
                filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)']
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="text-right">
              <div className="text-white font-bold text-sm sm:text-xl drop-shadow-lg">הרשת החדשה</div>
              <div className="text-[#0080FF] font-bold text-xs sm:text-base drop-shadow-lg">
                {playerTitle}
              </div>
            </div>
          </div>
        </div>

        {/* Branding Frame - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-14 sm:h-16 bg-gradient-to-t from-black via-black/90 to-transparent z-30">
          <div className="flex items-center justify-between px-4 h-full gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 rounded-full bg-black/60 hover:bg-black/80 transition-all text-white"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 bg-[#0080FF]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#0080FF]/50">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0080FF] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0080FF]"></span>
                </span>
                <span className="text-white font-bold text-sm sm:text-base">LIVE</span>
              </div>
              <div className="text-white/80 font-bold text-xs sm:text-sm hidden sm:block">
                {dynamicViewerCount.toLocaleString()} צופים
              </div>
            </div>
          </div>
        </div>

        {/* Live Badge - Top Right */}
        {isLive && (
          <motion.div 
            className="absolute top-20 sm:top-24 right-4 z-30"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#0080FF] to-[#0066FF] text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg border border-[#0080FF]/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span>שידור חי</span>
            </div>
          </motion.div>
        )}

        {/* Watermark Logo */}
        <div className="absolute top-24 right-4 opacity-30 pointer-events-none z-10 hidden sm:block">
          <img 
            src={LOGO_URL}
            alt="הרשת החדשה"
            className="h-16 sm:h-20 w-auto"
          />
        </div>
      </div>
    </motion.div>
  );
}