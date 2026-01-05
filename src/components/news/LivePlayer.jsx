import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, 
  Users, Radio, Settings, Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import RealisticTalkingAnchors from "./RealisticTalkingAnchors";

export default function LivePlayer({ 
  title = "שידור חי - הרשת החדשה",
  viewerCount = 0,
  isLive = true,
  thumbnailUrl = null
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const togglePlay = () => {
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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-black rounded-2xl overflow-hidden shadow-2xl group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Container */}
      <div className="relative aspect-video">
        {/* Placeholder/Thumbnail */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
            {thumbnailUrl ? (
              <img 
                src={thumbnailUrl} 
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#E31E24]/20 flex items-center justify-center">
                  <Radio className="w-12 h-12 text-[#E31E24]" />
                </div>
                <h3 className="text-white text-xl font-bold">{title}</h3>
                <p className="text-gray-400 mt-2">לחצו להפעלת השידור</p>
              </div>
            )}
          </div>
        )}

        {/* Live Badge */}
        {isLive && (
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-2 bg-[#E31E24] text-white px-3 py-1.5 rounded-full text-sm font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              LIVE
            </div>
          </div>
        )}

        {/* Viewer Count */}
        {viewerCount > 0 && (
          <div className="absolute top-4 left-4 z-10">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm">
              <Users size={16} />
              {viewerCount.toLocaleString()} צופים
            </div>
          </div>
        )}

        {/* Play Button Overlay */}
        {!isPlaying && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
          >
            <div className="w-20 h-20 rounded-full bg-[#E31E24] flex items-center justify-center shadow-lg hover:bg-[#B91C1C] transition-colors">
              <Play className="w-8 h-8 text-white mr-[-4px]" fill="white" />
            </div>
          </motion.button>
        )}

        {/* AI Anchors when Playing */}
        {isPlaying && (
          <div className="absolute inset-0">
            <RealisticTalkingAnchors isSpeaking={isPlaying} />
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showControls || !isPlaying ? 1 : 0, y: 0 }}
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4"
      >
        {/* Progress Bar (simulated for live) */}
        <div className="w-full h-1 bg-gray-700 rounded-full mb-4 overflow-hidden">
          <motion.div 
            className="h-full bg-[#E31E24]"
            animate={{ width: isPlaying ? "100%" : "0%" }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </Button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </Button>
              <div className="w-24 hidden sm:block">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={([val]) => {
                    setVolume(val);
                    setIsMuted(val === 0);
                  }}
                  className="cursor-pointer"
                />
              </div>
            </div>

            {/* Time/Live indicator */}
            <span className="text-white text-sm font-medium hidden sm:inline">
              {isLive ? "● שידור חי" : "00:00 / 00:00"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Share */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Share2 size={20} />
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Settings size={20} />
            </Button>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize size={20} />
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}