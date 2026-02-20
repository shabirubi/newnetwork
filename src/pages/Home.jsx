import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, TrendingUp, Clock, ChevronLeft, Flame, Zap, Target, Shield, DollarSign, Landmark, Cpu, Trophy, Clapperboard, Globe, Heart, Tv, Newspaper, MessageCircle, Settings, X, Film, Video, Cloud, BookOpen, Microscope, TreePine, Scale, Music, Stars, Home as HomeIcon, AlertTriangle, Droplet, Mic, Users, Wand2, FileVideo } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import LivePlayer from "../components/news/LivePlayer";
import NewsCard from "../components/news/NewsCard";
import UpdatesFeed from "../components/news/UpdatesFeed";
import EntertainmentUpdatesFeed from "../components/news/EntertainmentUpdatesFeed";
import HorizontalNewsScroller from "../components/news/HorizontalNewsScroller";
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
import ReporterLiveChat from "../components/reporter/ReporterLiveChat";

import ZakaMediaKitContainer from "../components/home/ZakaMediaKitContainer";
import WeatherForecastModal from "../components/weather/WeatherForecastModal";

// Lazy loaded components
const NewsReels = React.lazy(() => import("../components/news/NewsReels"));
const TrendingTopicsContainer = React.lazy(() => import("../components/home/TrendingTopicsContainer"));
const TikTokNewsContainer = React.lazy(() => import("../components/home/TikTokNewsContainer"));
const AllVideosGallery = React.lazy(() => import("../components/home/AllVideosGallery"));
const KanArchiveContainer = React.lazy(() => import("../components/home/KanArchiveContainer"));
const ReporterResponsesFeed = React.lazy(() => import("../components/home/ReporterResponsesFeed"));
const TrendingVideosContainer = React.lazy(() => import("../components/home/TrendingVideosContainer"));

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
  const [livePlayerModalOpen, setLivePlayerModalOpen] = React.useState(false);


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



        {/* Weather Forecast Button */}
        <section className="w-full px-4 mb-4 sm:mb-8 flex justify-center">
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
            className="w-[140px] sm:w-[200px] bg-gradient-to-r from-[#E31E24] via-[#0080FF] to-[#E31E24] hover:from-[#0080FF] hover:via-[#E31E24] hover:to-[#0080FF] text-white py-3 sm:py-5 rounded-lg sm:rounded-2xl shadow-[0_0_40px_rgba(227,30,36,0.6)] border border-[#E31E24]/50 flex items-center justify-center gap-2 sm:gap-3 font-bold text-xs sm:text-lg transition-all"
          >
            <Cloud className="w-5 sm:w-7 h-5 sm:h-7 drop-shadow-[0_0_8px_currentColor]" />
          </motion.button>
        </section>











      {/* Horizontal News Scrollers */}
      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="security"
          title="ביטחון ומדיניות"
          icon={Shield}
        />
      </section>

      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="economy"
          title="כלכלה ועסקים"
          icon={DollarSign}
        />
      </section>

      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="technology"
          title="טכנולוגיה"
          icon={Cpu}
        />
      </section>

      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="crime"
          title="פלילים ומשטרה"
          icon={AlertTriangle}
        />
      </section>

      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="crime"
          title="חדשות פלילים"
          icon={Shield}
        />
      </section>

      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="politics"
          title="פוליטיקה"
          icon={Landmark}
        />
      </section>

      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="sports"
          title="ספורט"
          icon={Trophy}
        />
      </section>

      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="entertainment"
          title="בידור ותרבות"
          icon={Clapperboard}
        />
      </section>

      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="world"
          title="חדשות עולם"
          icon={Globe}
        />
      </section>

      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="health"
          title="בריאות"
          icon={Heart}
        />
      </section>

      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="israel"
          title="חדשות ישראל"
          icon={Newspaper}
        />
      </section>

      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="education"
          title="חינוך"
          icon={BookOpen}
        />
      </section>

      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="culture"
          title="תרבות"
          icon={Clapperboard}
        />
      </section>

      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="environment"
          title="סביבה"
          icon={TreePine}
        />
      </section>

      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="science"
          title="מדע"
          icon={Microscope}
        />
      </section>

      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="military"
          title="צבא וביטחון"
          icon={Shield}
        />
      </section>

      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="law"
          title="משפט ופלילים"
          icon={Scale}
        />
      </section>

      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="local"
          title="חדשות מקומיות"
          icon={HomeIcon}
        />
      </section>

      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="documentary"
          title="סדרות תיעודיות"
          icon={Film}
        />
      </section>

      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="music"
          title="מוזיקה"
          icon={Music}
        />
      </section>

      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="horoscope"
          title="הורוסקופ ואסטרולוגיה"
          icon={Stars}
        />
      </section>

      <section className="w-full px-4 mb-4 sm:mb-8">
        <HorizontalNewsScroller
          category="finance"
          title="פיננסים והשקעות"
          icon={TrendingUp}
        />
      </section>





      {/* TikTok News Feed */}
      <section className="px-4 mb-8 max-w-full overflow-hidden">
        <React.Suspense fallback={<Skeleton className="w-full h-96 bg-gray-800" />}>
          <TikTokNewsContainer />
        </React.Suspense>
      </section>

      {/* All Videos Gallery */}
      <section className="px-4 mb-8 max-w-full overflow-hidden">
        <React.Suspense fallback={<Skeleton className="w-full h-96 bg-gray-800" />}>
          <AllVideosGallery />
        </React.Suspense>
      </section>



      {/* Reporter Responses Feed */}
      <section className="px-4 mb-8 max-w-full overflow-hidden">
        <React.Suspense fallback={<Skeleton className="w-full h-96 bg-gray-800" />}>
          <ReporterResponsesFeed />
        </React.Suspense>
      </section>



      {/* User Uploaded Videos */}
      <section className="px-4 mb-8 max-w-full overflow-hidden">
        <UserUploadedVideos />
      </section>

      {/* Entertainment Updates */}
      <section className="px-4 mb-8 max-w-full overflow-hidden">
        <EntertainmentUpdatesFeed />
      </section>

      {/* Zaka Media Kit */}
      <section className="px-4 mb-8 max-w-full overflow-hidden">
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

      {/* Live Player Modal */}
      <AnimatePresence>
        {livePlayerModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4"
            onClick={() => setLivePlayerModalOpen(false)}
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full h-full sm:h-auto sm:max-w-6xl sm:rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLivePlayerModalOpen(false)}
                className="absolute top-4 left-4 z-[10000] bg-black/80 hover:bg-black text-white p-2 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              <LivePlayer 
                title={finalTitle}
                isLive={!!activeLive?.is_active}
                viewerCount={activeLive?.viewer_count || 3456}
                streamUrl={finalStreamUrl}
                thumbnailUrl={finalThumbnail}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Live Button */}
      <motion.button
        onClick={() => setLivePlayerModalOpen(true)}
        className="fixed bottom-24 left-4 z-50 bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#E31E24] text-white p-4 rounded-full shadow-2xl shadow-[#E31E24]/50 border-2 border-[#E31E24]/50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            '0 0 20px rgba(227, 30, 36, 0.5)',
            '0 0 40px rgba(227, 30, 36, 0.8)',
            '0 0 20px rgba(227, 30, 36, 0.5)'
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Radio className="w-6 h-6" />
      </motion.button>

      {/* Floating Digital Dreams Button */}
      <Link to={createPageUrl("VideoCreator")}>
        <motion.button
          className="fixed bottom-40 left-4 z-50 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 rounded-full shadow-2xl shadow-purple-500/50 border-2 border-purple-500/50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              '0 0 20px rgba(168, 85, 247, 0.5)',
              '0 0 40px rgba(168, 85, 247, 0.8)',
              '0 0 20px rgba(168, 85, 247, 0.5)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Video className="w-6 h-6" />
        </motion.button>
      </Link>

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