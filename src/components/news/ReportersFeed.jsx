import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Video, TrendingUp, Mic, Play, MessageCircle } from "lucide-react";
import ReporterAudioPlayer from "./ReporterAudioPlayer";
import ReporterChatModal from "../reporter/ReporterChatModal";

const REPORTERS = [
  {
    id: 1,
    name: "רועי שרון",
    role: "כתב ביטחון",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/26f097184_generated_image.png",
    gender: "male",
    categories: ["security","breaking"],
    specialty: "מומחה לענייני ביטחון וצבא"
  },
  {
    id: 2,
    name: "מיכל כהן",
    role: "כתבת כלכלה",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/6c84f0201_generated_image.png",
    gender: "female",
    categories: ["economy","finance"],
    specialty: "מומחית לכלכלה ושווקים"
  },
  {
    id: 3,
    name: "יוסי לוי",
    role: "כתב פוליטי",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/8ac23d253_generated_image.png",
    gender: "male",
    categories: ["politics","breaking"],
    specialty: "מומחה לפוליטיקה ישראלית"
  },
  {
    id: 4,
    name: "שרה אברהם",
    role: "כתבת חינוך וחברה",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/30f0cc10f_generated_image.png",
    gender: "female",
    categories: ["world","health"],
    specialty: "מומחית לחינוך ונושאים חברתיים"
  },
  {
    id: 5,
    name: "דוד מזרחי",
    role: "כתב ספורט",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/30c86ade3_generated_image.png",
    gender: "male",
    categories: ["sports","entertainment"],
    specialty: "מומחה לספורט ישראלי ובינלאומי"
  },
  {
    id: 6,
    name: "נועה ברק",
    role: "כתבת בידור ותרבות",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/4d16cfb0a_generated_image.png",
    gender: "female",
    categories: ["entertainment","music"],
    specialty: "מומחית לבידור ותרבות"
  },
  {
    id: 7,
    name: "אלון גולן",
    role: "כתב טכנולוגיה",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/7ef4add9c_generated_image.png",
    gender: "male",
    categories: ["technology","economy"],
    specialty: "מומחה לטכנולוגיה והייטק"
  },
  {
    id: 8,
    name: "תמר רוזן",
    role: "כתבת בריאות ומדע",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c02dcd63b_generated_image.png",
    gender: "female",
    categories: ["health","world"],
    specialty: "מומחית לבריאות ומדע"
  },
  {
    id: 9,
    name: "עומר אשכנזי",
    role: "כתב זירה בינלאומית",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/e21d6485a_generated_image.png",
    gender: "male",
    categories: ["world","breaking"],
    specialty: "מומחה לזירה הבינלאומית"
  },
  {
    id: 10,
    name: "אורי כהן",
    role: "כתב פיננסים",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/fc2e87a6a_generated_image.png",
    gender: "male",
    categories: ["finance","economy"],
    specialty: "מומחה לפיננסים והשקעות"
  },
  {
    id: 11,
    name: "רינה לוי",
    role: "כתבת מזלות ואסטרולוגיה",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/98e53b719_generated_image.png",
    gender: "female",
    categories: ["horoscope","entertainment"],
    specialty: "אסטרולוגית ומומחית למזלות"
  },
  {
    id: 12,
    name: "גל שטרן",
    role: "כתב מוזיקה",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/19d1788a4_generated_image.png",
    gender: "male",
    categories: ["music","entertainment"],
    specialty: "מבקר מוזיקה וכתב תרבות"
  },
  {
    id: 13,
    name: "מאיה דוד",
    role: "כתבת אופנה וסגנון",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/d8bc8ac79_generated_image.png",
    gender: "female",
    categories: ["entertainment","world"],
    specialty: "מומחית לאופנה ועיצוב"
  },
  {
    id: 14,
    name: "ליאור אברהם",
    role: "כתב רכב וטכנולוגיה",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/db1ce14f8_generated_image.png",
    gender: "male",
    categories: ["technology","economy"],
    specialty: "מומחה לרכב וחדשנות"
  },
  {
    id: 15,
    name: "שירה גרין",
    role: "כתבת תיירות ונופש",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/04631e56e_generated_image.png",
    gender: "female",
    categories: ["world","entertainment"],
    specialty: "מומחית לתיירות וטיולים"
  },
  {
    id: 16,
    name: "יובל מרדכי",
    role: "כתב סביבה ואקולוגיה",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/b876988fd_generated_image.png",
    gender: "male",
    categories: ["health","world"],
    specialty: "מומחה לסביבה ואקלים"
  },
  {
    id: 17,
    name: "דנה ורד",
    role: "כתבת אוכל ומסעדות",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/e80792d8c_generated_image.png",
    gender: "female",
    categories: ["entertainment","health"],
    specialty: "מומחית לקולינריה ואוכל"
  },
  {
    id: 18,
    name: "נדב פרץ",
    role: "כתב קולנוע וקריקטורות",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/33ceb61b6_generated_image.png",
    gender: "male",
    categories: ["entertainment","world"],
    specialty: "מבקר קולנוע ומומחה לסדרות"
  },
  {
    id: 19,
    name: "עדי בן דוד",
    role: "כתבת משפט ופלילים",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/b45dba046_generated_image.png",
    gender: "female",
    categories: ["breaking","politics"],
    specialty: "מומחית למשפט פלילי"
  },
  {
    id: 20,
    name: "איתן רון",
    role: "כתב נדל״ן ובנייה",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/e4c15beb8_generated_image.png",
    gender: "male",
    categories: ["economy","finance"],
    specialty: "מומחה לנדל״ן ושוק הדיור"
  },
  {
    id: 21,
    name: "הילה זוהר",
    role: "כתבת מדע וחלל",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/39846d87d_generated_image.png",
    gender: "female",
    categories: ["technology","world"],
    specialty: "מומחית למדע וחקר החלל"
  },
  {
    id: 22,
    name: "רם שמיר",
    role: "כתב צבא וכלי נשק",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/aa7dd8c9a_generated_image.png",
    gender: "male",
    categories: ["security","breaking"],
    specialty: "מומחה לכלי נשק וציוד צבאי"
  },
  {
    id: 23,
    name: "שני אלון",
    role: "כתבת דיגיטל ורשתות",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/2ca8d7f21_generated_image.png",
    gender: "female",
    categories: ["technology","entertainment"],
    specialty: "מומחית לרשתות חברתיות ודיגיטל"
  },
  {
    id: 24,
    name: "בן זוהר",
    role: "כתב היסטוריה ומורשת",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/b66fcc60e_generated_image.png",
    gender: "male",
    categories: ["world","entertainment"],
    specialty: "מומחה להיסטוריה ותרבות"
  },
  {
    id: 25,
    name: "טל גולדברג",
    role: "כתבת חדשנות וסטארטאפים",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/9c805e4ab_generated_image.png",
    gender: "female",
    categories: ["technology","economy"],
    specialty: "מומחית לסטארטאפים וחדשנות"
  },
  {
    id: 26,
    name: "אדם לוין",
    role: "כתב בלוקצ׳יין וקריפטו",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/0c2604c54_generated_image.png",
    gender: "male",
    categories: ["finance","technology"],
    specialty: "מומחה למטבעות דיגיטליים"
  },
  {
    id: 27,
    name: "מור שחר",
    role: "כתבת משחקי מחשב",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/80d669ef0_generated_image.png",
    gender: "female",
    categories: ["entertainment","technology"],
    specialty: "מומחית לגיימינג ומשחקים"
  },
  {
    id: 28,
    name: "נועם שגיא",
    role: "כתב פסיכולוגיה ומשפחה",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/bd588b7c0_generated_image.png",
    gender: "male",
    categories: ["health","world"],
    specialty: "פסיכולוג ומומחה לקשרי משפחה"
  },
  {
    id: 29,
    name: "ליה כהן",
    role: "מגישה - ערוץ הילדים",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/438d67d22_generated_image.png",
    gender: "female",
    categories: ["entertainment"],
    specialty: "מגישה לילדים ונוער"
  },
  {
    id: 30,
    name: "מיה פרידמן",
    role: "מגישה - ערוץ הילדים",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/3a6877042_generated_image.png",
    gender: "female",
    categories: ["entertainment"],
    specialty: "מגישה ושחקנית ילדים"
  },
  {
    id: 31,
    name: "מוחמד חסן",
    role: "כתב ערבי",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/7863ffae3_generated_image.png",
    gender: "male",
    categories: ["world","politics","breaking"],
    specialty: "כתב המגזר הערבי והחברה הערבית בישראל"
  },
  {
    id: 32,
    name: "הרב יעקב כהן",
    role: "כתב רבני",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/84941d7f9_generated_image.png",
    gender: "male",
    categories: ["world","politics","breaking"],
    specialty: "כתב עניינים רבניים ויהדות"
  }
];

