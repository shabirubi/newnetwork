import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, TrendingUp, Clock, ChevronLeft, Flame, Zap, Target, Shield, DollarSign, Landmark, Cpu, Trophy, Clapperboard, Globe, Heart, Tv, Newspaper, MessageCircle, Settings, X, Film, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import LivePlayer from "../components/news/LivePlayer";
import NewsCard from "../components/news/NewsCard";
import UpdatesFeed from "../components/news/UpdatesFeed";
import EntertainmentUpdatesFeed from "../components/news/EntertainmentUpdatesFeed";
import StudioSidebar from "../components/home/StudioSidebar";
import WeatherAlertsContainer from "../components/weather/WeatherAlertsContainer";

import CategoriesMenu from "../components/shared/CategoriesMenu";
import TalkingAvatar from "../components/avatar/TalkingAvatar";
import ReportersModal from "../components/reporter/ReportersModal";
import LiveAvatarChatModal from "../components/avatar/LiveAvatarChatModal";

import TikTokNewsFeed from "../components/news/TikTokNewsFeed";
import VODModal from "../components/vod/VODModal";
import AccessibilityPanel from "../components/accessibility/AccessibilityPanel";
import UploadVideoModal from "../components/home/UploadVideoModal";
import UserUploadedVideos from "../components/home/UserUploadedVideos";
import ReportersSpotlight from "../components/home/ReportersSpotlight";
import { Droplet, Mic, Users, Wand2, FileVideo } from "lucide-react";
import ReporterLiveChat from "../components/reporter/ReporterLiveChat";
import RealTimeAlertsContainer from "../components/home/RealTimeAlertsContainer";
import ZakaMediaKitContainer from "../components/home/ZakaMediaKitContainer";
import WeatherForecastAvatar from "../components/weather/WeatherForecastAvatar";

      // Lazy loaded components
const NewsReels = React.lazy(() => import("../components/news/NewsReels"));
const TrendingTopicsContainer = React.lazy(() => import("../components/home/TrendingTopicsContainer"));
const TikTokNewsContainer = React.lazy(() => import("../components/home/TikTokNewsContainer"));
const AllVideosGallery = React.lazy(() => import("../components/home/AllVideosGallery"));
const KanArchiveContainer = React.lazy(() => import("../components/home/KanArchiveContainer"));
const ReporterResponsesFeed = React.lazy(() => import("../components/home/ReporterResponsesFeed"));

