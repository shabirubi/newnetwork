import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Radio, TrendingUp, Clock, ChevronLeft, Flame, Zap, Target, Shield, DollarSign, Landmark, Cpu, Trophy, Clapperboard, Globe, Heart, Tv, Newspaper, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import LivePlayer from "../components/news/LivePlayer";
import NewsCard from "../components/news/NewsCard";
import UpdatesFeed from "../components/news/UpdatesFeed";
import EntertainmentUpdatesFeed from "../components/news/EntertainmentUpdatesFeed";
import ReporterChatButton from "../components/reporter/ReporterChatButton";
import CategoriesMenu from "../components/shared/CategoriesMenu";
import VideoHighlights from "../components/news/VideoHighlights";
import LiveStats from "../components/news/LiveStats";
import AutoNewsUpdater from "../components/news/AutoNewsUpdater";
import AutoChannelsUpdater from "../components/news/AutoChannelsUpdater";
import CurrencyStrip from "../components/header/CurrencyStrip";
import TikTokNewsFeed from "../components/news/TikTokNewsFeed";
import AIAnnouncer from "../components/news/AIAnnouncer";
import TVAnchor from "../components/news/TVAnchor";
import VODModal from "../components/vod/VODModal";
import BroadcastStrip from "../components/news/BroadcastStrip";
import AccessibilityPanel from "../components/accessibility/AccessibilityPanel";


export default function Home() {
  const [vodModalOpen, setVodModalOpen] = React.useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = React.useState(false);
  const [a11yOpen, setA11yOpen] = React.useState(false);
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
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
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
      
      {/* Floating Action Buttons - Left Side Column */}
            <div className="fixed left-4 sm:left-6 bottom-24 z-50 flex flex-col gap-4">
              {/* Accessibility Button */}
              <motion.button
                onClick={() => setA11yOpen(true)}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3, delay: -0.2 }}
                className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-full p-4 sm:p-3.5 shadow-2xl border-2 border-white/30 hover:border-white/50 transition-all"
                title="אפשרויות נגישות"
              >
                <svg className="w-6 h-6 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </motion.button>

              {/* Chat Button */}
              <motion.button
                onClick={() => window.dispatchEvent(new CustomEvent('openReporterChat'))}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3, delay: -0.1 }}
                className="group relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-full p-4 sm:p-3.5 shadow-2xl border-2 border-white/30 hover:border-white/50 transition-all"
                title="צ'אט עם הכתבים"
              >
                <MessageCircle className="w-6 h-6 sm:w-5 sm:h-5 text-white" />
              </motion.button>

              {/* VOD Button */}
        <motion.button
          onClick={() => setVodModalOpen(true)}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="group relative bg-gradient-to-br from-red-600 via-purple-600 to-blue-600 rounded-full p-4 sm:p-3.5 shadow-2xl border-2 border-white/30 hover:border-white/50 transition-all"
          title="עולם התוכן"
        >
          <Tv className="w-6 h-6 sm:w-5 sm:h-5 text-white" />
        </motion.button>



        {/* Categories Button */}
        <motion.button
          onClick={() => setCategoriesMenuOpen(true)}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="group relative bg-gradient-to-br from-red-600 to-red-700 rounded-full p-4 sm:p-3.5 shadow-2xl border-2 border-white/30 hover:border-white/50 transition-all"
          title="קטגוריות חדשות"
        >
          <Newspaper className="w-6 h-6 sm:w-5 sm:h-5 text-white" />
        </motion.button>

        {/* Radio Button */}
        <motion.button
          onClick={() => window.location.href = createPageUrl("Live")}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="group relative bg-gradient-to-br from-red-700 to-red-800 rounded-full p-4 sm:p-3.5 shadow-2xl border-2 border-white/30 hover:border-white/50 transition-all animate-pulse"
          title="שידור חי"
        >
          <Radio className="w-6 h-6 sm:w-5 sm:h-5 text-white" />
        </motion.button>
      </div>

      {/* Hero Section - TikTok News Feed */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-0 -mx-0 sm:mx-0 px-0 sm:px-4 bg-black">
        {/* Left Sidebar - Entertainment Updates Feed */}
        <aside className="lg:col-span-3 hidden lg:block bg-black">
          <EntertainmentUpdatesFeed />
        </aside>

        {/* Center - TikTok News Feed */}
        <div className="lg:col-span-6">
          <TikTokNewsFeed articles={articles} />
        </div>

        {/* Right Sidebar - Updates Feed */}
        <aside className="lg:col-span-3 hidden lg:block bg-black">
          <UpdatesFeed />
        </aside>
      </section>

      {/* Live Player Section */}
      <section className="px-0 sm:px-4 mt-6">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 sm:rounded-t-lg p-2 sm:p-3 flex items-center justify-between">
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

      {/* Category News Section */}
      <section className="px-4 sm:px-4 mt-8 space-y-8">
        {[
          { category: 'horoscope', label: 'אסטרולוגיה' },
          { category: 'entertainment', label: 'בידור' },
          { category: 'sports', label: 'ספורט' },
          { category: 'politics', label: 'פוליטיקה' }
        ].map(({ category, label }) => {
          const categoryArticles = articles.filter(a => a.category === category).slice(0, 4);
          return (
            <div key={category}>
              <h3 className="text-xl font-bold dark:text-white mb-4">{label}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categoryArticles.length > 0 ? (
                  categoryArticles.map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))
                ) : (
                  <div className="col-span-full text-center text-gray-400 py-8">
                    אין חדשות זמינות בקטגוריה זו כרגע
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* All News Section */}
      {articles.length > 0 && (
        <section className="px-4 sm:px-4 mt-8">
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



      {/* VOD Modal */}
      <VODModal isOpen={vodModalOpen} onClose={() => setVodModalOpen(false)} />

      {/* Categories Menu Modal */}
      <CategoriesMenu isOpen={categoriesMenuOpen} onClose={() => setCategoriesMenuOpen(false)} />

      {/* Accessibility Panel */}
      <AccessibilityPanel isOpen={a11yOpen} onClose={() => setA11yOpen(false)} />

      {/* Reporter Chat Button */}
      <ReporterChatButton />

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