import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Calendar, Filter, Archive as ArchiveIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NewsCard from "../components/news/NewsCard";
import moment from "moment";

const categoryLabels = {
  breaking: "חדשות חמות",
  security: "ביטחון",
  economy: "כלכלה",
  finance: "פיננסים",
  politics: "פוליטיקה",
  technology: "טכנולוגיה",
  sports: "ספורט",
  entertainment: "בידור",
  music: "מוזיקה",
  world: "עולם",
  health: "בריאות",
  horoscope: "מזלות"
};

export default function Archive() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialSearch = urlParams.get('search') || "";
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");

  const { data: allArticles = [], isLoading } = useQuery({
    queryKey: ['archive-articles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 500),
    initialData: []
  });

  // Filter articles
  const filteredArticles = allArticles.filter(article => {
    const matchesSearch = searchQuery === "" || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    
    let matchesDate = true;
    if (selectedDate !== "all") {
      const articleDate = moment(article.created_date);
      const now = moment();
      
      if (selectedDate === "today") {
        matchesDate = articleDate.isSame(now, 'day');
      } else if (selectedDate === "week") {
        matchesDate = articleDate.isAfter(now.subtract(7, 'days'));
      } else if (selectedDate === "month") {
        matchesDate = articleDate.isAfter(now.subtract(30, 'days'));
      }
    }
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  // Group by date
  const articlesByDate = filteredArticles.reduce((acc, article) => {
    const date = moment(article.created_date).format('DD/MM/YYYY');
    if (!acc[date]) acc[date] = [];
    acc[date].push(article);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
            <ArchiveIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">ארכיון חדשות</h1>
            <p className="text-gray-300">כל הכתבות והחדשות שפורסמו באתר</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">סה"כ כתבות:</span>
          <span className="text-2xl font-bold text-[#E31E24]">{allArticles.length}</span>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-[#E31E24]" />
          <h2 className="font-bold text-lg dark:text-white">סינון וחיפוש</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="חפש כתבה..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="כל הקטגוריות" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הקטגוריות</SelectItem>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger>
              <SelectValue placeholder="כל התקופות" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל התקופות</SelectItem>
              <SelectItem value="today">היום</SelectItem>
              <SelectItem value="week">שבוע אחרון</SelectItem>
              <SelectItem value="month">חודש אחרון</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          נמצאו {filteredArticles.length} כתבות
        </div>
      </div>

      {/* Articles by Date */}
      {Object.keys(articlesByDate).length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
          <ArchiveIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">לא נמצאו כתבות</h3>
          <p className="text-gray-500 dark:text-gray-400">נסה לשנות את הפילטרים</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(articlesByDate).map(([date, articles]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-[#E31E24]" />
                <h3 className="text-xl font-bold dark:text-white">{date}</h3>
                <span className="text-sm text-gray-500">({articles.length} כתבות)</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article, index) => (
                  <NewsCard key={article.id} article={article} index={index} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}