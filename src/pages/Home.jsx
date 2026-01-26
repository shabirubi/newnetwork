import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Radio, TrendingUp, Clock, ChevronLeft, Flame, Zap, Target, Shield, DollarSign, Landmark, Cpu, Trophy, Clapperboard, Globe, Heart, Tv, Newspaper, MessageCircle, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import LivePlayer from "../components/news/LivePlayer";
import NewsCard from "../components/news/NewsCard";
import UpdatesFeed from "../components/news/UpdatesFeed";
import EntertainmentUpdatesFeed from "../components/news/EntertainmentUpdatesFeed";
import StudioSidebar from "../components/home/StudioSidebar";

import CategoriesMenu from "../components/shared/CategoriesMenu";
import TalkingAvatar from "../components/avatar/TalkingAvatar";
import ReportersModal from "../components/reporter/ReportersModal";

import AutoNewsUpdater from "../components/news/AutoNewsUpdater";
import AutoChannelsUpdater from "../components/news/AutoChannelsUpdater";

import TikTokNewsFeed from "../components/news/TikTokNewsFeed";
import VODModal from "../components/vod/VODModal";
import AccessibilityPanel from "../components/accessibility/AccessibilityPanel";
import UploadVideoModal from "../components/home/UploadVideoModal";
import { Droplet, Mic, Users } from "lucide-react";

      // Lazy loaded components
const NewsReels = React.lazy(() => import("../components/news/NewsReels"));
const TrendingTopicsContainer = React.lazy(() => import("../components/home/TrendingTopicsContainer"));
const TikTokNewsContainer = React.lazy(() => import("../components/home/TikTokNewsContainer"));
const ReportersSpotlight = React.lazy(() => import("../components/home/ReportersSpotlight"));
const UserUploadedVideos = React.lazy(() => import("../components/home/UserUploadedVideos"));
const AllVideosGallery = React.lazy(() => import("../components/home/AllVideosGallery"));
const KanArchiveContainer = React.lazy(() => import("../components/home/KanArchiveContainer"));
const ReporterResponsesFeed = React.lazy(() => import("../components/home/ReporterResponsesFeed"));

