import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Radio, TrendingUp, Clock, ChevronLeft, Flame, Zap, Target, Shield, DollarSign, Landmark, Cpu, Trophy, Clapperboard, Globe, Heart } from "lucide-react";
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
import PopupFeed from "../components/news/PopupFeed";

export default function Home() {
  const [selectedChannel, setSelectedChannel] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedChannel') || 'all';
    }
    return 'all';
  });

  const [popupOpen, setPopupOpen] = React.useState(false);

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
      <AIAnnouncer />
      <PopupFeed isOpen={popupOpen} onClose={() => setPopupOpen(false)} />

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setPopupOpen(true)}
        className="fixed bottom-32 left-6 z-40 w-16 h-16 rounded-full bg-gradient-to-br from-[#E31E24] to-[#B91C1C] shadow-2xl flex items-center justify-center text-white font-bold hover:shadow-[0_0_30px_rgba(227,30,36,0.6)] transition-all"
      >
        <ChevronLeft className="w-8 h-8" />
      </motion.button>

      {/* Hero Section - No Sidebars */}
      <section className="w-full">
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

      {/* TikTok Style News Feed with All Articles */}
      <TikTokNewsFeed articles={articles} />

      {/* All News Section */}
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