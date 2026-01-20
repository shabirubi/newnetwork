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

import VideosFeed from "../components/home/VideosFeed";
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
import AllVideosGallery from "../components/home/AllVideosGallery";



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

      {/* All Videos Gallery */}
      <AllVideosGallery />

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
        <h2 className="text-3xl font-bold dark:text-white mb-6 text-center">שידור חי</h2>
        <div className="flex justify-center">
          <iframe 
            src="https://www.youtube.com/embed/f40ydG9WB74?autoplay=1"
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