export default function Home() {
  const [vodModalOpen, setVodModalOpen] = React.useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = React.useState(false);
  const [a11yOpen, setA11yOpen] = React.useState(false);
  const [uploadVideoModalOpen, setUploadVideoModalOpen] = React.useState(false);
  const [reportersModalOpen, setReportersModalOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
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
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return [];
        return base44.entities.NewsChannel.filter({ is_active: true }, 'name');
      } catch {
        return [];
      }
    },
    initialData: []
  });

  const defaultStreamUrl = "https://www.youtube.com/embed/OeEDtjuqinU?autoplay=0&mute=1&rel=0";

  const queryClient = useQueryClient();

  const { data: articles = [], isLoading, fetchNextPage, isFetchingNextPage } = useQuery({
    queryKey: ['news-articles', selectedChannel, page],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return [];
        const limit = 30;
        const skip = (page - 1) * limit;
        
        let allArticles = [];
        if (selectedChannel === 'all') {
          allArticles = await base44.entities.NewsArticle.list('-created_date', 1000);
        } else {
          allArticles = await base44.entities.NewsArticle.filter({ channel_id: selectedChannel }, '-created_date', 1000);
        }
        
        const paginated = allArticles.slice(skip, skip + limit);
        if (paginated.length < limit) {
          setHasMore(false);
        }
        return paginated;
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    initialData: [],
    keepPreviousData: true
  });

  // Infinite scroll handler
  React.useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500 &&
        !isLoading &&
        !isFetchingNextPage &&
        hasMore
      ) {
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, isFetchingNextPage, hasMore]);

  React.useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['news-articles'] });
  }, [queryClient]);

  const { data: liveStream, refetch: refetchLiveStream } = useQuery({
    queryKey: ['live-stream'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return [];
        return base44.entities.LiveStream.list('-created_date', 1);
      } catch {
        return [];
      }
    },
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


      {/* Live Player Section */}
      <section className="px-0 sm:px-0 mb-0">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4">
          <LivePlayer 
            title={currentChannel?.name || activeLive?.title || "הרשת החדשה - שידור חי"}
            isLive={!!activeLive?.is_active}
            viewerCount={activeLive?.viewer_count || 3456}
            streamUrl={activeLive?.stream_url || channelStreamUrl}
            thumbnailUrl={activeLive?.thumbnail_url}
          />
        </div>
      </section>

      {/* TikTok News with Sidebars */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 -mx-0 sm:mx-0 px-0 sm:px-4 mt-6">
        {/* Left Sidebar - Entertainment Updates Feed */}
        <aside className="lg:col-span-3 hidden lg:block bg-black space-y-4">
          <EntertainmentUpdatesFeed />
        </aside>

        {/* Center - TikTok News Feed */}
        <div className="lg:col-span-6">
          <TikTokNewsFeed articles={articles} />
        </div>

        {/* Right Sidebar - Studio Options */}
        <aside className="lg:col-span-3">
          <StudioSidebar />
        </aside>
      </section>

      {/* Category News Section */}
      <section className="px-4 sm:px-4 mt-8 space-y-8">
        {[
          { category: 'breaking', label: 'חדשות עכשיו' },
          { category: 'security', label: 'ביטחון ומדיניות' },
          { category: 'economy', label: 'כלכלה ועסקים' },
          { category: 'politics', label: 'פוליטיקה' },
          { category: 'technology', label: 'טכנולוגיה' },
          { category: 'sports', label: 'ספורט' },
          { category: 'entertainment', label: 'בידור ודרמה' },
          { category: 'world', label: 'חדשות עולם' },
          { category: 'health', label: 'בריאות' },
          { category: 'music', label: 'מוזיקה' },
          { category: 'horoscope', label: 'אסטרולוגיה' },
          { category: 'finance', label: 'פיננסים' }
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

      {/* Kan Archive - עמוד האש */}
      <div id="kan-archive-section">
        <React.Suspense fallback={<div className="h-96 bg-black animate-pulse rounded-2xl mx-4" />}>
          <KanArchiveContainer />
        </React.Suspense>
      </div>

      {/* TikTok News Container - Lazy Loaded */}
      <React.Suspense fallback={<div className="h-96 bg-black animate-pulse rounded-2xl mx-4" />}>
        <TikTokNewsContainer />
      </React.Suspense>

      {/* Reporters Spotlight - Lazy Loaded */}
      <React.Suspense fallback={<div className="h-96 bg-black animate-pulse rounded-2xl mx-4" />}>
        <ReportersSpotlight />
      </React.Suspense>

      {/* Reporter Responses Feed - Lazy Loaded */}
      <section className="px-4 sm:px-4 mt-8">
        <React.Suspense fallback={<div className="h-96 bg-black animate-pulse rounded-2xl" />}>
          <ReporterResponsesFeed />
        </React.Suspense>
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

          {isFetchingNextPage && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-[#E31E24]/20 border-t-[#E31E24] rounded-full animate-spin mx-auto"></div>
              <p className="text-white/60 mt-4">טוען עוד חדשות...</p>
            </div>
          )}

          {!hasMore && articles.length > 0 && (
            <div className="text-center py-8">
              <p className="text-white/40 text-sm">אין עוד חדשות להצגה</p>
            </div>
          )}
        </section>
      )}

      {/* VOD Modal */}
      <VODModal isOpen={vodModalOpen} onClose={() => setVodModalOpen(false)} />

      {/* Categories Menu Modal */}
      <CategoriesMenu isOpen={categoriesMenuOpen} onClose={() => setCategoriesMenuOpen(false)} />

      {/* Upload Video Modal */}
      <UploadVideoModal isOpen={uploadVideoModalOpen} onClose={() => setUploadVideoModalOpen(false)} />

      {/* Reporters Modal */}
      <ReportersModal isOpen={reportersModalOpen} onClose={() => setReportersModalOpen(false)} />

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





      {/* Upload Video Floating Button - העלאה פשוטה */}
      <motion.button
        onClick={() => setUploadVideoModalOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-4 z-[9998] w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 shadow-2xl flex items-center justify-center border-2 border-red-300/50 transition-all group"
        title="העלה סרטון לנגן הראשי"
      >
        <Droplet className="w-7 h-7 text-white fill-white" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          העלה סרטון
        </span>
      </motion.button>

      {/* Broadcast Studio - סטודיו מקצועי */}
      <Link to={createPageUrl("BroadcastStudio")}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-8 right-4 z-[9998] w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 shadow-2xl flex items-center justify-center border-2 border-purple-300/50 transition-all group"
          title="סטודיו מקצועי"
        >
          <Settings className="w-7 h-7 text-white" />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-purple-600 text-white text-sm font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            סטודיו מקצועי
          </span>
        </motion.button>
      </Link>



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