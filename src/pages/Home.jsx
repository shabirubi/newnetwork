import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Radio, Play, Pause, Volume2, VolumeX, Maximize, 
  ChevronDown, Search, Menu, X, Flame, 
  Shield, TrendingUp, Globe, Heart, Share2,
  MessageCircle, Bookmark, Eye, Settings, Film, Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import AutoNewsUpdater from "../components/news/AutoNewsUpdater";
import AutoChannelsUpdater from "../components/news/AutoChannelsUpdater";
import { Button } from "@/components/ui/button";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/a6c94b22a_image.png";

export default function Home() {
  const [currentView, setCurrentView] = useState('player'); // 'player' or 'feed'
  const [showMenu, setShowMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [showControls, setShowControls] = useState(true);
  const [currentFeedIndex, setCurrentFeedIndex] = useState(0);
  const [creatingVideo, setCreatingVideo] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedChannel') || 'all';
    }
    return 'all';
  });

  const { data: channels = [] } = useQuery({
    queryKey: ['channels'],
    queryFn: () => base44.entities.NewsChannel.filter({ is_active: true }, 'name'),
    initialData: []
  });

  const { data: articles = [] } = useQuery({
    queryKey: ['news-articles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 50),
    initialData: []
  });

  const { data: liveStream = [] } = useQuery({
    queryKey: ['live-stream'],
    queryFn: () => base44.entities.LiveStream.filter({ is_active: true }),
    initialData: []
  });

  const defaultStreamUrl = "https://ok.ru/video/10508051226319";
  const currentChannel = selectedChannel === 'all' ? null : channels.find(c => c.id === selectedChannel);
  const channelStreamUrl = currentChannel?.stream_url || defaultStreamUrl;
  const activeLive = liveStream[0];

  // Vertical scroll for news feed
  useEffect(() => {
    if (currentView === 'feed') {
      const handleWheel = (e) => {
        if (e.deltaY > 0 && currentFeedIndex < articles.length - 1) {
          setCurrentFeedIndex(prev => prev + 1);
        } else if (e.deltaY < 0 && currentFeedIndex > 0) {
          setCurrentFeedIndex(prev => prev - 1);
        }
      };
      window.addEventListener('wheel', handleWheel);
      return () => window.removeEventListener('wheel', handleWheel);
    }
  }, [currentView, currentFeedIndex, articles.length]);

  const categoryColors = {
    breaking: 'from-red-500 via-orange-500 to-pink-500',
    security: 'from-orange-500 via-red-500 to-yellow-500',
    economy: 'from-green-500 via-emerald-500 to-teal-500',
    politics: 'from-purple-500 via-pink-500 to-red-500',
    technology: 'from-blue-500 via-cyan-500 to-indigo-500',
    sports: 'from-emerald-500 via-green-500 to-lime-500',
    entertainment: 'from-pink-500 via-fuchsia-500 to-purple-500',
    world: 'from-indigo-500 via-blue-500 to-cyan-500',
    health: 'from-teal-500 via-cyan-500 to-blue-500'
  };

  const handleCreateVideo = async () => {
    if (!articles[currentFeedIndex]) return;
    
    setCreatingVideo(true);
    try {
      const article = articles[currentFeedIndex];
      const text = `${article.title}. ${article.subtitle || ''} ${article.content || ''}`.substring(0, 1000);
      
      const result = await base44.functions.generateDIDVideo({ text });

      await base44.entities.TalkingHeadVideo.create({
        article_id: article.id,
        reporter_name: "כתב הרשת החדשה",
        video_url: result.video_url,
        talk_id: result.talk_id,
        status: "completed",
        duration: 30,
        presentation_text: article.title,
        views: 0,
        is_featured: true,
      });

      alert("וידאו נוצר בהצלחה!");
    } catch (error) {
      console.error("שגיאה:", error);
      alert("שגיאה ביצירת הוידאו");
    } finally {
      setCreatingVideo(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <AutoNewsUpdater />
      <AutoChannelsUpdater />

      {/* Main Player View */}
      <AnimatePresence mode="wait">
        {currentView === 'player' && (
          <motion.div
            key="player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {/* Live Stream Player */}
            <div className="relative w-full h-full bg-black">
              {/* Embedded Player */}
              {channelStreamUrl?.includes('ok.ru') && (
                <iframe
                  src={`https://ok.ru/videoembed/${channelStreamUrl.split('/video/')[1]}`}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              )}

              {/* Gradient Overlay Top */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />
              
              {/* Gradient Overlay Bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/90 to-transparent z-10 pointer-events-none" />

              {/* Top Bar */}
              <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                  >
                    <Search className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                  >
                    <Menu className="w-6 h-6 text-white" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 px-3 py-1.5 rounded-full shadow-lg shadow-red-500/50 bg-[length:200%_200%] animate-[rainbow-flow_3s_ease_infinite]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                    <span className="text-white text-sm font-bold">LIVE</span>
                  </div>
                  <img src={LOGO_URL} alt="לוגו" className="h-12 w-auto" />
                </div>
              </div>

              {/* Sidebar Navigation */}
              <AnimatePresence>
                {showSidebar && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30"
                      onClick={() => setShowSidebar(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, x: 300 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 300 }}
                      className="absolute top-0 right-0 bottom-0 w-80 bg-black/90 backdrop-blur-xl z-40 p-6 overflow-y-auto border-l border-white/10"
                    >
                      <button
                        onClick={() => setShowSidebar(false)}
                        className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>

                      <div className="mt-12 space-y-2">
                        {[
                          { label: "חדשות חמות", cat: "breaking", icon: Flame, color: "text-red-500" },
                          { label: "ביטחון", cat: "security", icon: Shield, color: "text-orange-500" },
                          { label: "כלכלה", cat: "economy", icon: TrendingUp, color: "text-green-500" },
                          { label: "עולם", cat: "world", icon: Globe, color: "text-blue-500" },
                          { label: "בריאות", cat: "health", icon: Heart, color: "text-pink-500" }
                        ].map(item => (
                          <Link
                            key={item.cat}
                            to={createPageUrl(`Category?cat=${item.cat}`)}
                            onClick={() => setShowSidebar(false)}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                          >
                            <item.icon className={`w-6 h-6 ${item.color} group-hover:scale-110 transition-transform`} />
                            <span className="text-white font-medium">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Search Menu */}
              <AnimatePresence>
                {showMenu && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30"
                      onClick={() => setShowMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      className="absolute top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-black/90 backdrop-blur-xl z-40 p-6 rounded-2xl border border-white/10"
                    >
                      <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="חפש חדשות, קטגוריות..."
                          className="w-full bg-white/10 text-white placeholder-gray-400 rounded-xl px-12 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
                          autoFocus
                        />
                        <button
                          onClick={() => setShowMenu(false)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/10 hover:bg-white/20"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Center Info */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center pointer-events-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-black/40 backdrop-blur-md rounded-2xl px-8 py-6 space-y-4"
                >
                  <h1 className="text-white text-2xl sm:text-4xl font-bold mb-2">
                    {currentChannel?.name || "הרשת החדשה"}
                  </h1>
                  <div className="flex items-center justify-center gap-2 text-white/80">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{activeLive?.viewer_count?.toLocaleString() || '3,456'} צופים</span>
                  </div>
                  <Button
                    onClick={handleCreateVideo}
                    disabled={creatingVideo}
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold px-8 py-3 rounded-xl mt-4"
                  >
                    {creatingVideo ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        יוצר...
                      </>
                    ) : (
                      <>
                        <Film className="w-4 h-4 mr-2" />
                        יצור וידאו
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>

              {/* Bottom Controls */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: showControls ? 1 : 0 }}
                className="absolute bottom-0 left-0 right-0 z-20 p-6"
              >
                <div className="flex items-center justify-between gap-4 mb-4">
                  {/* Left Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white" />
                      )}
                    </button>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-6 h-6 text-white" />
                      ) : (
                        <Volume2 className="w-6 h-6 text-white" />
                      )}
                    </button>
                  </div>

                  {/* Right Controls */}
                  <div className="flex items-center gap-3">
                    <button className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <Share2 className="w-6 h-6 text-white" />
                    </button>
                    <button className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <Bookmark className="w-6 h-6 text-white" />
                    </button>
                    <button className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <Maximize className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>

                {/* Switch to Feed Button */}
                <button
                  onClick={() => setCurrentView('feed')}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 to-pink-500 text-white font-bold text-lg shadow-2xl hover:shadow-pink-500/50 transition-all flex items-center justify-center gap-3 bg-[length:200%_200%] animate-[rainbow-flow_5s_ease_infinite]"
                >
                  <Flame className="w-6 h-6 animate-pulse" />
                  חדשות מתפרצות
                  <ChevronDown className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* News Feed View */}
        {currentView === 'feed' && (
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute inset-0 overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {articles[currentFeedIndex] && (
                <motion.div
                  key={currentFeedIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  {/* Background Image with Gradient */}
                  <div className="absolute inset-0">
                    {articles[currentFeedIndex].image_url ? (
                      <img
                        src={articles[currentFeedIndex].image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${categoryColors[articles[currentFeedIndex].category] || 'from-gray-800 to-gray-900'}`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  </div>

                  {/* Top Bar */}
                  <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
                    <button
                      onClick={() => setCurrentView('player')}
                      className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>

                    <div className="flex items-center gap-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 px-4 py-2 rounded-full shadow-lg shadow-orange-500/50 bg-[length:200%_200%] animate-[rainbow-flow_3s_ease_infinite]">
                      <Flame className="w-4 h-4 text-white animate-pulse" />
                      <span className="text-white text-sm font-bold">חדש</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 p-6 space-y-4">
                    {/* Category Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md">
                      <span className="text-white text-sm font-bold">
                        {articles[currentFeedIndex].category === 'breaking' && 'חדשות חמות'}
                        {articles[currentFeedIndex].category === 'security' && 'ביטחון'}
                        {articles[currentFeedIndex].category === 'economy' && 'כלכלה'}
                        {articles[currentFeedIndex].category === 'politics' && 'פוליטיקה'}
                        {articles[currentFeedIndex].category === 'technology' && 'טכנולוגיה'}
                        {articles[currentFeedIndex].category === 'sports' && 'ספורט'}
                        {articles[currentFeedIndex].category === 'entertainment' && 'בידור'}
                        {articles[currentFeedIndex].category === 'world' && 'עולם'}
                        {articles[currentFeedIndex].category === 'health' && 'בריאות'}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-white text-3xl sm:text-5xl font-bold leading-tight">
                      {articles[currentFeedIndex].title}
                    </h2>

                    {/* Subtitle */}
                    {articles[currentFeedIndex].subtitle && (
                      <p className="text-white/90 text-lg sm:text-xl">
                        {articles[currentFeedIndex].subtitle}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <Link
                        to={createPageUrl(`Article?id=${articles[currentFeedIndex].id}`)}
                        className="flex-1 py-4 rounded-2xl bg-white text-black font-bold text-center hover:bg-gray-100 transition-colors"
                      >
                        קרא עוד
                      </Link>
                      <button className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                        <Share2 className="w-6 h-6 text-white" />
                      </button>
                      <button className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </button>
                    </div>

                    {/* Navigation Dots */}
                    <div className="flex items-center justify-center gap-2 py-4">
                      {articles.slice(0, 10).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentFeedIndex(idx)}
                          className={`h-1.5 rounded-full transition-all ${
                            idx === currentFeedIndex
                              ? 'w-8 bg-white'
                              : 'w-1.5 bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Swipe Indicators */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-32 z-10 flex flex-col items-center gap-2 text-white/60">
                    {currentFeedIndex > 0 && (
                      <motion.div
                        animate={{ y: [-5, 5, -5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ChevronDown className="w-8 h-8 rotate-180" />
                      </motion.div>
                    )}
                    {currentFeedIndex < articles.length - 1 && (
                      <motion.div
                        animate={{ y: [-5, 5, -5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ChevronDown className="w-8 h-8" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}