import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Video, TrendingUp } from "lucide-react";

const REPORTERS = [
  {
    id: 1,
    name: "רועי שרון",
    role: "כתב ביטחון",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=security1&backgroundColor=b6e3f4",
    categories: ["security", "breaking"]
  },
  {
    id: 2,
    name: "מיכל כהן",
    role: "כתבת כלכלה",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=economy1&backgroundColor=c0aede",
    categories: ["economy", "politics"]
  },
  {
    id: 3,
    name: "יוסי לוי",
    role: "כתב פוליטי",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=politics1&backgroundColor=ffd5dc",
    categories: ["politics", "breaking"]
  },
  {
    id: 4,
    name: "שרה אברהם",
    role: "כתבת חינוך",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=education1&backgroundColor=ffeaa7",
    categories: ["world", "health"]
  },
  {
    id: 5,
    name: "דוד מזרחי",
    role: "כתב ספורט",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=sports1&backgroundColor=74b9ff",
    categories: ["sports", "entertainment"]
  },
  {
    id: 6,
    name: "נועה ברק",
    role: "כתבת בידור",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=entertainment1&backgroundColor=fab1a0",
    categories: ["entertainment", "world"]
  },
  {
    id: 7,
    name: "אלון גולן",
    role: "כתב טכנולוגיה",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=tech1&backgroundColor=a29bfe",
    categories: ["technology", "economy"]
  },
  {
    id: 8,
    name: "תמר רוזן",
    role: "כתבת בריאות",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=health1&backgroundColor=55efc4",
    categories: ["health", "world"]
  },
  {
    id: 9,
    name: "עומר אשכנזי",
    role: "כתב זירה בינלאומית",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=world1&backgroundColor=81ecec",
    categories: ["world", "breaking"]
  }
];

export default function ReportersFeed() {
  const [reporterArticles, setReporterArticles] = useState([]);

  const { data: allArticles = [] } = useQuery({
    queryKey: ['reporter-articles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 30),
    refetchInterval: 120000,
    initialData: []
  });

  useEffect(() => {
    if (allArticles.length > 0) {
      // Match articles to reporters based on category
      const matched = REPORTERS.map(reporter => {
        const article = allArticles.find(a => 
          reporter.categories.includes(a.category)
        );
        
        if (article) {
          return {
            reporter,
            article,
            time: new Date(article.created_date).toLocaleTimeString('he-IL', {
              hour: '2-digit',
              minute: '2-digit'
            })
          };
        }
        return null;
      }).filter(Boolean);

      setReporterArticles(matched.slice(0, 6));
    }
  }, [allArticles]);

  if (reporterArticles.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sticky top-24 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <Video className="w-5 h-5 text-[#E31E24]" />
          <h2 className="font-bold text-base dark:text-white">אנשי השטח</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">טוען דיווחים...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sticky top-24 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <Video className="w-5 h-5 text-[#E31E24]" />
        <h2 className="font-bold text-base dark:text-white">אנשי השטח</h2>
        <div className="mr-auto flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E31E24] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E31E24]"></span>
          </span>
          <span className="text-[10px] text-[#E31E24] font-bold">LIVE</span>
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {reporterArticles.map((item, index) => (
            <motion.div
              key={item.reporter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={createPageUrl(`Article?id=${item.article.id}`)}
                className="block group"
              >
                <div className="flex gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-all">
                  <div className="relative shrink-0">
                    <img
                      src={item.reporter.image}
                      alt={item.reporter.name}
                      className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-600 group-hover:border-[#E31E24] transition-colors"
                    />
                    {item.article.video_url && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#E31E24] rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                        <Video className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xs text-gray-900 dark:text-white">
                          {item.reporter.name}
                        </h3>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          {item.reporter.role}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 mt-1.5 group-hover:text-[#E31E24] dark:group-hover:text-[#E31E24] transition-colors leading-snug">
                      {item.article.title}
                    </p>
                    {item.article.is_breaking && (
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#E31E24] text-white text-[9px] font-bold rounded-full">
                          <TrendingUp className="w-2 h-2" />
                          חדשות חמות
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <Link
          to={createPageUrl("Home")}
          className="block text-center text-xs font-bold text-[#E31E24] hover:text-[#B91C1C] transition-colors"
        >
          כל הכתבים ←
        </Link>
      </div>
    </div>
  );
}