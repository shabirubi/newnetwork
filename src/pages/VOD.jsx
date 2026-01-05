import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Film, TrendingUp, Clock, Star, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import VODCard from "../components/vod/VODCard";

const categories = [
  { id: "all", label: "הכל", color: "bg-gray-600" },
  { id: "action", label: "אקשן", color: "bg-red-600" },
  { id: "drama", label: "דרמה", color: "bg-purple-600" },
  { id: "comedy", label: "קומדיה", color: "bg-yellow-600" },
  { id: "thriller", label: "מתח", color: "bg-gray-800" },
  { id: "documentary", label: "דוקומנטרי", color: "bg-blue-600" },
  { id: "sports", label: "ספורט", color: "bg-green-600" },
  { id: "kids", label: "ילדים", color: "bg-pink-500" },
  { id: "romance", label: "רומנטי", color: "bg-rose-600" },
  { id: "horror", label: "אימה", color: "bg-gray-900" },
  { id: "scifi", label: "מדע בדיוני", color: "bg-indigo-600" }
];

export default function VOD() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // recent, popular, rating

  const { data: allContent = [], isLoading } = useQuery({
    queryKey: ['vod-content'],
    queryFn: () => base44.entities.VODContent.list('-created_date', 100),
    initialData: []
  });

  // Filter and sort content
  const filteredContent = allContent
    .filter(item => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "popular") return (b.views || 0) - (a.views || 0);
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return new Date(b.created_date) - new Date(a.created_date);
    });

  const featuredContent = allContent.filter(c => c.is_featured).slice(0, 3);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-64 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-900 dark:to-pink-900 rounded-2xl p-6 lg:p-8 text-white shadow-lg"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <Film className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">ספריית VOD</h1>
            <p className="text-white/80 mt-1">צפו בסרטים ותכניות בכל זמן שתרצו</p>
          </div>
        </div>
        <div className="text-sm text-white/70">
          {filteredContent.length} תכנים זמינים
        </div>
      </motion.div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="חפשו סרט או תכנית..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 text-right"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                selectedCategory === cat.id
                  ? `${cat.color} text-white shadow-lg scale-105`
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">מיון:</span>
          <button
            onClick={() => setSortBy("recent")}
            className={`px-3 py-1 rounded-lg text-xs font-bold ${
              sortBy === "recent" ? "bg-[#E31E24] text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            }`}
          >
            <Clock className="w-3 h-3 inline ml-1" />
            חדשים
          </button>
          <button
            onClick={() => setSortBy("popular")}
            className={`px-3 py-1 rounded-lg text-xs font-bold ${
              sortBy === "popular" ? "bg-[#E31E24] text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            }`}
          >
            <TrendingUp className="w-3 h-3 inline ml-1" />
            פופולריים
          </button>
          <button
            onClick={() => setSortBy("rating")}
            className={`px-3 py-1 rounded-lg text-xs font-bold ${
              sortBy === "rating" ? "bg-[#E31E24] text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            }`}
          >
            <Star className="w-3 h-3 inline ml-1" />
            מדורגים
          </button>
        </div>
      </div>

      {/* Featured Section */}
      {featuredContent.length > 0 && selectedCategory === "all" && !searchQuery && (
        <section>
          <h2 className="text-2xl font-bold mb-4 dark:text-white">מומלצים</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {featuredContent.map((content, index) => (
              <VODCard key={content.id} content={content} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Content Grid */}
      <section>
        {filteredContent.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredContent.map((content, index) => (
              <VODCard key={content.id} content={content} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
            <Film className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
              לא נמצאו תוצאות
            </h3>
            <p className="text-gray-500 dark:text-gray-400">נסו חיפוש או סינון אחר</p>
          </div>
        )}
      </section>
    </div>
  );
}