export default function Home() {
  const [vodModalOpen, setVodModalOpen] = React.useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = React.useState(false);
  const [a11yOpen, setA11yOpen] = React.useState(false);
  const [uploadVideoModalOpen, setUploadVideoModalOpen] = React.useState(false);

  React.useEffect(() => {
    const handleOpenUpload = () => setUploadVideoModalOpen(true);
    window.addEventListener('openUploadVideo', handleOpenUpload);
    return () => window.removeEventListener('openUploadVideo', handleOpenUpload);
  }, []);
  const [reportersModalOpen, setReportersModalOpen] = React.useState(false);
  const [liveAvatarChatOpen, setLiveAvatarChatOpen] = React.useState(false);
  const [showLivePlayer, setShowLivePlayer] = React.useState(false);
  const [liveChatOpen, setLiveChatOpen] = React.useState(false);
  const [selectedReporterForChat, setSelectedReporterForChat] = React.useState(null);
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
      return [];
    },
    initialData: [],
    enabled: false
  });

  const defaultStreamUrl = "https://www.youtube.com/embed/OeEDtjuqinU?autoplay=0&mute=1&rel=0";

  const queryClient = useQueryClient();

  // הכתבה האחרונה שהועלתה
  const featuredArticle = {
    id: '698a72b65aab44eb627fd899',
    title: 'שוקי המניות מחקו את הירידות, אך ישנם איומים מחזיתות אחרות',
    subtitle: 'ההתפתחויות האחרונות יוצרות סביבה נוחה יותר לנכסי סיכון, אך ישנם איומים נוספים',
    content: 'שוקי המניות התאוששו מהירידות שנרשמו לאחר הכרזת טראמפ על תכנית המכסים השאפתנית. עם זאת, ישנם איומים נוספים, כגון אי-ודאות פוליטית והתפתחויות כלכליות בלתי צפויות, שעלולות להשפיע על השוק.',
    category: 'finance',
    image_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/8df32e9f1_generated_image.png',
    source: 'אייס',
    created_date: '2026-02-09T23:50:14.552Z',
    created_by: 'service+0a06552f-b47f-487a-84bb-eb2bdeb5769c@no-reply.base44.com'
  };

  const articles = [];
  const isLoading = false;





  const { data: liveStream, refetch: refetchLiveStream } = useQuery({
    queryKey: ['live-stream'],
    queryFn: async () => {
      return [];
    },
    initialData: [],
    enabled: false
  });

  const { data: livePlayerVideos = [] } = useQuery({
    queryKey: ['livePlayerVideos'],
    queryFn: async () => {
      return [];
    },
    initialData: [],
    enabled: false
  });

  // האזן לעדכונים בסרטונים להעלאה
  React.useEffect(() => {
    const handleVideoUploaded = () => {
      refetchLiveStream();
    };
    window.addEventListener('videoUploaded', handleVideoUploaded);
    return () => window.removeEventListener('videoUploaded', handleVideoUploaded);
  }, [refetchLiveStream]);

  // No memos needed - using static data

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

      {/* Featured Article Section - Full Screen */}
      <section className="px-0 mb-8 -mx-4 sm:mx-0">
        <Link 
          to={`${createPageUrl("Article")}?id=${featuredArticle.id}`}
          className="block group relative rounded-none sm:rounded-3xl overflow-hidden cursor-pointer"
        >
          <div className="flex flex-col lg:flex-row-reverse">
            {/* תמונה בצד ימין */}
            <div className="lg:w-2/3 h-[250px] sm:h-[400px] lg:h-[500px]">
              <img 
                src={featuredArticle.image_url} 
                alt={featuredArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* טקסט בצד שמאל */}
            <div className="lg:w-1/3 bg-gradient-to-br from-black via-gray-900 to-black p-4 sm:p-6 lg:p-10 flex flex-col justify-center">
              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                {/* Badge */}
                <div className="inline-flex w-fit bg-gradient-to-r from-[#0080FF] to-[#0066FF] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,128,255,0.6)] border-2 border-[#0080FF]/50">
                  📈 כלכלה ופיננסים
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight drop-shadow-2xl">
                  {featuredArticle.title}
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base lg:text-lg text-gray-100 drop-shadow-lg line-clamp-3">
                  {featuredArticle.subtitle}
                </p>

                {/* Content Preview - Hidden on mobile */}
                <p className="hidden sm:block text-sm lg:text-base text-gray-300 leading-relaxed line-clamp-4">
                  {featuredArticle.content}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
                  <span className="flex items-center gap-1 sm:gap-2 text-gray-200 text-xs sm:text-sm bg-black/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-sm">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    {new Date(featuredArticle.created_date).toLocaleDateString('he-IL', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="text-gray-200 text-xs sm:text-sm bg-black/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-sm">
                    📰 {featuredArticle.source}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </section>

          {/* Live Player Section - מוצג רק אם לחצו על הכפתור */}
          {showLivePlayer && (
        <section className="px-0 mb-0 -mx-4 sm:mx-0 sm:px-0 sm:mb-6">
          <div className="bg-black sm:bg-black/40 sm:backdrop-blur-sm sm:rounded-lg sm:p-4 relative">
            <button
              onClick={() => setShowLivePlayer(false)}
              className="absolute top-2 left-2 z-50 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <LivePlayer 
              title={finalTitle}
              isLive={!!activeLive?.is_active}
              viewerCount={activeLive?.viewer_count || 3456}
              streamUrl={finalStreamUrl}
              thumbnailUrl={finalThumbnail}
            />
          </div>
        </section>
      )}

      {/* כפתור הפעלת נגן הווידאו */}
      {!showLivePlayer && (
        <section className="px-4 sm:px-4 mt-4">
          <motion.button
          onClick={() => setShowLivePlayer(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-[#0080FF] via-[#0066FF] to-[#4DA6FF] hover:from-[#4DA6FF] hover:to-[#0080FF] text-white py-4 rounded-xl shadow-[0_0_30px_rgba(0,128,255,0.6)] border-2 border-[#0080FF]/50 flex items-center justify-center gap-3 font-bold text-lg transition-all"
          >
          <Radio className="w-6 h-6 drop-shadow-[0_0_5px_#0080FF]" />
          הפעל שידור חי
          </motion.button>
        </section>
      )}









      {/* Weather Forecast Avatar Section */}
      <section className="px-0 mb-8 flex justify-center">
        <div style={{ width: '1100px', height: '520px' }}>
          <WeatherForecastAvatar />
        </div>
      </section>

      {/* Weather Alerts Container */}
      <section className="px-4 sm:px-4 mb-8">
        <WeatherAlertsContainer />
      </section>

      {/* Real Time Alerts */}
      <section className="px-0 sm:px-4 mb-8">
        <React.Suspense fallback={<Skeleton className="w-full h-64 bg-gray-800" />}>
          <RealTimeAlertsContainer />
        </React.Suspense>
      </section>

      {/* Breaking News Updates Feed */}
      <section className="px-0 sm:px-4 mb-8">
        <React.Suspense fallback={<Skeleton className="w-full h-96 bg-gray-800" />}>
          <UpdatesFeed />
        </React.Suspense>
      </section>

      {/* News Reels Section */}
      <section className="px-0 sm:px-4 mb-8">
        <React.Suspense fallback={<Skeleton className="w-full h-96 bg-gray-800" />}>
          <NewsReels />
        </React.Suspense>
      </section>

      {/* Trending Topics */}
      <section className="px-0 sm:px-4 mb-8">
        <React.Suspense fallback={<Skeleton className="w-full h-64 bg-gray-800" />}>
          <TrendingTopicsContainer />
        </React.Suspense>
      </section>

      {/* TikTok News Feed */}
      <section className="px-0 sm:px-4 mb-8">
        <React.Suspense fallback={<Skeleton className="w-full h-96 bg-gray-800" />}>
          <TikTokNewsContainer />
        </React.Suspense>
      </section>

      {/* All Videos Gallery */}
      <section className="px-0 sm:px-4 mb-8">
        <React.Suspense fallback={<Skeleton className="w-full h-96 bg-gray-800" />}>
          <AllVideosGallery />
        </React.Suspense>
      </section>

      {/* Kan Archive */}
      <section className="px-0 sm:px-4 mb-8">
        <React.Suspense fallback={<Skeleton className="w-full h-64 bg-gray-800" />}>
          <KanArchiveContainer />
        </React.Suspense>
      </section>

      {/* Reporter Responses Feed */}
      <section className="px-0 sm:px-4 mb-8">
        <React.Suspense fallback={<Skeleton className="w-full h-96 bg-gray-800" />}>
          <ReporterResponsesFeed />
        </React.Suspense>
      </section>

      {/* Reporters Spotlight */}
      <section className="px-0 sm:px-4 mb-8">
        <ReportersSpotlight />
      </section>

      {/* User Uploaded Videos */}
      <section className="px-0 sm:px-4 mb-8">
        <UserUploadedVideos />
      </section>

      {/* Entertainment Updates */}
      <section className="px-0 sm:px-4 mb-8">
        <EntertainmentUpdatesFeed />
      </section>

      {/* Zaka Media Kit */}
      <section className="px-0 sm:px-4 mb-8">
        <React.Suspense fallback={<Skeleton className="w-full h-96 bg-gray-800" />}>
          <ZakaMediaKitContainer />
        </React.Suspense>
      </section>

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

      {/* LiveAvatar Chat Modal */}
      <LiveAvatarChatModal 
        isOpen={liveAvatarChatOpen} 
        onClose={() => setLiveAvatarChatOpen(false)} 
      />

      {/* Reporter Live Chat Modal */}
      <ReporterLiveChat 
        isOpen={liveChatOpen} 
        onClose={() => {
          setLiveChatOpen(false);
          setSelectedReporterForChat(null);
        }}
        reporter={selectedReporterForChat || { name: 'עדי', image: 'https://via.placeholder.com/150' }}
      />

      {/* Floating Live Chat Button */}
      <motion.button
        onClick={() => {
          window.dispatchEvent(new CustomEvent('openDidChat'));
        }}
        className="fixed bottom-24 left-6 z-[100] w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-2xl shadow-green-500/50 flex items-center justify-center border-2 border-green-400"
        initial={{ scale: 0 }}
        animate={{ 
          scale: [1, 1.1, 1],
          boxShadow: [
            '0 0 20px rgba(34, 197, 94, 0.5)',
            '0 0 40px rgba(34, 197, 94, 0.8)',
            '0 0 20px rgba(34, 197, 94, 0.5)'
          ]
        }}
        transition={{ 
          scale: { duration: 2, repeat: Infinity },
          boxShadow: { duration: 2, repeat: Infinity }
        }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-7 h-7 text-white drop-shadow-lg" />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
      </motion.button>

      {/* Live Chat Tooltip */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed bottom-24 left-24 z-[99] bg-green-600 text-white px-3 py-2 rounded-lg shadow-xl text-xs font-bold whitespace-nowrap pointer-events-none"
      >
        צ'אט AI חי 💬
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-green-600"></div>
      </motion.div>

      {/* Studio Sidebar */}
      <StudioSidebar />








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