import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import mpegts from "mpegts.js";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, 
  Users, Radio, Settings, Download, Bookmark, 
  MessageCircle, Eye, Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import ShareButtons from "../shared/ShareButtons";
import { base44 } from "@/api/base44Client";




const DEFAULT_STREAM = "https://ok.ru/video/10508051226319";
const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/a44ef2558_212.png";

export default function LivePlayer({ 
  title = "שידור חי - הרשת החדשה",
  viewerCount = 0,
  isLive = true,
  thumbnailUrl = null,
  streamUrl
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPromo, setShowPromo] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [showControls, setShowControls] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [viewerReactions, setViewerReactions] = useState(1234);
  const [dynamicViewerCount, setDynamicViewerCount] = useState(viewerCount || 2847);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  const currentStreamUrl = streamUrl || DEFAULT_STREAM;

  // Promo animation effect
  useEffect(() => {
    if (showPromo) {
      const timer = setTimeout(() => {
        setShowPromo(false);
        setIsPlaying(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showPromo]);

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
      if (currentStreamUrl !== "youtube" || !isPlaying) return; // Only load for default YouTube stream

      const playlist = ["7f6TVsLPUbQ", "hqb0D9gEEjU"];

      // Load YouTube IFrame API
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      const initPlayer = () => {
        if (window.YT && window.YT.Player && !playerRef.current) {
          playerRef.current = new window.YT.Player('youtube-player', {
            videoId: playlist[0],
            playerVars: {
              autoplay: 1,
              controls: 1,
              rel: 0,
              modestbranding: 1,
              playlist: playlist.slice(1).join(',')
            },
            events: {
              onStateChange: (event) => {
                console.log('Player state:', event.data, 'Current video:', event.target.getVideoData().video_id);
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
    }, [currentStreamUrl, isPlaying]);

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

  // Universal Player - mpegts.js for TS/FLV, video.js for HLS/DASH
  useEffect(() => {
    if (!videoRef.current || currentStreamUrl === "youtube" || !isPlaying) {
      return;
    }

    // Skip for embedded players
    if (currentStreamUrl?.includes('ok.ru') || currentStreamUrl?.includes('youtube.com') || currentStreamUrl?.includes('youtu.be')) {
      return;
    }

    const isTS = currentStreamUrl?.includes('.ts') && !currentStreamUrl?.includes('.m3u8');
    const isFLV = currentStreamUrl?.includes('.flv');
    const isHLS = currentStreamUrl?.includes('.m3u8');
    const isDASH = currentStreamUrl?.includes('.mpd');
    const isMP4 = currentStreamUrl?.includes('.mp4');

    // HLS M3U8 Streaming with video.js (optimized for live TV)
    if (isHLS) {
      // Check if video.js is already initialized on this element
      if (videoRef.current.player) {
        return;
      }

      const player = videojs(videoRef.current, {
        controls: false,
        autoplay: true,
        preload: 'auto',
        liveui: true,
        html5: {
          vhs: {
            withCredentials: false,
            overrideNative: true,
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
            fastQualityChange: true,
            handlePartialData: true,
            bandwidth: 4194304,
            experimentalBufferBasedABR: true,
            experimentalLLHLS: true
          },
          nativeAudioTracks: false,
          nativeVideoTracks: false
        },
        liveTracker: {
          trackingThreshold: 0,
          liveTolerance: 3
        }
      });

      playerRef.current = player;

      // Set M3U8 source
      player.src({
        src: currentStreamUrl,
        type: 'application/x-mpegURL'
      });

      // Advanced error handling for HLS
      player.on('error', function() {
        const error = player.error();
        console.log('HLS Error:', error);
        
        if (error) {
          // Network errors - auto retry
          if (error.code === 2 || error.code === 4) {
            console.log('Network error, retrying HLS stream...');
            setTimeout(() => {
              player.src({ src: currentStreamUrl, type: 'application/x-mpegURL' });
              player.play();
            }, 3000);
          }
        }
      });

      // Monitor buffering
      player.on('waiting', () => {
        console.log('HLS buffering...');
      });

      player.on('playing', () => {
        console.log('HLS playing');
      });

      player.ready(function() {
        this.play().catch(err => {
          console.log('HLS autoplay blocked:', err);
        });
      });

      return () => {
        if (playerRef.current) {
          try {
            if (!playerRef.current.isDisposed?.()) {
              playerRef.current.pause();
              playerRef.current.dispose();
            }
          } catch (e) {
            // Silently ignore cleanup errors
          }
          playerRef.current = null;
        }
      };
    }

    // Use mpegts.js for raw MPEG-TS and FLV
    if ((isTS || isFLV) && mpegts.isSupported()) {
      // Skip if player already attached
      if (playerRef.current) {
        return;
      }

      const player = mpegts.createPlayer({
        type: isFLV ? 'flv' : 'mpegts',
        url: currentStreamUrl,
        isLive: true,
        cors: true
      }, {
        enableWorker: true,
        enableStashBuffer: false,
        stashInitialSize: 128,
        liveBufferLatencyChasing: true,
        liveBufferLatencyMaxLatency: 3,
        liveBufferLatencyMinRemain: 0.3,
        autoCleanupSourceBuffer: true
      });

      player.attachMediaElement(videoRef.current);
      player.load();
      player.play().catch(err => console.log('mpegts.js play error:', err));

      playerRef.current = player;

      player.on(mpegts.Events.ERROR, (errType, errDetail) => {
        console.log('mpegts.js error:', errType, errDetail);
        
        if (errType === mpegts.ErrorTypes.NETWORK_ERROR) {
          setTimeout(() => {
            player.unload();
            player.load();
            player.play();
          }, 3000);
        }
      });

      return () => {
        if (playerRef.current) {
          try {
            if (videoRef.current) {
              playerRef.current.pause();
              playerRef.current.unload();
              playerRef.current.detachMediaElement();
            }
            playerRef.current.destroy();
          } catch (e) {
            // Silently ignore cleanup errors
          }
          playerRef.current = null;
        }
      };
    }

    // DASH and MP4
    if (isDASH || isMP4) {
      // Check if video.js is already initialized on this element
      if (videoRef.current.player) {
        return;
      }

      const player = videojs(videoRef.current, {
        controls: false,
        autoplay: true,
        preload: 'auto',
        liveui: isDASH,
        html5: {
          vhs: {
            withCredentials: false,
            overrideNative: true
          }
        }
      });

      playerRef.current = player;

      player.src({
        src: currentStreamUrl,
        type: isDASH ? 'application/dash+xml' : 'video/mp4'
      });

      player.on('error', () => {
        console.log('Player error:', player.error());
      });

      player.ready(function() {
        this.play().catch(err => console.log('Play error:', err));
      });

      return () => {
        if (playerRef.current) {
          try {
            if (!playerRef.current.isDisposed?.()) {
              playerRef.current.pause();
              playerRef.current.dispose();
            }
          } catch (e) {
            // Silently ignore cleanup errors
          }
          playerRef.current = null;
        }
      };
    }
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
      <div className="relative w-full aspect-[9/16] sm:aspect-[21/9]">
        {/* Video System Overlay Elements */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <div className="bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-red-500/30">
            <div className="flex items-center gap-2 text-white text-xs font-mono">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>REC</span>
              <span className="text-red-500 font-bold">●</span>
            </div>
          </div>
          <div className="bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
            <div className="text-white text-xs font-mono">
              <div>CAM 1 - MAIN</div>
              <div className="text-[10px] text-gray-400 mt-1">{new Date().toLocaleTimeString('he-IL')}</div>
            </div>
          </div>
        </div>

        {/* Bottom System Bar */}
        <div className="absolute bottom-20 left-4 right-4 z-20 hidden sm:flex items-center gap-2">
          <div className="flex-1 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded flex items-center justify-center">
                  <Eye className="w-4 h-4 text-white" />
                </div>
                <div className="text-white text-xs">
                  <div className="font-bold">{viewerCount?.toLocaleString() || '3,456'}</div>
                  <div className="text-[10px] text-gray-400">צופים</div>
                </div>
              </div>
              <div className="h-6 w-px bg-white/20"></div>
              <div className="flex-1 text-white text-xs font-mono">
                <div className="text-[10px] text-gray-400 mb-1">STREAM STATUS</div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">●</span>
                  <span>LIVE - HIGH QUALITY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        {/* Logo Promo Animation */}
        {showPromo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center z-50"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 2,
                repeat: 1,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-[#E31E24] blur-3xl opacity-60 animate-pulse" />
              <img 
                src={LOGO_URL}
                alt="הרשת החדשה"
                className="relative h-32 sm:h-48 w-auto drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}

        {/* Placeholder/Thumbnail */}
        {!isPlaying && !showPromo && (
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
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10">
            <div className="flex items-center gap-1 sm:gap-2 bg-[#E31E24] text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white"></span>
              </span>
              LIVE
            </div>
          </div>
        )}

        {/* Play Button Overlay */}
        {!isPlaying && !showPromo && (
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

        {/* OK.ru Embed Player */}
        {isPlaying && !showPromo && currentStreamUrl?.includes('ok.ru') && (
          <iframe
            src={`https://ok.ru/videoembed/${currentStreamUrl.split('/video/')[1]}`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            frameBorder="0"
            title={title}
          />
        )}

        {/* Stream iframe - for non-streamable URLs */}
        {isPlaying && !showPromo && currentStreamUrl && 
         !currentStreamUrl.includes('ok.ru') && 
         !currentStreamUrl.includes('.m3u8') && 
         !currentStreamUrl.includes('.mpd') && 
         !currentStreamUrl.includes('.ts') &&
         !currentStreamUrl.includes('.mp4') &&
         !currentStreamUrl.includes('.mkv') &&
         !currentStreamUrl.includes('.webm') &&
         !currentStreamUrl.includes('/live/') &&
         !currentStreamUrl.includes('/stream/') &&
         currentStreamUrl !== "youtube" && (
          <iframe
            src={currentStreamUrl}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
            title={title}
          />
        )}

        {/* YouTube Player */}
        {isPlaying && !showPromo && currentStreamUrl === "youtube" && (
          <div 
            id="youtube-player"
            className="absolute inset-0 w-full h-full bg-black"
          />
        )}
        
        {/* Universal Video Player - supports all formats like VLC */}
        {isPlaying && !showPromo && (
          currentStreamUrl?.includes('.m3u8') || 
          currentStreamUrl?.includes('.mpd') || 
          currentStreamUrl?.includes('.ts') || 
          currentStreamUrl?.includes('.mp4') ||
          currentStreamUrl?.includes('.mkv') ||
          currentStreamUrl?.includes('.webm') ||
          currentStreamUrl?.includes('.flv') ||
          currentStreamUrl?.includes('/live/') ||
          currentStreamUrl?.includes('/stream/')
        ) && (
          <video
            ref={videoRef}
            className="video-js vjs-default-skin vjs-big-play-centered absolute inset-0 w-full h-full bg-black"
            playsInline
            muted={isMuted}
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