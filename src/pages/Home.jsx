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
    <div className="space-y-0 sm:space-y-6">
      <AutoNewsUpdater />
      <AutoChannelsUpdater />
      {/* Hero Section - Full Width Live Player */}
      <section className="px-0">
        {/* Center - Full Width Live Player */}
        <div className="sm:mx-4 sm:mb-6">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 sm:rounded-t-[15px] p-2 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E31E24] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E31E24]"></span>
              </div>
              <h2 className="text-white text-xl font-bold">שידור חי - מערכת שליטה</h2>
            </div>
            
            {/* Search Box */}
            <div className="relative hidden sm:block ml-4">
              <input
                type="text"
                placeholder="חיפוש..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    window.location.href = createPageUrl(`Archive?search=${encodeURIComponent(e.target.value)}`);
                  }
                }}
                className="w-64 px-4 py-2 pr-10 rounded-lg border border-gray-600 bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24] placeholder-gray-400"
              />
              <button className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
            </div>

            <div className="hidden lg:block">
              <CurrencyStrip activeLive={activeLive} />
            </div>
          </div>
          <div className="relative sm:rounded-b-[15px] overflow-hidden">
            <LivePlayer 
              title={currentChannel?.name || activeLive?.title || "הרשת החדשה - שידור חי"}
              isLive={!!activeLive?.is_active}
              viewerCount={activeLive?.viewer_count || 3456}
              streamUrl={channelStreamUrl}
            />
          </div>
        </div>
      </section>

      {/* Updates and Reporters Below Player */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <UpdatesFeed />
        <ReportersFeed />
      </section>

            {/* Live Stats */}
            <LiveStats />



      {/* Category Navigation Bar */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
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
      </section>

      {/* TikTok Style News Feed */}
      <TikTokNewsFeed articles={articles} />
    </div>
  );
}