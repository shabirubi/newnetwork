import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Video, TrendingUp, Mic, Play } from "lucide-react";
import ReporterAudioPlayer from "./ReporterAudioPlayer";

const REPORTERS = [
  {
    id: 1,
    name: "רועי שרון",
    role: "כתב ביטחון",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/reporter1_male.jpg",
    gender: "male",
    categories: ["security", "breaking"],
    specialty: "מומחה לענייני ביטחון וצבא"
  },
  {
    id: 2,
    name: "מיכל כהן",
    role: "כתבת כלכלה",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/reporter2_female.jpg",
    gender: "female",
    categories: ["economy", "politics"],
    specialty: "מומחית לכלכלה ושווקים"
  },
  {
    id: 3,
    name: "יוסי לוי",
    role: "כתב פוליטי",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/reporter3_male.jpg",
    gender: "male",
    categories: ["politics", "breaking"],
    specialty: "מומחה לפוליטיקה ישראלית"
  },
  {
    id: 4,
    name: "שרה אברהם",
    role: "כתבת חינוך וחברה",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/reporter4_female.jpg",
    gender: "female",
    categories: ["world", "health"],
    specialty: "מומחית לחינוך ונושאים חברתיים"
  },
  {
    id: 5,
    name: "דוד מזרחי",
    role: "כתב ספורט",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/reporter5_male.jpg",
    gender: "male",
    categories: ["sports", "entertainment"],
    specialty: "מומחה לספורט ישראלי ובינלאומי"
  },
  {
    id: 6,
    name: "נועה ברק",
    role: "כתבת בידור ותרבות",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/reporter6_female.jpg",
    gender: "female",
    categories: ["entertainment", "world"],
    specialty: "מומחית לבידור ותרבות"
  },
  {
    id: 7,
    name: "אלון גולן",
    role: "כתב טכנולוגיה",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/reporter7_male.jpg",
    gender: "male",
    categories: ["technology", "economy"],
    specialty: "מומחה לטכנולוגיה והייטק"
  },
  {
    id: 8,
    name: "תמר רוזן",
    role: "כתבת בריאות ומדע",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/reporter8_female.jpg",
    gender: "female",
    categories: ["health", "world"],
    specialty: "מומחית לבריאות ומדע"
  },
  {
    id: 9,
    name: "עומר אשכנזי",
    role: "כתב זירה בינלאומית",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/reporter9_male.jpg",
    gender: "male",
    categories: ["world", "breaking"],
    specialty: "מומחה לזירה הבינלאומית"
  }
];

export default function ReportersFeed() {
  const [reporterArticles, setReporterArticles] = useState([]);
  const [selectedReporter, setSelectedReporter] = useState(null);

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
    <>
      {selectedReporter && (
        <ReporterAudioPlayer
          reporter={selectedReporter.reporter}
          article={selectedReporter.article}
          onClose={() => setSelectedReporter(null)}
        />
      )}
      
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
              className="group"
            >
              <div className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-700/30 dark:to-gray-800/30 rounded-xl p-3 hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 hover:border-[#E31E24] dark:hover:border-[#E31E24]">
                {/* Reporter Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 group-hover:border-[#E31E24] transition-colors shadow-md">
                      <img
                        src={item.reporter.image}
                        alt={item.reporter.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-[#E31E24] to-[#B91C1C] rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-lg">
                      <Mic className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                      {item.reporter.name}
                    </h3>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">
                      {item.reporter.role}
                    </p>
                    <span className="text-[9px] text-[#E31E24] font-bold">
                      {item.time}
                    </span>
                  </div>
                </div>

                {/* Article Content */}
                <Link
                  to={createPageUrl(`Article?id=${item.article.id}`)}
                  className="block"
                >
                  <p className="text-xs text-gray-800 dark:text-gray-200 font-medium line-clamp-2 leading-snug group-hover:text-[#E31E24] dark:group-hover:text-[#E31E24] transition-colors mb-2">
                    {item.article.title}
                  </p>
                  {item.article.subtitle && (
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                      {item.article.subtitle}
                    </p>
                  )}
                </Link>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  {item.article.is_breaking && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#E31E24] text-white text-[9px] font-bold rounded-full">
                      <TrendingUp className="w-2.5 h-2.5" />
                      חם
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedReporter(item);
                    }}
                    className="mr-auto flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B1B] text-white text-[10px] font-bold rounded-full shadow-md hover:shadow-lg transition-all"
                  >
                    <Play className="w-2.5 h-2.5" fill="white" />
                    שמע כתבה
                  </button>
                </div>
              </div>
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
    </>
  );
}