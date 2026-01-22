import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

import CategoriesMenu from "../components/shared/CategoriesMenu";
import TalkingAvatar from "../components/avatar/TalkingAvatar";

import AutoNewsUpdater from "../components/news/AutoNewsUpdater";
import AutoChannelsUpdater from "../components/news/AutoChannelsUpdater";

import TikTokNewsFeed from "../components/news/TikTokNewsFeed";
import VODModal from "../components/vod/VODModal";
import AccessibilityPanel from "../components/accessibility/AccessibilityPanel";
import UploadVideoModal from "../components/home/UploadVideoModal";
import AIReporterIntroChat from "../components/apps/AIReporterIntroChat";
import BroadcastStudio from "../components/home/BroadcastStudio";
import { Droplet, Mic } from "lucide-react";

      // Lazy loaded components
const NewsReels = React.lazy(() => import("../components/news/NewsReels"));
const TrendingTopicsContainer = React.lazy(() => import("../components/home/TrendingTopicsContainer"));
const TikTokNewsContainer = React.lazy(() => import("../components/home/TikTokNewsContainer"));
const ReportersSpotlight = React.lazy(() => import("../components/home/ReportersSpotlight"));
const UserUploadedVideos = React.lazy(() => import("../components/home/UserUploadedVideos"));
const AllVideosGallery = React.lazy(() => import("../components/home/AllVideosGallery"));

