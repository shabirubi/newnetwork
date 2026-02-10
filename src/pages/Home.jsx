import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, TrendingUp, Clock, ChevronLeft, Flame, Zap, Target, Shield, DollarSign, Landmark, Cpu, Trophy, Clapperboard, Globe, Heart, Tv, Newspaper, MessageCircle, Settings, X, Film } from "lucide-react";
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
import LiveAvatarChatModal from "../components/avatar/LiveAvatarChatModal";

import TikTokNewsFeed from "../components/news/TikTokNewsFeed";
import VODModal from "../components/vod/VODModal";
import AccessibilityPanel from "../components/accessibility/AccessibilityPanel";
import UploadVideoModal from "../components/home/UploadVideoModal";
import UserUploadedVideos from "../components/home/UserUploadedVideos";
import ReportersSpotlight from "../components/home/ReportersSpotlight";
import { Droplet, Mic, Users, Wand2, FileVideo } from "lucide-react";

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
  const [reportersModalOpen, setReportersModalOpen] = React.useState(false);
  const [liveAvatarChatOpen, setLiveAvatarChatOpen] = React.useState(false);
  const [showLivePlayer, setShowLivePlayer] = React.useState(false);
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
        <div className="relative h-[500px] sm:h-[600px] lg:h-[700px] rounded-none sm:rounded-3xl overflow-hidden">
          {/* Background Image */}
          <img 
            src={featuredArticle.image_url} 
            alt={featuredArticle.title}
            className="w-full h-full object-cover"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-16">
            <div className="space-y-6 max-w-4xl">
              {/* Badge */}
              <div className="inline-flex w-fit bg-[#E31E24] text-white px-5 py-2 rounded-full font-bold text-base">
                📈 כלכלה ופיננסים
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-2xl">
                {featuredArticle.title}
              </h1>

              {/* Subtitle */}
              <p className="text-xl sm:text-2xl text-gray-100 drop-shadow-lg">
                {featuredArticle.subtitle}
              </p>

              {/* Content Preview */}
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-3xl">
                {featuredArticle.content}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <span className="flex items-center gap-2 text-gray-200 text-sm bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Clock className="w-4 h-4" />
                  {new Date(featuredArticle.created_date).toLocaleDateString('he-IL', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className="text-gray-200 text-sm bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
                  📰 {featuredArticle.source}
                </span>
              </div>
            </div>
          </div>
        </div>
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
            className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991818] text-white py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 font-bold text-lg transition-all"
          >
            <Radio className="w-6 h-6" />
            הפעל שידור חי
          </motion.button>
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

      {/* LiveAvatar Chat Modal */}
      <LiveAvatarChatModal 
        isOpen={liveAvatarChatOpen} 
        onClose={() => setLiveAvatarChatOpen(false)} 
      />











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