import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, X, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";

import LivePlayer from "../components/news/LivePlayer";
import AllCategoryEditors from "../components/home/CategoryArticleEditor";
import FeaturedArticleEditor from "../components/home/FeaturedArticleEditor";
import HomeCategoryFeed from "../components/home/HomeCategoryFeed";

import WeatherAlertsContainer from "../components/weather/WeatherAlertsContainer";
import CategoriesMenu from "../components/shared/CategoriesMenu";
import ReportersModal from "../components/reporter/ReportersModal";
import LiveAvatarChatModal from "../components/avatar/LiveAvatarChatModal";
import VODModal from "../components/vod/VODModal";
import AccessibilityPanel from "../components/accessibility/AccessibilityPanel";
import UploadVideoModal from "../components/home/UploadVideoModal";
import ReporterLiveChat from "../components/reporter/ReporterLiveChat";
import PodcastUploadModal from "../components/home/PodcastUploadModal";
import WeatherForecastModal from "../components/weather/WeatherForecastModal";
import YouTubeFloatingButton from "../components/home/YouTubeFloatingButton";
import OrefAlertsPanel from "../components/home/OrefAlertsPanel";
import OrefEmergencyPopup from "../components/home/OrefEmergencyPopup";
import ReelsStrip from "../components/home/ReelsStrip";

export default function Home() {
  const [vodModalOpen, setVodModalOpen] = useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
  const [a11yOpen, setA11yOpen] = useState(false);
  const [uploadVideoModalOpen, setUploadVideoModalOpen] = useState(false);
  const [uploadPodcastModalOpen, setUploadPodcastModalOpen] = useState(false);
  const [livePlayerModalOpen, setLivePlayerModalOpen] = useState(false);
  const [reportersModalOpen, setReportersModalOpen] = useState(false);
  const [liveAvatarChatOpen, setLiveAvatarChatOpen] = useState(false);
  const [liveChatOpen, setLiveChatOpen] = useState(false);
  const [selectedReporterForChat, setSelectedReporterForChat] = useState(null);
  const [weatherChatOpen, setWeatherChatOpen] = useState(false);

  useEffect(() => {
    const handleOpenUpload = () => setUploadVideoModalOpen(true);
    const handleOpenPodcast = () => setUploadPodcastModalOpen(true);
    const handleOpenWeatherChat = () => setWeatherChatOpen(true);
    window.addEventListener('openUploadVideo', handleOpenUpload);
    window.addEventListener('openUploadPodcast', handleOpenPodcast);
    window.addEventListener('openWeatherChatModal', handleOpenWeatherChat);
    return () => {
      window.removeEventListener('openUploadVideo', handleOpenUpload);
      window.removeEventListener('openUploadPodcast', handleOpenPodcast);
      window.removeEventListener('openWeatherChatModal', handleOpenWeatherChat);
    };
  }, []);

  const queryClient = useQueryClient();

  // Pre-load articles into shared cache — HomeCategoryFeed uses the same queryKey
  useQuery({
    queryKey: ['featured-articles'],
    queryFn: async () => {
      try { return await base44.entities.NewsArticle.list('-created_date', 50); }
      catch { return []; }
    },
    initialData: [],
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-black space-y-0 sm:space-y-6">

      {/* OREF Emergency Popup */}
      <OrefEmergencyPopup />

      {/* OREF Alerts */}
      <OrefAlertsPanel />

      {/* Reels Strip — shares "home-all-videos" cache with HomeCategoryFeed */}
      <ReelsStrip />

      {/* Featured Article Editor (כתבה מרכזית) */}
      <FeaturedArticleEditor />

      {/* Category Article Editor toolbar */}
      <AllCategoryEditors />

      {/* Main content: reels strip + articles per category */}
      <HomeCategoryFeed />

      {/* ── Modals ── */}
      <VODModal isOpen={vodModalOpen} onClose={() => setVodModalOpen(false)} />
      <CategoriesMenu isOpen={categoriesMenuOpen} onClose={() => setCategoriesMenuOpen(false)} />
      <UploadVideoModal isOpen={uploadVideoModalOpen} onClose={() => setUploadVideoModalOpen(false)} />
      <ReportersModal isOpen={reportersModalOpen} onClose={() => setReportersModalOpen(false)} />
      <AccessibilityPanel isOpen={a11yOpen} onClose={() => setA11yOpen(false)} />
      <LiveAvatarChatModal isOpen={liveAvatarChatOpen} onClose={() => setLiveAvatarChatOpen(false)} />
      <ReporterLiveChat
        isOpen={liveChatOpen}
        onClose={() => { setLiveChatOpen(false); setSelectedReporterForChat(null); }}
        reporter={selectedReporterForChat || { name: 'עדי', image: 'https://via.placeholder.com/150' }}
      />
      <WeatherForecastModal isOpen={weatherChatOpen} onClose={() => setWeatherChatOpen(false)} />

      <AnimatePresence>
        {uploadPodcastModalOpen && (
          <PodcastUploadModal
            onClose={() => setUploadPodcastModalOpen(false)}
            onUploaded={() => {
              setUploadPodcastModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ['userVideos'] });
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {livePlayerModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4"
            onClick={() => setLivePlayerModalOpen(false)}
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full h-full sm:h-auto sm:max-w-6xl sm:rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setLivePlayerModalOpen(false)}
                className="absolute top-4 left-4 z-[10000] bg-black/80 hover:bg-black text-white p-2 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
              <LivePlayer title="הרשת החדשה - שידור חי" isLive={false} viewerCount={3456} streamUrl="" thumbnailUrl="" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Section */}
      <section className="mx-4 bg-[#E31E24]/90 backdrop-blur-sm rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">הצטרפו למהפכה התקשורתית</h2>
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

      <YouTubeFloatingButton />
    </div>
  );
}