export default function Home() {
  const [vodModalOpen, setVodModalOpen] = React.useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = React.useState(false);
  const [a11yOpen, setA11yOpen] = React.useState(false);
  const [uploadVideoModalOpen, setUploadVideoModalOpen] = React.useState(false);
  const [studioOpen, setStudioOpen] = React.useState(false);
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

  const defaultStreamUrl = "https://www.youtube.com/embed/OeEDtjuqinU?autoplay=0&mute=1&rel=0";

  const queryClient = useQueryClient();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['news-articles', selectedChannel],
    queryFn: () => {
      if (selectedChannel === 'all') {
        return base44.entities.NewsArticle.list('-created_date', 50);
      }
      return base44.entities.NewsArticle.filter({ channel_id: selectedChannel }, '-created_date', 50);
    },
    staleTime: 8 * 60 * 60 * 1000,
    gcTime: 8 * 60 * 60 * 1000,
    refetchInterval: 8 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    initialData: [],
    placeholderData: (prev) => prev
  });

  React.useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['news-articles'] });
  }, [queryClient]);

  const { data: liveStream, refetch: refetchLiveStream } = useQuery({
    queryKey: ['live-stream'],
    queryFn: () => base44.entities.LiveStream.list('-created_date', 1),
    initialData: [],
    refetchInterval: 5000 // רענן כל 5 שניות
  });

  // האזן לעדכונים בסרטונים להעלאה
  React.useEffect(() => {
    const handleVideoUploaded = () => {
      refetchLiveStream();
    };
    window.addEventListener('videoUploaded', handleVideoUploaded);
    return () => window.removeEventListener('videoUploaded', handleVideoUploaded);
  }, [refetchLiveStream]);

  const featuredArticle = articles.find(a => a.is_featured || a.is_breaking) || articles[0];
  const breakingNews = articles.filter(a => a.is_breaking);
  const regularNews = articles.filter(a => a.id !== featuredArticle?.id).slice(0, 8);
  const trendingNews = [...articles].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5);

  const activeLive = liveStream[0];
  const currentChannel = selectedChannel === 'all' ? null : channels.find(c => c.id === selectedChannel);
  const channelStreamUrl = currentChannel?.stream_url || defaultStreamUrl;

  // Don't block render on loading - show content as it loads

  return (
    <div className="min-h-screen bg-black space-y-0 sm:space-y-6">
      <AutoNewsUpdater />
      <AutoChannelsUpdater />

      {/* Live Player Section */}
      <section className="px-0 sm:px-0 mb-0 -mt-14">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4">
          <LivePlayer 
            title={currentChannel?.name || activeLive?.title || "הרשת החדשה - שידור חי"}
            isLive={!!activeLive?.is_active}
            viewerCount={activeLive?.viewer_count || 3456}
            streamUrl={activeLive?.stream_url || channelStreamUrl}
          />
        </div>
      </section>

      {/* TikTok News with Sidebars */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-0 -mx-0 sm:mx-0 px-0 sm:px-4 mt-6">
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

      {/* Category News Section */}
      <section className="px-4 sm:px-4 mt-8 space-y-8">
        {[
          { category: 'horoscope', label: 'אסטרולוגיה' },
          { category: 'entertainment', label: 'בידור' },
          { category: 'sports', label: 'ספורט' },
          { category: 'politics', label: 'פוליטיקה' }
        ].map(({ category, label }) => {
          const categoryArticles = articles.filter(a => a.category === category).slice(0, 4);
          if (categoryArticles.length === 0) return null;
          return (
            <div key={category}>
              <h3 className="text-xl font-bold dark:text-white mb-4">{label}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categoryArticles.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* News Reels Section - Lazy Loaded */}
      <React.Suspense fallback={<div className="h-96 bg-black animate-pulse rounded-2xl" />}>
        <NewsReels />
      </React.Suspense>

      {/* Trending Topics Container - Lazy Loaded */}
      <React.Suspense fallback={<div className="h-64 bg-black animate-pulse rounded-2xl mx-4" />}>
        <TrendingTopicsContainer />
      </React.Suspense>

      {/* TikTok News Container - Lazy Loaded */}
      <React.Suspense fallback={<div className="h-96 bg-black animate-pulse rounded-2xl mx-4" />}>
        <TikTokNewsContainer />
      </React.Suspense>

      {/* Reporters Spotlight - Lazy Loaded */}
      <React.Suspense fallback={<div className="h-96 bg-black animate-pulse rounded-2xl mx-4" />}>
        <ReportersSpotlight />
      </React.Suspense>

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

      {/* Upload Video Modal */}
      <UploadVideoModal isOpen={uploadVideoModalOpen} onClose={() => setUploadVideoModalOpen(false)} />

      {/* Broadcast Studio Modal */}
      <BroadcastStudio isOpen={studioOpen} onClose={() => setStudioOpen(false)} />

      {/* Accessibility Panel */}
      <AccessibilityPanel isOpen={a11yOpen} onClose={() => setA11yOpen(false)} />

      {/* Talking Avatar */}
      <TalkingAvatar />

      {/* User Uploaded Videos - Lazy Loaded */}
      <div id="user-videos-section">
        <React.Suspense fallback={<div className="h-96 bg-black animate-pulse rounded-2xl mx-4" />}>
          <UserUploadedVideos onUploadClick={() => setUploadVideoModalOpen(true)} />
        </React.Suspense>
      </div>

      {/* All Videos Gallery - Lazy Loaded */}
      <React.Suspense fallback={<div className="h-96 bg-black animate-pulse rounded-2xl mx-4" />}>
        <AllVideosGallery />
      </React.Suspense>

      {/* AI Reporter Intro Chat */}
      <section className="px-4 mt-8 mb-12">
        <AIReporterIntroChat />
      </section>

      {/* Studio Floating Button */}
      <motion.button
        onClick={() => setStudioOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-40 sm:bottom-24 right-4 z-[9998] w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 shadow-2xl flex items-center justify-center border-2 border-purple-200/50 transition-all group"
        title="סטודיו שידור"
      >
        <Mic className="w-7 h-7 text-white" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-purple-600 text-white text-sm font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          סטודיו שידור
        </span>
      </motion.button>

      {/* Upload Article Floating Button */}
      <motion.button
        onClick={() => setUploadVideoModalOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 sm:bottom-8 right-4 z-[9998] w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 shadow-2xl flex items-center justify-center border-2 border-blue-200/50 transition-all group"
        title="העלה את הכתבה שלך"
      >
        <Droplet className="w-7 h-7 text-white fill-white" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          העלה כתבה
        </span>
      </motion.button>



      {/* Spotify Section */}
      <section className="px-4 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold dark:text-white">שיר היום</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open('https://open.spotify.com/track/6EhmyOolO1ZeqI8LU2nk8g?si=8449e73641204841', '_blank')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.6 17.5c-.4.6-1.1.8-1.7.4-4.7-2.9-10.6-3.5-17.6-1.9-.7.2-1.4-.2-1.6-.8-.2-.7.2-1.4.8-1.6 7.7-1.8 14.2-1.1 19.6 2.2.6.4.8 1.1.4 1.7zm1.5-3.3c-.5.7-1.3 1-2.1.5-5.4-3.3-13.5-4.3-19.8-2.3-.8.2-1.6-.2-1.8-1-.2-.8.2-1.6 1-1.8 7.1-2.3 16.2-1.2 22.3 2.6.7.4 1 1.3.5 2z"/>
            </svg>
            הפעל בספוטיפיי
          </motion.button>
        </div>
        <div className="flex justify-center">
          <iframe 
            src="https://open.spotify.com/embed/track/6EhmyOolO1ZeqI8LU2nk8g?utm_source=generator" 
            width="100%" 
            height="152" 
            frameBorder="0" 
            allowFullScreen="" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-2xl max-w-2xl"
          />
        </div>
      </section>

      {/* YouTube Video Section */}
      <section className="px-4 mb-12">
        <h2 className="text-3xl font-bold dark:text-white mb-6 text-center">שידור חי</h2>
        <div className="flex justify-center">
          <iframe 
            src="https://www.youtube.com/embed/OeEDtjuqinU?autoplay=0&mute=1&rel=0"
            width="100%" 
            height="400" 
            frameBorder="0" 
            allowFullScreen="" 
            allow="autoplay"
            className="rounded-2xl max-w-4xl"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#E31E24]/90 backdrop-blur-sm rounded-2xl p-8 text-white text-center">
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