import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { 
  Users, Mic, TrendingUp, ChevronLeft, Play,
  Filter, Search, MessageCircle, MessageCircleQuestion,
  Video, Phone, Mic2
} from "lucide-react";
import AskReporterModal from "../components/reporter/AskReporterModal";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const categoryLabels = {
  security: "ביטחון",
  economy: "כלכלה",
  politics: "פוליטיקה",
  technology: "טכנולוגיה",
  sports: "ספורט",
  entertainment: "בידור",
  world: "עולם",
  health: "בריאות",
  finance: "פיננסים",
  horoscope: "מזלות",
  music: "מוזיקה",
  breaking: "חדשות חמות"
};

export default function Reporters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [chatReporter, setChatReporter] = useState(null);
  const [askReporter, setAskReporter] = useState(null);
  const [hoveredReporter, setHoveredReporter] = useState(null);

  // CSS for grayscale images
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .reporter-image-bw {
        filter: grayscale(100%) !important;
        -webkit-filter: grayscale(100%) !important;
      }
      .reporter-image-color {
        filter: grayscale(0%) !important;
        -webkit-filter: grayscale(0%) !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const { data: reporters = [], isLoading } = useQuery({
    queryKey: ['reporters'],
    queryFn: async () => {
      const result = await base44.entities.Reporter.list('name');
      console.log('📰 Loaded reporters:', result);
      return result;
    },
    staleTime: 0,
    refetchInterval: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    initialData: []
  });

  const { data: allArticles = [] } = useQuery({
    queryKey: ['reporter-articles-all'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 50),
    staleTime: 2 * 60 * 1000,
    initialData: []
  });

  // Filter reporters
  const filteredReporters = reporters.filter(reporter => {
    const matchesSearch = reporter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reporter.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || reporter.categories?.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Get latest article for each reporter
  const getReporterArticle = (reporter) => {
    return allArticles.find(article => 
      reporter.categories?.some(cat => cat === article.category)
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-32 rounded-2xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <Skeleton key={i} className="h-96 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      {askReporter && (
        <AskReporterModal
          reporter={askReporter}
          isOpen={!!askReporter}
          onClose={() => setAskReporter(null)}
        />
      )}
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] rounded-2xl p-8 mb-8 text-white shadow-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">אנשי השטח שלנו</h1>
            <p className="text-white/90 text-lg">
              הכירו את הצוות המקצועי של הרשת החדשה
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-white/80">
          <span className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            {reporters.length} כתבים
          </span>
          <span className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {allArticles.length} ידיעות אחרונות
          </span>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="חפש כתב לפי שם או תחום..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-gray-400 shrink-0" />
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-[#E31E24] text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              הכל
            </button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === key
                    ? "bg-[#E31E24] text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          מציג {filteredReporters.length} כתבים
          {searchQuery && ` מתוך ${reporters.length}`}
        </div>
      </div>

      {/* Reporters Grid */}
      {filteredReporters.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
            לא נמצאו כתבים
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            נסה לשנות את הסינון או החיפוש
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredReporters.map((reporter, index) => {
            const latestArticle = getReporterArticle(reporter);
            
            return (
              <motion.div
                key={reporter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onMouseEnter={() => setHoveredReporter(reporter.id)}
                onMouseLeave={() => setHoveredReporter(null)}
                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-[#E31E24] dark:hover:border-[#E31E24] relative"
              >
                {/* Reporter Image */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                  <img
                    src={reporter.image}
                    alt={reporter.name}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      hoveredReporter === reporter.id ? 'reporter-image-color' : 'reporter-image-bw'
                    }`}
                    style={{
                      transform: hoveredReporter === reporter.id ? 'scale(1.1)' : 'scale(1)'
                    }}
                  />
                  <div 
                    className="absolute inset-0 transition-all duration-500"
                    style={{
                      background: hoveredReporter === reporter.id 
                        ? 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' 
                        : 'linear-gradient(to top, rgba(227,30,36,0.7), rgba(227,30,36,0.3))'
                    }}
                  />
                  
                  {/* Live Badge */}
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 px-3 py-1 bg-[#E31E24] text-white text-xs font-bold rounded-full">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      LIVE
                    </div>
                  </div>

                  {/* Name Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg">
                      {reporter.name}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {reporter.role}
                    </p>
                  </div>

                  {/* Hover Action Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: hoveredReporter === reporter.id ? 1 : 0,
                      y: hoveredReporter === reporter.id ? 0 : 20
                    }}
                    transition={{ duration: 0.3 }}
                    className={`absolute inset-0 bg-gradient-to-br from-black/95 via-[#E31E24]/90 to-black/95 backdrop-blur-md flex flex-col items-center justify-center gap-3 p-6 ${
                      hoveredReporter === reporter.id ? 'pointer-events-auto' : 'pointer-events-none'
                    }`}
                  >
                    <h3 className="text-white font-bold text-xl mb-2">
                      {reporter.name}
                    </h3>
                    
                    {/* Action Grid */}
                    <div className="grid grid-cols-2 gap-3 w-full">
                      {/* Chat */}
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent('openReporterChat'))}
                        className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all group/btn"
                      >
                        <MessageCircle className="w-8 h-8 text-white group-hover/btn:scale-110 transition-transform" />
                        <span className="text-white text-xs font-bold">צ׳אט</span>
                      </button>

                      {/* Video Call */}
                      <button
                        onClick={() => alert('שיחת וידאו - בקרוב!')}
                        className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all group/btn"
                      >
                        <Video className="w-8 h-8 text-white group-hover/btn:scale-110 transition-transform" />
                        <span className="text-white text-xs font-bold">וידאו</span>
                      </button>

                      {/* Voice Message */}
                      <button
                        onClick={() => alert('הקלטת הודעה קולית - בקרוב!')}
                        className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all group/btn"
                      >
                        <Mic2 className="w-8 h-8 text-white group-hover/btn:scale-110 transition-transform" />
                        <span className="text-white text-xs font-bold">הודעה קולית</span>
                      </button>

                      {/* Q&A */}
                      <button
                        onClick={() => setAskReporter(reporter)}
                        className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all group/btn"
                      >
                        <MessageCircleQuestion className="w-8 h-8 text-white group-hover/btn:scale-110 transition-transform" />
                        <span className="text-white text-xs font-bold">שאלות ותשובות</span>
                      </button>
                    </div>
                  </motion.div>
                </div>

                {/* Reporter Info */}
                <div className="p-4">
                  {/* Bio */}
                  {reporter.bio && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {reporter.bio}
                      </p>
                    </div>
                  )}

                  {/* Specialty */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
                    {reporter.specialty}
                  </p>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {reporter.categories?.slice(0, 3).map(cat => (
                      <Badge
                        key={cat}
                        variant="secondary"
                        className="text-xs"
                      >
                        {categoryLabels[cat] || cat}
                      </Badge>
                    ))}
                  </div>

                  {/* Latest Article */}
                  {latestArticle ? (
                    <Link
                      to={createPageUrl(`Article?id=${latestArticle.id}`)}
                      className="block mb-3 group/article"
                    >
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-[#E31E24] shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-2 group-hover/article:text-[#E31E24] dark:group-hover/article:text-[#E31E24] transition-colors">
                            {latestArticle.title}
                          </p>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            {new Date(latestArticle.created_date).toLocaleTimeString('he-IL', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      אין ידיעות אחרונות
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setAskReporter(reporter)}
                      className="flex items-center justify-center gap-1 px-2 py-2 bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B1B] text-white text-xs font-bold rounded-lg transition-all"
                    >
                      <MessageCircleQuestion className="w-3.5 h-3.5" />
                      שאל
                    </button>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('openReporterChat'))}
                      className="flex items-center justify-center gap-1 px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      צ׳אט
                    </button>
                    <button
                      onClick={() => {
                        window.location.href = createPageUrl('ReporterQA');
                      }}
                      className="flex items-center justify-center gap-1 px-2 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-all"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      שו״ת
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}