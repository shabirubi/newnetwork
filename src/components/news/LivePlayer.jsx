import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Hls from "hls.js";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, 
  Users, Radio, Settings, Download, Bookmark, 
  MessageCircle, Eye, Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import ShareButtons from "../shared/ShareButtons";




const DEFAULT_STREAM = "https://youtu.be/2q9lcnXBicQ";

export default function LivePlayer({ 
  title = "שידור חי - הרשת החדשה",
  viewerCount = 0,
  isLive = true,
  thumbnailUrl = null,
  streamUrl
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [showControls, setShowControls] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [viewerReactions, setViewerReactions] = useState(1234);
  const [dynamicViewerCount, setDynamicViewerCount] = useState(viewerCount || 2847);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const playerRef = useRef(null);

  const videoPlaylist = [
    "7f6TVsLPUbQ",
    "UAVHgNaPVwQ"
  ];

  const currentStreamUrl = streamUrl;

  // Dynamic viewer count with realistic fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setDynamicViewerCount(prev => {
        const change = Math.random() > 0.3 
          ? Math.floor(Math.random() * 25) + 10  // Usually increase (10-35)
          : Math.floor(Math.random() * 10) - 5;   // Sometimes decrease (-5 to +5)
        return Math.max(1000, prev + change); // Never below 1000
      });
    }, 2500); // Update every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  // YouTube IFrame API for controlling playback
    useEffect(() => {
      if (currentStreamUrl) return; // If custom stream URL provided, skip YouTube API

      // Load YouTube IFrame API
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      const initPlayer = () => {
        if (window.YT && window.YT.Player) {
          if (playerRef.current && playerRef.current.destroy) {
            playerRef.current.destroy();
          }

          playerRef.current = new window.YT.Player('youtube-player', {
            videoId: videoPlaylist[currentVideoIndex],
            playerVars: {
              autoplay: 1,
              controls: 1,
              rel: 0,
              modestbranding: 1
            },
            events: {
              onStateChange: (event) => {
                // When video ends (state 0)
                if (event.data === 0) {
                  const nextIndex = (currentVideoIndex + 1) % videoPlaylist.length;
                  setCurrentVideoIndex(nextIndex);
                }
              }
            }
          });
        }
      };

      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        window.onYouTubeIframeAPIReady = initPlayer;
      }

      return () => {
        if (playerRef.current && playerRef.current.destroy) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
      };
    }, [currentVideoIndex, currentStreamUrl]);

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

  // Setup HLS.js for m3u8 streams
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPlaying) return;

    const isHLS = currentStreamUrl?.includes('.m3u8');
    if (!isHLS) return;

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Check if HLS is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      
      hlsRef.current = hls;
      hls.loadSource(currentStreamUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(err => console.log('Play failed:', err));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.log('HLS Error:', data.type, data.details);
        if (data.fatal) {
          switch(data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = currentStreamUrl;
      video.play().catch(err => console.log('Play failed:', err));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentStreamUrl, isPlaying]);

  // Handle video element volume and mute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);



  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-black sm:rounded-b-lg overflow-hidden shadow-2xl group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Container */}
      <div className="relative w-full aspect-[9/16] sm:aspect-video">
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

        {/* Viewer Count and Live Badge */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10 flex items-center gap-1.5">
          <div className="flex items-center gap-1 sm:gap-2 bg-black/60 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm">
            <Users size={12} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{dynamicViewerCount.toLocaleString()} צופים</span>
            <span className="sm:hidden">{(dynamicViewerCount / 1000).toFixed(1)}K</span>
          </div>
          {isLive && (
            <div className="flex items-center gap-1 sm:gap-2 bg-[#E31E24] text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white"></span>
              </span>
              LIVE
            </div>
          )}
        </div>

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

        {/* Logo Watermark */}
        {isPlaying && (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 opacity-20 sm:opacity-50 pointer-events-none hidden sm:block">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/a44ef2558_212.png"
              alt="הרשת החדשה"
              className="h-12 sm:h-20 lg:h-24 w-auto"
            />
          </div>
        )}

        {/* Stream iframe - for all non-HLS streams */}
        {isPlaying && (
          (() => {
            // YouTube with API control (default)
            if (!currentStreamUrl) {
              return <div id="youtube-player" className="absolute inset-0 w-full h-full" />;
            }

            // For custom stream URLs (like Channel 14)
            if (!currentStreamUrl.includes('.m3u8') && !currentStreamUrl.includes('.mpd')) {
              return (
                <iframe
                  src={currentStreamUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; fullscreen; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                  title={title}
                />
              );
            }
            return null;
          })()
        )}
        
        {/* HLS Video Player */}
        {isPlaying && (currentStreamUrl.includes('.m3u8') || currentStreamUrl.includes('.mpd')) && (
          <video
            ref={videoRef}
            src={currentStreamUrl}
            className="absolute inset-0 w-full h-full bg-black object-contain"
            autoPlay
            playsInline
            muted={isMuted}
            controls={false}
          />
        )}

      </div>

      {/* Controls Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showControls || !isPlaying ? 1 : 0, y: 0 }}
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 sm:p-4"
      >
        {/* Progress Bar (simulated for live) */}
        <div className="w-full h-0.5 sm:h-1 bg-gray-700 rounded-full mb-2 sm:mb-4 overflow-hidden">
          <motion.div 
            className="h-full bg-[#E31E24]"
            animate={{ width: isPlaying ? "100%" : "0%" }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="flex items-center justify-between gap-1 sm:gap-0">
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
            >
              {isPlaying ? <Pause size={18} className="sm:w-6 sm:h-6" /> : <Play size={18} className="sm:w-6 sm:h-6" />}
            </Button>

            {/* Volume */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
              >
                {isMuted || volume === 0 ? <VolumeX size={16} className="sm:w-5 sm:h-5" /> : <Volume2 size={16} className="sm:w-5 sm:h-5" />}
              </Button>
              <div className="w-16 sm:w-24 hidden md:block">
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
            <span className="text-white text-xs sm:text-sm font-medium hidden lg:inline">
              {isLive ? "● שידור חי" : "00:00 / 00:00"}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Reactions */}
            <button
              onClick={() => setViewerReactions(viewerReactions + 1)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white text-xs font-medium transition-colors"
            >
              <MessageCircle size={16} />
              {viewerReactions}
            </button>

            {/* Bookmark */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex ${isBookmarked ? 'text-yellow-400' : ''}`}
            >
              <Bookmark size={16} className="sm:w-5 sm:h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
            </Button>

            {/* Share with menu */}
            <div className="relative hidden sm:block">
              <ShareButtons 
                url={window.location.href}
                title={title}
                size="small"
                showLabel={false}
              />
            </div>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10 hidden md:flex"
            >
              <Settings size={16} className="sm:w-5 sm:h-5" />
            </Button>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
            >
              <Maximize size={16} className="sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}