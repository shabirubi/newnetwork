import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Radio, TrendingUp, Clock, ChevronLeft, Flame, Zap, Target, Shield, DollarSign, Landmark, Cpu, Trophy, Clapperboard, Globe, Heart, Tv } from "lucide-react";
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
import TikTokNewsFeed from "../components/news/TikTokNewsFeed";
import AIAnnouncer from "../components/news/AIAnnouncer";
import TVAnchor from "../components/news/TVAnchor";
import VODModal from "../components/vod/VODModal";

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
    refetchOnMount: false,
    initialData: [],
    placeholderData: (prev) => prev
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

  // Don't block render on loading - show content as it loads

  return (
    <div className="space-y-0 sm:space-y-6">
      <AutoNewsUpdater />
      <AutoChannelsUpdater />
      
      {/* VOD Floating Button - Rainbow Effect */}
      <motion.a
        href={createPageUrl("VOD")}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: 1, 
          scale: 1
        }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-24 left-4 sm:left-6 z-50 group flex flex-col items-center gap-1"
      >
        {/* Rainbow Background Effect */}
        <motion.div
          animate={{
            background: [
              "linear-gradient(45deg, #ff0000, #ff7700)",
              "linear-gradient(45deg, #ff7700, #ffdd00)",
              "linear-gradient(45deg, #ffdd00, #00ff00)",
              "linear-gradient(45deg, #00ff00, #0088ff)",
              "linear-gradient(45deg, #0088ff, #8800ff)",
              "linear-gradient(45deg, #8800ff, #ff00ff)",
              "linear-gradient(45deg, #ff00ff, #ff0000)",
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full blur-3xl opacity-70 w-48 h-48 sm:w-40 sm:h-40"
        />
        
        {/* Logo */}
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png"
          alt="VOD"
          className="relative w-36 h-36 sm:w-28 sm:h-28 drop-shadow-2xl"
        />
        
        {/* Text Button */}
        <div className="relative bg-gradient-to-br from-red-600 via-purple-600 to-blue-600 px-4 py-2 rounded-xl shadow-lg border-2 border-white/30">
          <div className="text-center">
            <div className="text-white text-xs font-bold leading-tight">
              עולם התוכן של
            </div>
            <div className="text-white text-xs font-bold leading-tight">
              הרשת החדשה
            </div>
          </div>
        </div>
        </motion.a>
      {/* Hero Section - TikTok News Feed */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-3 -mx-0 sm:mx-0 px-0 sm:px-4">
        {/* Right Sidebar - Updates Feed */}
        <aside className="lg:col-span-2 hidden lg:block">
          <UpdatesFeed />
        </aside>

        {/* Center - TikTok News Feed */}
        <div className="lg:col-span-8">
          <TikTokNewsFeed articles={articles} />
        </div>

        {/* Left Sidebar - Reporters Feed */}
        <aside className="lg:col-span-2 hidden lg:block">
          <ReportersFeed />
        </aside>
      </section>

      {/* Live Player Section */}
      <section className="px-0 sm:px-4">
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
        </div>
      </section>

      {/* All News Section */}
      {articles.length > 0 && (
        <section className="px-4 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#E31E24]" />
              <h2 className="text-xl font-bold dark:text-white">חדשות אחרונות</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.map((article, index) => (
              <NewsCard key={article.id} article={article} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Only - Reporters Feed Below Player */}
      <section className="sm:hidden px-4 py-4">
        <ReportersFeed />
      </section>


      {/* CTA Section */}
      <section className="bg-[#E31E24] rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          הצטרפו למהפכה התקשורתית
        </h2>
        <p className="text-red-100 mb-6 max-w-2xl mx-auto">
          הרשת החדשה - ערוץ חדשות דיגיטלי מבוסס AI, המייצר תוכן במהירות ובאיכות ללא תחרות
        </p>
        <Link to={createPageUrl("Live")}>
          <Button className="bg-white text-[#E31E24] hover:bg-gray-100 px-8 py-6 text-lg font-bold rounded-full">
            <Radio className="w-5 h-5 ml-2" />
            צפו בשידור חי
          </Button>
        </Link>
      </section>
    </div>
  );
}