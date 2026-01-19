import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Radio, TrendingUp, Clock, ChevronLeft, Flame, Zap, Target, Shield, DollarSign, Landmark, Cpu, Trophy, Clapperboard, Globe, Heart, Tv, Newspaper, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import WelcomeVideoOverlay from "../components/home/WelcomeVideoOverlay";
import LivePlayer from "../components/news/LivePlayer";
import NewsCard from "../components/news/NewsCard";
import UpdatesFeed from "../components/news/UpdatesFeed";
import EntertainmentUpdatesFeed from "../components/news/EntertainmentUpdatesFeed";

import CategoriesMenu from "../components/shared/CategoriesMenu";
import VideoHighlights from "../components/news/VideoHighlights";
import TalkingAvatar from "../components/avatar/TalkingAvatar";

import AutoNewsUpdater from "../components/news/AutoNewsUpdater";
import AutoChannelsUpdater from "../components/news/AutoChannelsUpdater";

import TikTokNewsFeed from "../components/news/TikTokNewsFeed";
import AIAnnouncer from "../components/news/AIAnnouncer";
import TVAnchor from "../components/news/TVAnchor";
import VODModal from "../components/vod/VODModal";
import BroadcastStrip from "../components/news/BroadcastStrip";
import AccessibilityPanel from "../components/accessibility/AccessibilityPanel";
import NewsReels from "../components/news/NewsReels";
import LiveReporterQA from "../components/news/LiveReporterQA";
import TestimonialsSection from "../components/home/TestimonialsSection";
import TikTokNewsContainer from "../components/home/TikTokNewsContainer";
import TrendingTopicsContainer from "../components/home/TrendingTopicsContainer";
import NewsletterSignup from "../components/home/NewsletterSignup";
import ReportersSpotlight from "../components/home/ReportersSpotlight";
import BreakingNewsWidget from "../components/home/BreakingNewsWidget";
import ExpertAnalysisContainer from "../components/home/ExpertAnalysisContainer";
import NewsStatisticsDashboard from "../components/home/NewsStatisticsDashboard";
import UserExperienceFeatures from "../components/home/UserExperienceFeatures";
import UserUploadedVideos from "../components/home/UserUploadedVideos";
import UploadVideoModal from "../components/home/UploadVideoModal";
import NewsSearch from "../components/apps/NewsSearch";
import LiveStatsApp from "../components/apps/LiveStatsApp";
import NewsQuiz from "../components/apps/NewsQuiz";
import PersonalAlerts from "../components/apps/PersonalAlerts";
import NewsMap from "../components/apps/NewsMap";
import DailySummary from "../components/apps/DailySummary";
import ArticleRating from "../components/apps/ArticleRating";
import WeatherWidget from "../components/apps/WeatherWidget";
import BreakingNotifications from "../components/apps/BreakingNotifications";
import ReadingList from "../components/apps/ReadingList";
import NewsTimeline from "../components/apps/NewsTimeline";
import VoiceNews from "../components/apps/VoiceNews";
import TodoList from "../components/apps/TodoList";
import TrendingHashtags from "../components/apps/TrendingHashtags";
import FavoriteCategories from "../components/apps/FavoriteCategories";
import FactChecker from "../components/apps/FactChecker";
import ReporterChat from "../components/apps/ReporterChat";
import LiveStatisticsContainer from "../components/home/LiveStatisticsContainer";
import MostViewedContainer from "../components/home/MostViewedContainer";
import CategoriesHighlightContainer from "../components/home/CategoriesHighlightContainer";
import WorldNewsContainer from "../components/home/WorldNewsContainer";
import ShortVideosContainer from "../components/home/ShortVideosContainer";
import WorldNewsReportersContainer from "../components/home/WorldNewsReportersContainer";
import MoviesSeriesContainer from "../components/home/MoviesSeriesContainer";
import PlutoTVChannelsContainer from "../components/home/PlutoTVChannelsContainer";



