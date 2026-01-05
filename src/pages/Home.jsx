import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Radio, TrendingUp, Clock, ChevronLeft, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import LivePlayer from "../components/news/LivePlayer";
import NewsCard from "../components/news/NewsCard";

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
    <div className="space-y-10">
      {/* Hero Section - Live Stream + Featured News */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Stream */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#E31E24] flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold">שידור חי</h2>
          </div>
          <LivePlayer 
            title={activeLive?.title || "הרשת החדשה - שידור חי"}
            isLive={!!activeLive?.is_active}
            viewerCount={activeLive?.viewer_count || 1234}
          />
        </div>

        {/* Breaking News Sidebar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#E31E24]" />
              <h3 className="font-bold text-lg">חדשות חמות</h3>
            </div>
            <Link 
              to={createPageUrl("Category?cat=breaking")}
              className="text-[#E31E24] text-sm hover:underline flex items-center gap-1"
            >
              הכל
              <ChevronLeft size={16} />
            </Link>
          </div>
          
          <div className="space-y-1">
            {breakingNews.length > 0 ? (
              breakingNews.slice(0, 5).map((article, index) => (
                <NewsCard 
                  key={article.id} 
                  article={article} 
                  variant="compact"
                  index={index}
                />
              ))
            ) : (
              trendingNews.slice(0, 5).map((article, index) => (
                <NewsCard 
                  key={article.id} 
                  article={article} 
                  variant="compact"
                  index={index}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section>
          <NewsCard article={featuredArticle} variant="featured" />
        </section>
      )}

      {/* Category Quick Links */}
      <section className="flex flex-wrap gap-3">
        {[
          { label: "ביטחון", cat: "security", color: "bg-orange-100 text-orange-700" },
          { label: "כלכלה", cat: "economy", color: "bg-green-100 text-green-700" },
          { label: "פוליטיקה", cat: "politics", color: "bg-purple-100 text-purple-700" },
          { label: "טכנולוגיה", cat: "technology", color: "bg-blue-100 text-blue-700" },
          { label: "ספורט", cat: "sports", color: "bg-emerald-100 text-emerald-700" },
          { label: "בידור", cat: "entertainment", color: "bg-pink-100 text-pink-700" },
        ].map(item => (
          <Link
            key={item.cat}
            to={createPageUrl(`Category?cat=${item.cat}`)}
            className={`${item.color} px-4 py-2 rounded-full text-sm font-medium hover:opacity-80 transition-opacity`}
          >
            {item.label}
          </Link>
        ))}
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