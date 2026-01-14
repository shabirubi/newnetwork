import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Radio, TrendingUp, Clock, ChevronLeft, Flame, Zap, Target, Shield, DollarSign, Landmark, Cpu, Trophy, Clapperboard, Globe, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Search } from "lucide-react";
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
import TikTokNewsFeed from "../components/news/TikTokNewsFeed";

export default function Home() {
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

  return (
    <div className="space-y-0">
      <AutoNewsUpdater />
      <AutoChannelsUpdater />
      
      {/* Hero Section - Channel 12 Style */}
      <section className="relative min-h-[80vh] bg-gradient-to-br from-[#0a0a1f] via-[#1a1a3e] to-[#0d0d1f] overflow-hidden">
        {/* Animated Background Circles */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#E31E24]/20 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-3xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/a44ef2558_212.png"
              alt="הרשת החדשה"
              className="h-32 sm:h-48 w-auto mx-auto drop-shadow-2xl"
            />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4 mb-8"
          >
            <h1 className="text-4xl sm:text-6xl font-bold text-white">
              הרשת החדשה שידור חי
            </h1>
            <p className="text-xl sm:text-2xl text-purple-300 font-medium">
              הטלוויזיה הדיגיטלית של ישראל
            </p>
          </motion.div>

          {/* Watch Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link to={createPageUrl("Live")}>
              <Button className="bg-white hover:bg-gray-100 text-black text-lg px-8 py-6 rounded-full font-bold shadow-2xl flex items-center gap-3">
                <Radio size={24} />
                לצפייה
              </Button>
            </Link>
          </motion.div>

          {/* LIVE Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="absolute top-8 left-8 flex items-center gap-2 bg-[#E31E24] px-4 py-2 rounded-full"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <span className="text-white font-bold">LIVE</span>
          </motion.div>
        </div>
      </section>

      {/* Featured Content Section */}
      <section className="bg-gradient-to-b from-[#0a0a1f] to-gray-50 dark:to-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8">תוכניות מומלצות</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {regularNews.slice(0, 8).map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Link to={createPageUrl(`Article?id=${article.id}`)}>
                  <div className="group relative rounded-xl overflow-hidden aspect-video bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg hover:shadow-2xl transition-all">
                    {article.image_url ? (
                      <img 
                        src={article.image_url} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Radio className="w-12 h-12 text-[#E31E24]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white text-sm font-bold line-clamp-2">{article.title}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <UpdatesFeed />
          <ReportersFeed />
        </div>

        <LiveStats />

        {/* Category Navigation Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { label: "ביטחון", cat: "security", Icon: Shield, color: "hover:bg-orange-50 hover:text-orange-700" },
              { label: "כלכלה", cat: "economy", Icon: DollarSign, color: "hover:bg-green-50 hover:text-green-700" },
              { label: "פוליטיקה", cat: "politics", Icon: Landmark, color: "hover:bg-purple-50 hover:text-purple-700" },
              { label: "טכנולוגיה", cat: "technology", Icon: Cpu, color: "hover:bg-blue-50 hover:text-blue-700" },
              { label: "ספורט", cat: "sports", Icon: Trophy, color: "hover:bg-emerald-50 hover:text-emerald-700" },
              { label: "בידור", cat: "entertainment", Icon: Clapperboard, color: "hover:bg-pink-50 hover:text-pink-700" },
              { label: "עולם", cat: "world", Icon: Globe, color: "hover:bg-indigo-50 hover:text-indigo-700" },
              { label: "בריאות", cat: "health", Icon: Heart, color: "hover:bg-red-50 hover:text-red-700" },
            ].map(item => (
              <Link
                key={item.cat}
                to={createPageUrl(`Category?cat=${item.cat}`)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 transition-all ${item.color} dark:hover:bg-opacity-20`}
              >
                <item.Icon size={18} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* TikTok Style News Feed */}
        <TikTokNewsFeed articles={articles} />
      </section>
    </div>
  );
}