export default function Home() {
  const [welcomeVideoShown, setWelcomeVideoShown] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('welcomeVideoShown');
    }
    return true;
  });
  const [vodModalOpen, setVodModalOpen] = React.useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = React.useState(false);
  const [a11yOpen, setA11yOpen] = React.useState(false);
  const [uploadVideoModalOpen, setUploadVideoModalOpen] = React.useState(false);
  const [reporterChatOpen, setReporterChatOpen] = React.useState(false);
  const [selectedChannel, setSelectedChannel] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedChannel') || 'all';
    }
    return 'all';
  });

  const handleWelcomeVideoEnd = () => {
    setWelcomeVideoShown(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('welcomeVideoShown', 'true');
    }
  };
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

  const queryClient = useQueryClient();

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
    refetchInterval: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    initialData: [],
    placeholderData: (prev) => prev
  });

  React.useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['news-articles'] });
  }, [queryClient]);

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
    <div className="min-h-screen bg-black space-y-0 sm:space-y-6">
      {/* Welcome Video Overlay */}
      {welcomeVideoShown && (
        <WelcomeVideoOverlay onVideoEnd={handleWelcomeVideoEnd} />
      )}

      <AutoNewsUpdater />
      <AutoChannelsUpdater />

      {/* Live Player Section */}
      <section className="px-0 sm:px-0 mb-0 -mt-14">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4">
          <LivePlayer 
            title={currentChannel?.name || activeLive?.title || "הרשת החדשה - שידור חי"}
            isLive={!!activeLive?.is_active}
            viewerCount={activeLive?.viewer_count || 3456}
            streamUrl={channelStreamUrl}
          />
        </div>
      </section>

      {/* Featured Video Section */}
      <section className="px-4 mt-6">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <iframe 
              src="https://www.youtube.com/embed/4miQnYCTdS8"
              width="100%" 
              height="500" 
              frameBorder="0" 
              allowFullScreen="" 
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              className="rounded-lg max-w-md flex-shrink-0"
            />
            <button
              onClick={() => {
                const videosSection = document.getElementById('user-videos-section');
                if (videosSection) {
                  videosSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 whitespace-nowrap"
            >
              אם ברצונכם לצפות בעדכונים נוספים לחצו כאן
            </button>
          </div>
        </div>
      </section>

            {/* Floating Action Buttons - Left Side Column */}
                  <div className="fixed left-4 sm:left-6 top-20 z-50 flex flex-col gap-2">
                    {/* Reporter Chat Button */}
                    <motion.button
                      onClick={() => setReporterChatOpen(true)}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.3, delay: -0.4 }}
                      className="bg-gradient-to-br from-black/80 via-[#E31E24]/60 to-black/80 backdrop-blur-sm rounded-full p-2.5 sm:p-2 shadow-lg border-2 border-[#E31E24]/40 hover:border-[#E31E24]/70 transition-all animate-pulse"
                      title="צ'אט כתבים"
                    >
                      <MessageCircle className="w-6 h-6 sm:w-5 sm:h-5 text-white" />
                    </motion.button>

                    {/* Accessibility Button */}
                    <motion.button
                      onClick={() => setA11yOpen(true)}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.3, delay: -0.2 }}
                      className="bg-gradient-to-br from-black/80 via-[#E31E24]/60 to-black/80 backdrop-blur-sm rounded-full p-4 sm:p-3.5 shadow-2xl border-2 border-[#E31E24]/40 hover:border-[#E31E24]/70 transition-all"
                      title="אפשרויות נגישות"
                    >
                      <svg className="w-6 h-6 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                    </motion.button>



              {/* VOD Button */}
              <motion.button
                onClick={() => window.location.href = createPageUrl("VODContent")}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group relative bg-gradient-to-br from-black/80 via-[#E31E24]/60 to-black/80 backdrop-blur-sm rounded-full p-4 sm:p-3.5 shadow-2xl border-2 border-[#E31E24]/40 hover:border-[#E31E24]/70 transition-all"
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
          className="group relative bg-gradient-to-br from-black/80 via-[#E31E24]/60 to-black/80 backdrop-blur-sm rounded-full p-4 sm:p-3.5 shadow-2xl border-2 border-[#E31E24]/40 hover:border-[#E31E24]/70 transition-all"
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
          className="group relative bg-gradient-to-br from-black/80 via-[#E31E24]/60 to-black/80 backdrop-blur-sm rounded-full p-4 sm:p-3.5 shadow-2xl border-2 border-[#E31E24]/40 hover:border-[#E31E24]/70 transition-all animate-pulse"
          title="שידור חי"
        >
          <Radio className="w-6 h-6 sm:w-5 sm:h-5 text-white" />
        </motion.button>
      </div>

      {/* Hero Section - TikTok News Feed */}
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

      {/* News Reels Section */}
      <NewsReels />

      {/* Trending Topics Container */}
      <TrendingTopicsContainer />

      {/* TikTok News Container */}
      <TikTokNewsContainer />

      {/* Breaking News Widget */}
      <BreakingNewsWidget />

      {/* Reporters Spotlight */}
      <ReportersSpotlight />

      {/* Expert Analysis */}
      <ExpertAnalysisContainer />

      {/* News Statistics Dashboard */}
      <NewsStatisticsDashboard />

      {/* Live Statistics Container */}
      <LiveStatisticsContainer />

      {/* Most Viewed Container */}
      <MostViewedContainer />

      {/* Categories Highlight Container */}
      <CategoriesHighlightContainer />

      {/* World News Container */}
      <WorldNewsContainer />

      {/* Short Videos Container */}
      <ShortVideosContainer />

      {/* World News Reporters Container */}
      <WorldNewsReportersContainer />

      {/* Movies Series Container */}
      <MoviesSeriesContainer />

      {/* Pluto TV Channels Container */}
      <PlutoTVChannelsContainer />

      {/* Newsletter Signup */}
      <NewsletterSignup />

      {/* Live Reporter Q&A Section */}
      <LiveReporterQA />

      {/* Testimonials Section */}
      <TestimonialsSection />

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

      {/* Accessibility Panel */}
      <AccessibilityPanel isOpen={a11yOpen} onClose={() => setA11yOpen(false)} />



      {/* Talking Avatar */}
      <TalkingAvatar />

      {/* User Experience Features */}
      <UserExperienceFeatures />

      {/* User Uploaded Videos */}
      <div id="user-videos-section">
        <UserUploadedVideos onUploadClick={() => setUploadVideoModalOpen(true)} />
      </div>

      {/* Apps Section */}
      <section className="px-4 space-y-8 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold dark:text-white mb-2">אפליקציות אינטראקטיביות</h2>
          <p className="text-gray-400">כלים חכמים לחוויית משתמש משופרת</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <NewsSearch />
          <LiveStatsApp />
          <NewsQuiz />
          <PersonalAlerts />
          <NewsMap />
          <DailySummary />
          <ArticleRating />
          <WeatherWidget />
          <BreakingNotifications />
          <ReadingList />
          <NewsTimeline />
          <VoiceNews />
          <TodoList />
          <TrendingHashtags />
          <FavoriteCategories />
          <FactChecker />
          <ReporterChat externalIsOpen={reporterChatOpen} externalSetIsOpen={setReporterChatOpen} />
        </div>
      </section>

      {/* Spotify Section */}
      <section className="px-4 mb-12">
        <h2 className="text-3xl font-bold dark:text-white mb-6 text-center">שיר היום</h2>
        <div className="flex justify-center">
          <iframe 
            src="https://open.spotify.com/embed/track/0v2ZtLZ0IMss2OZre5Qulh?utm_source=generator" 
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
        <h2 className="text-3xl font-bold dark:text-white mb-6 text-center">וידאו מומלץ</h2>
        <div className="flex justify-center">
          <iframe 
            src="https://www.youtube.com/embed/KTvV8GJ1WAE?autoplay=1"
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