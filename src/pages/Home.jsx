import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, TrendingUp, Clock, ChevronLeft, Flame, Zap, Target, Shield, DollarSign, Landmark, Cpu, Trophy, Clapperboard, Globe, Heart, X } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import LivePlayer from "../components/news/LivePlayer";
import NewsCard from "../components/news/NewsCard";
import ReportersFeed from "../components/news/ReportersFeed";
import UpdatesFeed from "../components/news/UpdatesFeed";
import VideoHighlights from "../components/news/VideoHighlights";
import LiveStats from "../components/news/LiveStats";
import AutoNewsUpdater from "../components/news/AutoNewsUpdater";
import AutoChannelsUpdater from "../components/news/AutoChannelsUpdater";
import CurrencyStrip from "../components/header/CurrencyStrip";

export default function Home() {
  const [showRadioStations, setShowRadioStations] = useState(false);
  const [selectedChannel, setSelectedChannel] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedChannel') || 'all';
    }
    return 'all';
  });

  React.useEffect(() => {
    const handleChannelChange = (e) => {
      setSelectedChannel(e.detail);
    };
    window.addEventListener('channelChange', handleChannelChange);
    return () => window.removeEventListener('channelChange', handleChannelChange);
  }, []);

  const { data: channels = [] } = useQuery({
    queryKey: ['channels'],
    queryFn: () => base44.entities.NewsChannel.filter({ is_active: true }, 'name'),
    initialData: []
  });

  const defaultStreamUrl = "https://ok.ru/video/10508051226319";

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['news-articles', selectedChannel],
    queryFn: () => {
      if (selectedChannel === 'all') {
        return base44.entities.NewsArticle.list('-created_date', 50);
      }
      return base44.entities.NewsArticle.filter({ channel_id: selectedChannel }, '-created_date', 50);
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    initialData: []
  });

  const { data: liveStream } = useQuery({
    queryKey: ['live-stream'],
    queryFn: () => base44.entities.LiveStream.filter({ is_active: true }),
    initialData: []
  });

  const featuredArticle = articles.find(a => a.is_featured || a.is_breaking) || articles[0];
  const breakingNews = articles.filter(a => a.is_breaking);
  const regularNews = articles.filter(a => a.id !== featuredArticle?.id).slice(0, 8);
  const trendingNews = [...articles].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5);

  const activeLive = liveStream[0];
  const currentChannel = selectedChannel === 'all' ? null : channels.find(c => c.id === selectedChannel);
  const channelStreamUrl = currentChannel?.stream_url || defaultStreamUrl;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="w-full aspect-video rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
      );
      }

      const { data: radioChannels = [] } = useQuery({
      queryKey: ['radio-channels-fab'],
      queryFn: () => base44.entities.NewsChannel.filter({ is_active: true }, 'name'),
      initialData: []
      });

      const radioStations = radioChannels.filter(ch => 
      ch.stream_url?.includes('.mp3') || 
      ch.stream_url?.includes('.aac') || 
      ch.stream_url?.includes('icecast.audio')
      );

      return (
      <div className="space-y-0 sm:space-y-6 bg-black min-h-screen">
      <AutoNewsUpdater />
      <AutoChannelsUpdater />
      {/* Hero Section - Extended Live Player */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-4 -mx-0 sm:mx-0 px-0 sm:px-4">
        {/* Right Sidebar - Updates Feed */}
        <aside className="lg:col-span-2 hidden lg:block">
          <UpdatesFeed />
        </aside>

        {/* Center - Extended Live Player */}
        <div className="lg:col-span-8">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 sm:rounded-t-lg p-2 sm:p-3 flex items-center justify-between hidden sm:flex">
            <div className="flex items-center gap-3">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E31E24] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E31E24]"></span>
              </div>
              <h2 className="text-white text-lg font-bold">שידור חי</h2>
            </div>
            <CurrencyStrip activeLive={activeLive} />
          </div>
          <div className="relative">
            <LivePlayer 
              title={currentChannel?.name || activeLive?.title || "הרשת החדשה - שידור חי"}
              isLive={!!activeLive?.is_active}
              viewerCount={activeLive?.viewer_count || 3456}
              streamUrl={channelStreamUrl}
            />

            {/* Features Below Player */}
            <div className="hidden sm:grid grid-cols-3 gap-4 mt-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 shadow-2xl hover:shadow-red-500/20 transition-all duration-300 border border-gray-700 hover:border-red-500 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 to-[#E31E24] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Radio className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">שידור 24/7</h3>
                    <p className="text-xs text-gray-400">תמיד מעודכנים</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 border border-gray-700 hover:border-blue-500 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">עדכונים מהירים</h3>
                    <p className="text-xs text-gray-400">בזמן אמת</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 shadow-2xl hover:shadow-green-500/20 transition-all duration-300 border border-gray-700 hover:border-green-500 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">כיסוי מקיף</h3>
                    <p className="text-xs text-gray-400">מכל הזירות</p>
                  </div>
                </div>
              </motion.div>
            </div>
            </div>
            </div>

            {/* Left Sidebar - Reporters Feed */}
            <aside className="lg:col-span-2 hidden lg:block">
              <ReportersFeed />
            </aside>
            </section>

            {/* Mobile Only - Reporters Feed Below Player */}
            <section className="sm:hidden px-4 py-4">
              <ReportersFeed />
            </section>

            {/* Live Stats */}
            <LiveStats />



      {/* Category Navigation Bar */}
      <section className="bg-gray-900 rounded-xl shadow-2xl p-6 border border-gray-800 mx-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { label: "ביטחון", cat: "security", Icon: Shield, color: "from-orange-600 to-orange-700" },
            { label: "כלכלה", cat: "economy", Icon: DollarSign, color: "from-green-600 to-green-700" },
            { label: "פוליטיקה", cat: "politics", Icon: Landmark, color: "from-purple-600 to-purple-700" },
            { label: "טכנולוגיה", cat: "technology", Icon: Cpu, color: "from-blue-600 to-blue-700" },
            { label: "ספורט", cat: "sports", Icon: Trophy, color: "from-emerald-600 to-emerald-700" },
            { label: "בידור", cat: "entertainment", Icon: Clapperboard, color: "from-pink-600 to-pink-700" },
            { label: "עולם", cat: "world", Icon: Globe, color: "from-indigo-600 to-indigo-700" },
            { label: "בריאות", cat: "health", Icon: Heart, color: "from-red-600 to-red-700" },
          ].map(item => (
            <Link
              key={item.cat}
              to={createPageUrl(`Category?cat=${item.cat}`)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${item.color} hover:scale-105 active:scale-95 transition-all shadow-lg`}
            >
              <item.Icon size={18} />
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Video Highlights */}
      <VideoHighlights />

      {/* Latest News Grid */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#E31E24]" />
            <h2 className="text-xl font-bold text-white">חדשות אחרונות</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {regularNews.map((article, index) => (
            <NewsCard key={article.id} article={article} index={index} />
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white mx-4 border border-gray-800">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-[#E31E24]" />
          <h2 className="text-2xl font-bold">הכי נצפה עכשיו</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingNews.slice(0, 3).map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                to={createPageUrl(`Article?id=${article.id}`)}
                className="block group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl font-bold text-[#E31E24]">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-[#E31E24] transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                      {article.subtitle || article.content?.slice(0, 100)}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] rounded-2xl p-8 text-white text-center mx-4 shadow-2xl border border-red-900">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          הצטרפו למהפכה התקשורתית
        </h2>
        <p className="text-red-100 mb-6 max-w-2xl mx-auto">
          הרשת החדשה - ערוץ חדשות דיגיטלי מבוסס AI, המייצר תוכן במהירות ובאיכות ללא תחרות
        </p>
        <Link to={createPageUrl("Live")}>
          <Button className="bg-white text-[#E31E24] hover:bg-gray-100 px-8 py-6 text-lg font-bold rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all">
            <Radio className="w-5 h-5 ml-2" />
            צפו בשידור חי
          </Button>
        </Link>
      </section>

      {/* Floating Radio Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowRadioStations(!showRadioStations)}
        className="fixed bottom-24 left-6 z-[999] w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center hover:shadow-purple-500/50 transition-all"
      >
        <Radio className="w-8 h-8 text-white" />
      </motion.button>

      {/* Radio Stations Overlay */}
      <AnimatePresence>
        {showRadioStations && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl"
            onClick={() => setShowRadioStations(false)}
          >
            <div className="h-full overflow-y-auto p-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <motion.h2
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-4xl font-bold text-white flex items-center gap-3"
                  >
                    <Radio className="w-10 h-10 text-purple-500" />
                    תחנות רדיו
                  </motion.h2>
                  <Button
                    onClick={() => setShowRadioStations(false)}
                    size="icon"
                    className="bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12"
                  >
                    <X size={24} />
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {radioStations.map((station, index) => (
                    <motion.a
                      key={station.id}
                      href={createPageUrl("RadioStations")}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className="aspect-square rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-2xl transition-all relative overflow-hidden group cursor-pointer"
                      style={{ backgroundColor: station.color || '#E31E24' }}
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = createPageUrl("RadioStations");
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <span className="relative z-10 text-center px-3">{station.name}</span>
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
      );
      }