export default function ReportersFeed() {
  const [reporterArticles, setReporterArticles] = useState([]);
  const [selectedReporter, setSelectedReporter] = useState(null);
  const [chatReporter, setChatReporter] = useState(null);

  const { data: allArticles = [] } = useQuery({
    queryKey: ['reporter-articles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 30),
    refetchInterval: 120000,
    initialData: []
  });

  const { data: dbReporters = [] } = useQuery({
    queryKey: ['db-reporters'],
    queryFn: () => base44.entities.Reporter.list('name'),
    staleTime: 2 * 60 * 1000,
    initialData: []
  });

  useEffect(() => {
    if (allArticles.length > 0) {
      // Use DB reporters if available, otherwise fall back to hardcoded
      const reportersToUse = dbReporters.length > 0 ? dbReporters : REPORTERS;
      
      // Match articles to reporters based on category
      const matched = reportersToUse.map(reporter => {
        const article = allArticles.find(a => 
          reporter.categories?.includes(a.category)
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
  }, [allArticles, dbReporters]);

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
      
      {chatReporter && (
        <ReporterChatModal
          reporter={chatReporter.reporter}
          article={chatReporter.article}
          onClose={() => setChatReporter(null)}
        />
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sticky top-24 border border-gray-200 dark:border-gray-700 w-full">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E31E24] to-[#B91C1C] flex items-center justify-center shadow-lg">
          <Video className="w-5 h-5 text-white" />
        </div>
        <h2 className="font-bold text-xl dark:text-white">אנשי השטח</h2>
        <div className="mr-auto flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E31E24] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E31E24]"></span>
          </span>
          <span className="text-xs text-[#E31E24] font-bold">שידור חי</span>
        </div>
      </div>

      <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
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
              <div className="relative bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-800/50 dark:to-gray-800 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 dark:border-gray-700 hover:border-[#E31E24] dark:hover:border-[#E31E24] hover:scale-[1.02]">
                {/* Reporter Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-3 border-gray-200 dark:border-gray-600 group-hover:border-[#E31E24] transition-all shadow-xl">
                      <img
                        src={item.reporter.image}
                        alt={item.reporter.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#E31E24] to-[#B91C1C] rounded-full flex items-center justify-center border-3 border-white dark:border-gray-800 shadow-lg animate-pulse">
                      <Mic className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">
                      {item.reporter.name}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                      {item.reporter.role}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#E31E24] animate-pulse"></div>
                      <span className="text-xs text-[#E31E24] font-bold">
                        {item.time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Article Content */}
                <button
                  onClick={() => {
                    window.location.href = createPageUrl(`Article?id=${item.article.id}`);
                  }}
                  className="block text-right w-full cursor-pointer mb-3"
                >
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-bold line-clamp-2 leading-relaxed group-hover:text-[#E31E24] dark:group-hover:text-[#E31E24] transition-colors mb-2">
                    {item.article.title}
                  </p>
                  {item.article.subtitle && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {item.article.subtitle}
                    </p>
                  )}
                </button>

                {/* Actions */}
                <div className="space-y-3 pt-3 border-t-2 border-gray-200 dark:border-gray-700">
                  {item.article.is_breaking && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#E31E24] to-[#B91C1C] text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                      <TrendingUp className="w-3.5 h-3.5" />
                      חדשות חמות
                    </span>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setChatReporter(item);
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      <MessageCircle className="w-4 h-4" />
                      צ׳אט
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedReporter(item);
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B1B] text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      <Play className="w-4 h-4" fill="white" />
                      האזן
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-6 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
        <Link
          to={createPageUrl("Reporters")}
          className="block text-center text-sm font-bold text-white bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B1B] py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          צפה בכל הכתבים ←
        </Link>
      </div>
      </div>
    </>
  );
}