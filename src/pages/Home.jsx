import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Radio, TrendingUp, Clock, ChevronLeft, Flame, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import LivePlayer from "../components/news/LivePlayer";
import NewsCard from "../components/news/NewsCard";
import ReportersFeed from "../components/news/ReportersFeed";
import UpdatesFeed from "../components/news/UpdatesFeed";

export default function Home() {
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['news-articles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 20),
    initialData: []
  });

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

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="w-full aspect-video rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section - Extended Live Player */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-3 -mx-4 px-4">
        {/* Right Sidebar - Updates Feed */}
        <aside className="lg:col-span-2 hidden lg:block">
          <UpdatesFeed />
        </aside>

        {/* Center - Extended Live Player */}
        <div className="lg:col-span-8">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E31E24] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E31E24]"></span>
              </div>
              <h2 className="text-white text-lg font-bold">שידור חי</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Users size={16} />
                <span className="font-bold text-white">{activeLive?.viewer_count || 3456}</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <LivePlayer 
              title={activeLive?.title || "הרשת החדשה - שידור חי"}
              isLive={!!activeLive?.is_active}
              viewerCount={activeLive?.viewer_count || 3456}
            />
            
            {/* Features Below Player */}
            <div className="grid grid-cols-3 gap-3 mt-3">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg p-4 shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-xl">🔴</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">שידור 24/7</h3>
                    <p className="text-xs text-gray-500">תמיד מעודכנים</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg p-4 shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">עדכונים מהירים</h3>
                    <p className="text-xs text-gray-500">בזמן אמת</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg p-4 shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">כיסוי מקיף</h3>
                    <p className="text-xs text-gray-500">מכל הזירות</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Left Sidebar - Reporters Feed */}
        <aside className="lg:col-span-2 hidden lg:block">
          <ReportersFeed />
        </aside>
      </section>



      {/* Category Navigation Bar */}
      <section className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { label: "ביטחון", cat: "security", icon: "🛡️", color: "hover:bg-orange-50 hover:text-orange-700" },
            { label: "כלכלה", cat: "economy", icon: "💰", color: "hover:bg-green-50 hover:text-green-700" },
            { label: "פוליטיקה", cat: "politics", icon: "🏛️", color: "hover:bg-purple-50 hover:text-purple-700" },
            { label: "טכנולוגיה", cat: "technology", icon: "💻", color: "hover:bg-blue-50 hover:text-blue-700" },
            { label: "ספורט", cat: "sports", icon: "⚽", color: "hover:bg-emerald-50 hover:text-emerald-700" },
            { label: "בידור", cat: "entertainment", icon: "🎬", color: "hover:bg-pink-50 hover:text-pink-700" },
            { label: "עולם", cat: "world", icon: "🌍", color: "hover:bg-indigo-50 hover:text-indigo-700" },
            { label: "בריאות", cat: "health", icon: "❤️", color: "hover:bg-red-50 hover:text-red-700" },
          ].map(item => (
            <Link
              key={item.cat}
              to={createPageUrl(`Category?cat=${item.cat}`)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 transition-all ${item.color}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Latest News Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#E31E24]" />
            <h2 className="text-xl font-bold">חדשות אחרונות</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {regularNews.map((article, index) => (
            <NewsCard key={article.id} article={article} index={index} />
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-[#E31E24]" />
          <h2 className="text-2xl font-bold">הכי נצפה עכשיו</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingNews.slice(0, 3).map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                to={createPageUrl(`Article?id=${article.id}`)}
                className="block group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl font-bold text-[#E31E24]">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-[#E31E24] transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                      {article.subtitle || article.content?.slice(0, 100)}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#E31E24] rounded-2xl p-8 text-white text-center">
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