import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, TrendingUp, Clock, ChevronLeft, Flame, Zap, Target, Shield, DollarSign, Landmark, Cpu, Trophy, Clapperboard, Globe, Heart, Tv, Newspaper, MessageCircle, Settings, X, Film, Video, Cloud } from "lucide-react";
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
import WeatherForecastModal from "../components/weather/WeatherForecastModal";

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
  const [livePlayerOpen, setLivePlayerOpen] = React.useState(false);

  React.useEffect(() => {
    const handleOpenUpload = () => setUploadVideoModalOpen(true);
    const handleOpenWeatherChat = () => setWeatherChatOpen(true);
    window.addEventListener('openUploadVideo', handleOpenUpload);
    window.addEventListener('openWeatherChatModal', handleOpenWeatherChat);
    return () => {
      window.removeEventListener('openUploadVideo', handleOpenUpload);
      window.removeEventListener('openWeatherChatModal', handleOpenWeatherChat);
    };
  }, []);
  const [reportersModalOpen, setReportersModalOpen] = React.useState(false);
  const [liveAvatarChatOpen, setLiveAvatarChatOpen] = React.useState(false);
  const [liveChatOpen, setLiveChatOpen] = React.useState(false);
  const [selectedReporterForChat, setSelectedReporterForChat] = React.useState(null);
  const [weatherChatOpen, setWeatherChatOpen] = React.useState(false);
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

  const defaultStreamUrl = "";

  const queryClient = useQueryClient();

  // הכתבה האחרונה שהועלתה
  const featuredArticle = {
    id: '698a72b65aab44eb627fd899',
    title: 'שוקי המניות מחקו את הירידות, אך ישנם איומים מחזיתות אחרות',
    subtitle: 'ההתפתחויות האחרונות יוצרות סביבה נוחה יותר לנכסי סיכון, אך ישנם איומים נוספים',
    content: 'שוקי המניות התאוששו מהירידות שנרשמו לאחר הכרזת טראמפ על תכנית המכסים השאפתנית. עם זאת, ישנם איומים נוספים, כגון אי-ודאות פוליטית והתפתחויות כלכליות בלתי צפויות, שעלולות להשפיע על השוק.',
    category: 'finance',
    image_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/8df32e9f1_generated_image.png',
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
  const channelStreamUrl = currentChannel?.stream_url || defaultStreamUrl || "";

  // שימוש בסרטונים שהועלו ל-live-player
  const livePlayerVideo = livePlayerVideos[0];
  const finalStreamUrl = livePlayerVideo?.video_url || activeLive?.stream_url || channelStreamUrl || "";
  const finalTitle = livePlayerVideo?.title || currentChannel?.name || activeLive?.title || "הרשת החדשה - שידור חי";
  const finalThumbnail = livePlayerVideo?.thumbnail_url || activeLive?.thumbnail_url || "";

  // Don't block render on loading - show content as it loads

  return (
    <div className="min-h-screen bg-black space-y-0 sm:space-y-6">

      {/* Live Player Section */}
      <section className="px-0 sm:px-4 mb-8">
        <LivePlayer 
          title={finalTitle}
          isLive={!!activeLive?.is_active}
          viewerCount={activeLive?.viewer_count || 3456}
          streamUrl={finalStreamUrl}
          thumbnailUrl={finalThumbnail}
        />
      </section>

      {/* Featured Article Section - Full Screen */}
      <section className="px-0 mb-4 mt-2">
        <Link 
          to={`${createPageUrl("Article")}?id=${featuredArticle.id}`}
          className="block group relative rounded-none sm:rounded-3xl overflow-hidden cursor-pointer"
        >
          <div className="relative h-[400px] sm:h-[500px]">
            {/* תמונה ברקע */}
            <img 
              src={featuredArticle.image_url} 
              alt={featuredArticle.title}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

            {/* טקסט מעל התמונה */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-10 space-y-2 sm:space-y-4">
              <div className="max-w-4xl space-y-2 sm:space-y-4">
                {/* Badge */}
                <div className="inline-flex w-fit bg-gradient-to-r from-[#E31E24] to-[#B91C1C] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(227,30,36,0.6)] border-2 border-[#E31E24]/50">
                  🔴 הרשת החדשה
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-3xl lg:text-5xl font-bold text-white leading-snug sm:leading-tight drop-shadow-2xl break-words">
                  {featuredArticle.title}
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-lg lg:text-2xl text-gray-100 drop-shadow-lg font-medium break-words leading-snug">
                  {featuredArticle.subtitle}
                </p>

                {/* Content Preview - Hidden on small screens */}
                <p className="hidden sm:block text-base lg:text-lg text-gray-200 leading-relaxed line-clamp-2 lg:line-clamp-3 break-words">
                  {featuredArticle.content}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm pt-1 sm:pt-2">
                  <span className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full backdrop-blur-sm text-gray-200">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    {new Date(featuredArticle.created_date).toLocaleDateString('he-IL', { 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
        </section>

        {/* Weather Forecast Button */}
        <section className="px-0 sm:px-4 mb-8">
          <motion.button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('openWeatherChat'));
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-full bg-gradient-to-r from-[#E31E24] via-[#0080FF] to-[#E31E24] hover:from-[#0080FF] hover:via-[#E31E24] hover:to-[#0080FF] text-white py-2 sm:py-5 rounded-2xl shadow-[0_0_40px_rgba(227,30,36,0.6)] border-2 border-[#E31E24]/50 flex items-center justify-center gap-2 sm:gap-3 font-bold text-sm sm:text-lg transition-all"
          >
            <Cloud className="w-5 sm:w-7 h-5 sm:h-7 drop-shadow-[0_0_8px_currentColor]" />
          </motion.button>
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

      {/* Weather Forecast Modal */}
      <WeatherForecastModal 
        isOpen={weatherChatOpen}
        onClose={() => setWeatherChatOpen(false)}
      />



      {/* Studio Sidebar */}
      <StudioSidebar />








      {/* CTA Section */}
      <section className="mx-4 bg-[#E31E24]/90 backdrop-blur-sm rounded-2xl p-8 text-white text-center">
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