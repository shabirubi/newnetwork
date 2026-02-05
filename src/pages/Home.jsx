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

import TikTokNewsFeed from "../components/news/TikTokNewsFeed";
import VODModal from "../components/vod/VODModal";
import AccessibilityPanel from "../components/accessibility/AccessibilityPanel";
import UploadVideoModal from "../components/home/UploadVideoModal";
import { Droplet, Mic, Users, Wand2, FileVideo } from "lucide-react";

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
        return await base44.entities.NewsChannel.filter({ is_active: true }, 'name');
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
        const limit = 15; // הפחתת כמות הכתבות עוד יותר
        const skip = (page - 1) * limit;
        
        let allArticles = [];
        if (selectedChannel === 'all') {
          allArticles = await base44.entities.NewsArticle.list('-created_date', 100); // הפחתה ל-100 בלבד
        } else {
          allArticles = await base44.entities.NewsArticle.filter({ channel_id: selectedChannel }, '-created_date', 100);
        }
        
        const paginated = allArticles.slice(skip, skip + limit);
        if (paginated.length < limit) {
          setHasMore(false);
        }
        return paginated;
      } catch (err) {
        return [];
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    initialData: [],
    keepPreviousData: true,
    retry: 1,
    enabled: true
  });

  // Infinite scroll handler with debounce
  React.useEffect(() => {
    let timeout;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000 &&
          !isLoading &&
          !isFetchingNextPage &&
          hasMore
        ) {
          setPage(prev => prev + 1);
        }
      }, 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isLoading, isFetchingNextPage, hasMore]);



  const { data: liveStream, refetch: refetchLiveStream } = useQuery({
    queryKey: ['live-stream'],
    queryFn: async () => {
      try {
        return await base44.entities.LiveStream.list('-created_date', 1);
      } catch {
        return [];
      }
    },
    initialData: [],
    refetchInterval: 60000, // רענן כל דקה
    refetchOnWindowFocus: false,
    retry: 1
  });

  const { data: livePlayerVideos = [] } = useQuery({
    queryKey: ['livePlayerVideos'],
    queryFn: async () => {
      try {
        return await base44.entities.UserVideo.filter({ feed: 'live-player', status: 'ready' }, '-created_date', 1);
      } catch {
        return [];
      }
    },
    initialData: [],
    refetchInterval: 60000, // רענן כל דקה
    refetchOnWindowFocus: false,
    retry: 1
  });

  // האזן לעדכונים בסרטונים להעלאה
  React.useEffect(() => {
    const handleVideoUploaded = () => {
      refetchLiveStream();
    };
    window.addEventListener('videoUploaded', handleVideoUploaded);
    return () => window.removeEventListener('videoUploaded', handleVideoUploaded);
  }, [refetchLiveStream]);

  const featuredArticle = React.useMemo(() => 
    articles.find(a => a.is_featured || a.is_breaking) || articles[0], 
    [articles]
  );
  
  const breakingNews = React.useMemo(() => 
    articles.filter(a => a.is_breaking), 
    [articles]
  );
  
  const regularNews = React.useMemo(() => 
    articles.filter(a => a.id !== featuredArticle?.id).slice(0, 8), 
    [articles, featuredArticle]
  );
  
  const trendingNews = React.useMemo(() => 
    [...articles].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5),
    [articles]
  );

  const activeLive = liveStream[0];
  const currentChannel = selectedChannel === 'all' ? null : channels.find(c => c.id === selectedChannel);
  const channelStreamUrl = currentChannel?.stream_url || defaultStreamUrl;
  
  // שימוש בסרטונים שהועלו ל-live-player
  const livePlayerVideo = livePlayerVideos[0];
  const finalStreamUrl = livePlayerVideo?.video_url || activeLive?.stream_url || channelStreamUrl;
  const finalTitle = livePlayerVideo?.title || currentChannel?.name || activeLive?.title || "הרשת החדשה - שידור חי";
  const finalThumbnail = livePlayerVideo?.thumbnail_url || activeLive?.thumbnail_url;

  // Don't block render on loading - show content as it loads

  return (
    <div className="min-h-screen bg-black space-y-0 sm:space-y-6">


      {/* Live Player Section */}
      <section className="px-0 mb-0 -mx-4 sm:mx-0 sm:px-0 sm:mb-6">
        <div className="bg-black sm:bg-black/40 sm:backdrop-blur-sm sm:rounded-lg sm:p-4">
          <LivePlayer 
            title={finalTitle}
            isLive={!!activeLive?.is_active}
            viewerCount={activeLive?.viewer_count || 3456}
            streamUrl={finalStreamUrl}
            thumbnailUrl={finalThumbnail}
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

        {/* Right Sidebar - Breaking News Updates */}
        <aside className="lg:col-span-3">
          <UpdatesFeed />
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

      {/* User Uploaded Videos - Lazy Loaded */}
      <div id="user-videos-section">
        <React.Suspense fallback={<div className="h-96 bg-black animate-pulse rounded-2xl mx-4" />}>
          <UserUploadedVideos onUploadClick={() => setUploadVideoModalOpen(true)} />
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

      {/* Animation Studio Button */}
      <Link to={createPageUrl("AnimationStudio")}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-56 right-4 z-[9998] w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-2xl flex items-center justify-center border-2 border-cyan-300/50 transition-all group"
          title="Animation Studio"
        >
          <FileVideo className="w-7 h-7 text-white" />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-cyan-600 text-white text-sm font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Animation
          </span>
        </motion.button>
      </Link>

      {/* AI Design Studio Button */}
      <Link to={createPageUrl("AIDesignStudio")}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-40 right-4 z-[9998] w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600 shadow-2xl flex items-center justify-center border-2 border-purple-300/50 transition-all group"
          title="AI Design Studio"
        >
          <Wand2 className="w-7 h-7 text-white" />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-purple-600 text-white text-sm font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            AI Design
          </span>
        </motion.button>
      </Link>

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