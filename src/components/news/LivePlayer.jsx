import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import mpegts from "mpegts.js";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, 
  Users, Radio, Settings, Download, Bookmark, 
  MessageCircle, Eye, Share2, Newspaper, TrendingUp,
  DollarSign, Trophy, Tv, Target, Moon, Sunrise
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import ShareButtons from "../shared/ShareButtons";
import { base44 } from "@/api/base44Client";




const DEFAULT_STREAM = "https://www.youtube.com/embed/pPRKdCHHlGI?autoplay=0&mute=1&rel=0";
const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

export default function LivePlayer({ 
  title = "שידור חי - הרשת החדשה",
  viewerCount = 0,
  isLive = true,
  thumbnailUrl = null,
  streamUrl
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(80);
  const [showControls, setShowControls] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [viewerReactions, setViewerReactions] = useState(1234);
  const [dynamicViewerCount, setDynamicViewerCount] = useState(viewerCount || 2847);
  const [ads, setAds] = useState([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [currentSlogan, setCurrentSlogan] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isWideAd, setIsWideAd] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [playerTitle, setPlayerTitle] = useState(title);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  const slogans = [
    "שידור חי 24/7 - החדשות שלכם",
    "כתבים בשטח - דיווח בזמן אמת",
    "צוות הכתבים שלנו פועל ללא הפסקה",
    "שעות של שידורים איכותיים",
    "הכתבים המובילים בישראל",
    "מייצרים תוכן. מייצרים חדשות",
    "הערוץ היחיד שאתם צריכים"
  ];

  const bannerAds = [
    { id: 1, image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c61500337_image.png", brand: "AWA Restaurant" },
    { id: 2, image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/cb296f8d5_image.png", brand: "ANNY Boutique Events" },
    { id: 3, image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/7ef43efd7_image.png", brand: "AWA Restaurant" },
    { id: 4, image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/13fcdb80b_image.png", brand: "TADIRAN" },
    { id: 5, image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/4829bca2e_image.png", brand: "H&M CAREERS" }
  ];

  const scheduleItems = [
    { time: "06:00", title: "חדשות הבוקר עם רונית ויוסי", Icon: Sunrise },
    { time: "08:00", title: "סקירת עיתונות עם דני", Icon: Newspaper },
    { time: "10:00", title: "פוליטיקה היום עם שרון", Icon: Users },
    { time: "12:00", title: "מהדורת הצהריים", Icon: Tv },
    { time: "14:00", title: "כלכלה ושוק ההון", Icon: DollarSign },
    { time: "16:00", title: "ספורט בשידור חי", Icon: Trophy },
    { time: "18:00", title: "חדשות הערב המרכזיות", Icon: Radio },
    { time: "20:00", title: "ניתוח מעמיק עם המומחים", Icon: Target },
    { time: "22:00", title: "סיכום יומי והצצה למחר", Icon: Moon }
  ];

  const currentStreamUrl = streamUrl || DEFAULT_STREAM;

  // Rotate ads and toggle wide view
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % bannerAds.length);
      setIsWideAd((prev) => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  // Typewriter animation for slogans
  useEffect(() => {
    const currentText = slogans[currentSlogan];
    let charIndex = 0;
    setDisplayedText("");

    const typeInterval = setInterval(() => {
      if (charIndex < currentText.length) {
        setDisplayedText(currentText.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setCurrentSlogan((prev) => (prev + 1) % slogans.length);
        }, 3000);
      }
    }, 80);

    return () => clearInterval(typeInterval);
  }, [currentSlogan]);

  // Listen for playVideo events from generated videos
  useEffect(() => {
    const handlePlayVideo = (event) => {
      const { url, title: videoTitle, autoPlay } = event.detail;
      setCurrentVideoUrl(url);
      setPlayerTitle(videoTitle || title);
      setIsPlaying(autoPlay || true);
      setIsMuted(false);
      setVolume(80);
    };

    window.addEventListener('playVideo', handlePlayVideo);
    return () => window.removeEventListener('playVideo', handlePlayVideo);
  }, [title]);

  // YouTube IFrame API for controlling playback
    useEffect(() => {
      if ((currentStreamUrl !== "youtube" && !currentVideoUrl) || !isPlaying) return; // Only load for default YouTube stream

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
              autoplay: 0,
              controls: 1,
              rel: 0,
              modestbranding: 1,
              mute: 1,
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
    if (!videoRef.current || currentStreamUrl === "youtube" || !isPlaying) return;

    // Skip for embedded players
    if (currentStreamUrl?.includes('ok.ru') || currentStreamUrl?.includes('youtube.com') || currentStreamUrl?.includes('youtu.be')) {
      return;
    }

    const isTS = currentStreamUrl?.includes('.ts') || currentStreamUrl?.includes('mpegts') || currentStreamUrl?.includes('/live/');
    const isFLV = currentStreamUrl?.includes('.flv');
    const isHLS = currentStreamUrl?.includes('.m3u8');
    const isDASH = currentStreamUrl?.includes('.mpd');
    const isMP4 = currentStreamUrl?.includes('.mp4');

    // Use mpegts.js for MPEG-TS and FLV (better for live TV)
    if ((isTS || isFLV) && mpegts.isSupported()) {
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
        liveBufferLatencyMinRemain: 0.3
      });

      player.attachMediaElement(videoRef.current);
      player.load();
      player.play().catch(err => console.log('Play error:', err));

      playerRef.current = player;

      player.on(mpegts.Events.ERROR, (errType, errDetail) => {
        console.log('mpegts.js error:', errType, errDetail);
        // Auto-retry on network errors
        if (errType === mpegts.ErrorTypes.NETWORK_ERROR) {
          setTimeout(() => {
            player.unload();
            player.load();
            player.play();
          }, 2000);
        }
      });

      return () => {
        if (playerRef.current) {
          try {
            playerRef.current.pause();
            playerRef.current.unload();
            playerRef.current.detachMediaElement();
            playerRef.current.destroy();
          } catch (e) {
            console.log('Cleanup error:', e);
          }
          playerRef.current = null;
        }
      };
    }

    // Use video.js for HLS/DASH/MP4
    if (isHLS || isDASH || isMP4) {
      const player = videojs(videoRef.current, {
        controls: false,
        autoplay: false,
        muted: true,
        preload: 'auto',
        liveui: true,
        html5: {
          vhs: {
            withCredentials: false,
            overrideNative: true,
            enableLowInitialPlaylist: true,
            smoothQualityChange: true
          }
        }
      });

      playerRef.current = player;

      player.src({
        src: currentStreamUrl,
        type: isDASH ? 'application/dash+xml' : isHLS ? 'application/x-mpegURL' : 'video/mp4'
      });

      player.on('error', () => {
        console.log('Video.js error:', player.error());
      });

      player.ready(function() {
        this.play().catch(err => console.log('Play error:', err));
      });

      return () => {
        if (playerRef.current) {
          try {
            playerRef.current.dispose();
          } catch (e) {
            console.log('Dispose error:', e);
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
      className="relative bg-gradient-to-br from-black via-[#0a0000] to-black sm:rounded-2xl overflow-hidden shadow-2xl group border-2 border-[#E31E24]/30"
      style={{
        boxShadow: '0 0 40px rgba(227, 30, 36, 0.4), inset 0 0 30px rgba(227, 30, 36, 0.1)'
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Container */}
      <div className="relative w-full aspect-[9/16] sm:aspect-video rounded-t-2xl overflow-hidden">
        {/* Video Player - Shows generated videos or YouTube */}
          {currentVideoUrl ? (
            <video
              src={currentVideoUrl}
              className="absolute inset-0 w-full h-full z-20 bg-black"
              controls
              autoPlay
              muted={isMuted}
              controlsList="nodownload"
            />
          ) : (
            <iframe
              src={`https://www.youtube.com/embed/pPRKdCHHlGI?autoplay=0&mute=0&rel=0&enablejsapi=1`}
              className="absolute inset-0 w-full h-full z-20"
              allow="fullscreen; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              frameBorder="0"
              title={playerTitle}
            />
          )}

        {/* Frame Border - Covering YouTube Elements */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          {/* Top Frame */}
           <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 bg-black flex flex-col px-2 sm:px-6 py-1 sm:py-2"
             style={{
               boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)'
             }}
           >
             {/* Logo and Title Row */}
             <div className="flex items-center justify-between mb-0.5 sm:mb-1 gap-1 sm:gap-3">
               <motion.img 
                 src={LOGO_URL}
                 alt="הרשת החדשה"
                 className="h-12 sm:h-16 w-auto drop-shadow-2xl"
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
              <div className="text-right flex-1 overflow-hidden min-w-0">
                <div className="text-white font-bold text-sm sm:text-xl drop-shadow-lg mb-0.5 leading-tight hidden sm:block">הרשת החדשה</div>
                <div className="text-[#E31E24] font-bold text-xs sm:text-base tracking-wide break-words line-clamp-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)', letterSpacing: '0.5px' }}>
                  {currentVideoUrl ? playerTitle : displayedText}
                  <span className="animate-pulse ml-1">|</span>
                </div>
              </div>
              {ads.length > 0 && (
                <div className="bg-gradient-to-r from-yellow-600/80 via-yellow-500/80 to-yellow-600/80 backdrop-blur-sm overflow-hidden rounded-lg flex-1 max-w-[200px] sm:max-w-xs h-6 sm:h-8 border border-yellow-400/50 shadow-lg" style={{ boxShadow: '0 0 15px rgba(234, 179, 8, 0.5)' }}>
                  <motion.div
                    className="flex items-center h-full gap-1 sm:gap-3 px-2"
                    animate={{ x: ["0%", "-100%"] }}
                    transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                  >
                    {Array(6).fill(ads).flat().map((ad, idx) => (
                      <div 
                        key={`topAd-${idx}`}
                        className="flex-shrink-0 relative group h-full flex items-center"
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="relative h-full px-1.5 rounded overflow-hidden flex items-center bg-white/20 backdrop-blur-sm"
                        >
                          <img 
                            src={ad.image} 
                            alt={ad.brand}
                            className="h-full w-auto object-contain max-w-[120px]"
                            loading="eager"
                          />
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-white via-white to-transparent opacity-30"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                            style={{ mixBlendMode: 'screen' }}
                          />
                        </motion.div>
                      </div>
                    ))}
                  </motion.div>
                </div>
              )}
            </div>


          </div>

          {/* Bottom Frame */}
           <div className="absolute bottom-0 left-0 right-0 h-14 sm:h-16 bg-black flex items-center justify-center px-2 sm:px-6"
             style={{
               boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.8)'
             }}
           >
             <div className="flex items-center gap-2 sm:gap-4 w-full justify-center flex-wrap">
               <div className="flex items-center gap-2 bg-[#E31E24]/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-[#E31E24]/50">
                 <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E31E24] opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-[#E31E24]"></span>
                 </span>
                 <span className="text-white font-bold text-sm sm:text-base">שידור חי</span>
               </div>
               <div className="text-white/80 font-bold text-xs sm:text-sm hidden sm:block">הערוץ היחיד שאתם צריכים</div>
             </div>
           </div>

          {/* Left Frame */}
          <div className="absolute top-16 sm:top-20 bottom-14 sm:bottom-16 left-0 w-8 sm:w-12 bg-black"
            style={{
              boxShadow: '4px 0 20px rgba(0, 0, 0, 0.8)'
            }}
          />

          {/* Right Frame */}
          <div className="absolute top-16 sm:top-20 bottom-14 sm:bottom-16 right-0 w-8 sm:w-12 bg-black"
            style={{
              boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.8)'
            }}
          />

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
          <motion.div 
            className="absolute top-16 sm:top-20 right-2 sm:right-6 z-30"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-[#E31E24] to-[#B91C1C] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg border border-red-400/50"
              style={{
                boxShadow: '0 0 20px rgba(227, 30, 36, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.1)'
              }}
            >
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-white"></span>
              </span>
              <span className="font-extrabold tracking-wide">LIVE</span>
            </div>
          </motion.div>
        )}

        {/* Giant Audio Button - Always Visible */}
        {isPlaying && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMuted(!isMuted)}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 group"
          >
            <div className="relative">
              {/* Multi-layer Pulsing Rings */}
              <span className="absolute inset-0 rounded-full bg-yellow-500/50 animate-ping" style={{ animationDuration: '1.5s' }} />
              <span className="absolute inset-0 rounded-full bg-yellow-500/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
              <span className="absolute inset-0 rounded-full bg-yellow-500/20 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '1s' }} />

              {/* Giant Main Button */}
              <div className="relative px-16 py-12 sm:px-24 sm:py-16 rounded-[3rem] bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 backdrop-blur-2xl flex flex-col items-center gap-6 shadow-2xl border-8 border-yellow-200/60 group-hover:border-yellow-100/90 transition-all animate-pulse"
                style={{
                  boxShadow: '0 0 100px rgba(234, 179, 8, 1), inset 0 0 60px rgba(255, 255, 255, 0.3), 0 20px 80px rgba(0, 0, 0, 0.7)'
                }}
              >
                {isMuted ? (
                  <VolumeX className="w-20 h-20 sm:w-32 sm:h-32 text-black drop-shadow-2xl" strokeWidth={4} />
                ) : (
                  <Volume2 className="w-20 h-20 sm:w-32 sm:h-32 text-black drop-shadow-2xl" strokeWidth={4} />
                )}
                <span className="text-black text-4xl sm:text-6xl font-black tracking-wider drop-shadow-xl text-center">
                  {isMuted ? 'הפעל קול' : 'השתק קול'}
                </span>
                <span className="text-black text-xl sm:text-2xl font-bold">👆 לחץ כאן</span>
              </div>
            </div>
          </motion.button>
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
              src={LOGO_URL}
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

        {/* Mako Embed Player */}
        {isPlaying && !showPromo && currentStreamUrl?.includes('mako.co.il') && (
          <iframe
            src="https://www.mako.co.il/AjaxPage?jspName=embedHTML5video.jsp&galleryChannelId=3bf5c3a8e967f510VgnVCM2000002a0c10acRCRD&videoChannelId=8bf955222beab610VgnVCM100000700a10acRCRD&vcmid=1e2258089b67f510VgnVCM2000002a0c10acRCRD"
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
         !currentStreamUrl.includes('mako.co.il') &&
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

      {/* Ads Carousel - Top Left */}
      <div className={`absolute top-16 sm:top-20 left-2 sm:left-6 z-30 h-14 sm:h-20 transition-all duration-500 ${isWideAd ? 'w-40 sm:w-80' : 'w-32 sm:w-56'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentAdIndex}-${isWideAd}`}
            initial={{ opacity: 0, x: -50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative rounded-xl overflow-hidden shadow-2xl h-full w-full"
            style={{
              border: '2px solid rgba(227, 30, 36, 0.6)',
              boxShadow: '0 8px 32px rgba(227, 30, 36, 0.4), inset 0 1px 0 rgba(227, 30, 36, 0.3)',
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(227, 30, 36, 0.2) 100%)',
              backdropFilter: 'blur(16px)'
            }}
          >
            {/* Ad Image */}
            <img 
              src={bannerAds[currentAdIndex].image}
              alt={bannerAds[currentAdIndex].brand}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showControls || !isPlaying ? 1 : 0, y: 0 }}
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 sm:p-4 backdrop-blur-sm border-t border-[#E31E24]/20"
      >
        {/* Progress Bar (simulated for live) */}
        <div className="w-full h-1 sm:h-1.5 bg-gray-800/80 rounded-full mb-3 sm:mb-4 overflow-hidden shadow-inner border border-gray-700/50">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#E31E24] via-red-500 to-[#E31E24]"
            animate={{ 
              width: isPlaying ? "100%" : "0%",
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ 
              width: { duration: 0.3 },
              backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" }
            }}
            style={{
              backgroundSize: '200% 100%',
              boxShadow: '0 0 15px rgba(227, 30, 36, 0.8)'
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-1 sm:gap-0">
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Play/Pause */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:bg-[#E31E24]/40 bg-black/40 backdrop-blur-sm h-9 w-9 sm:h-11 sm:w-11 rounded-xl border border-[#E31E24]/30 transition-all"
              >
                {isPlaying ? <Pause size={18} className="sm:w-6 sm:h-6" /> : <Play size={18} className="sm:w-6 sm:h-6" />}
              </Button>
            </motion.div>

            {/* Volume */}
            <div className="flex items-center gap-1 sm:gap-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:bg-[#E31E24]/40 bg-black/40 backdrop-blur-sm h-9 w-9 sm:h-11 sm:w-11 rounded-xl border border-[#E31E24]/30 transition-all"
                >
                  {isMuted || volume === 0 ? <VolumeX size={16} className="sm:w-5 sm:h-5" /> : <Volume2 size={16} className="sm:w-5 sm:h-5" />}
                </Button>
              </motion.div>
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
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-lg border border-[#E31E24]/30">
              <span className="text-white text-xs sm:text-sm font-bold flex items-center gap-2">
                {isLive && <span className="text-[#E31E24] animate-pulse">●</span>}
                {isLive ? "שידור חי" : "00:00 / 00:00"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Reactions */}
            <motion.button
              onClick={() => setViewerReactions(viewerReactions + 1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-sm hover:bg-[#E31E24]/40 rounded-lg text-white text-xs font-bold transition-all border border-[#E31E24]/30"
            >
              <MessageCircle size={16} />
              <span>{viewerReactions}</span>
            </motion.button>

            {/* Bookmark */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`text-white hover:bg-[#E31E24]/40 bg-black/40 backdrop-blur-sm h-9 w-9 sm:h-11 sm:w-11 rounded-xl border border-[#E31E24]/30 transition-all hidden sm:flex ${isBookmarked ? 'text-yellow-400' : ''}`}
              >
                <Bookmark size={16} className="sm:w-5 sm:h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
              </Button>
            </motion.div>

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
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-[#E31E24]/40 bg-black/40 backdrop-blur-sm h-9 w-9 sm:h-11 sm:w-11 rounded-xl border border-[#E31E24]/30 transition-all hidden md:flex"
              >
                <Settings size={16} className="sm:w-5 sm:h-5" />
              </Button>
            </motion.div>

            {/* Fullscreen */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-[#E31E24]/40 bg-black/40 backdrop-blur-sm h-9 w-9 sm:h-11 sm:w-11 rounded-xl border border-[#E31E24]/30 transition-all"
              >
                <Maximize size={16} className="sm:w-5 sm:h-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}