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
      <div className="sticky top-24">
        <div className="flex items-center gap-2 mb-4">
          <Video className="w-6 h-6 text-[#E31E24]" />
          <h2 className="font-bold text-xl dark:text-white">אנשי השטח</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">טוען דיווחים...</p>
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
      
      <div className="sticky top-24">
      <div className="flex items-center gap-2 mb-4">
        <Video className="w-6 h-6 text-[#E31E24]" />
        <h2 className="font-bold text-xl dark:text-white">אנשי השטח</h2>
        <div className="mr-auto flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E31E24] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E31E24]"></span>
          </span>
          <span className="text-xs text-[#E31E24] font-bold">LIVE</span>
        </div>
      </div>

      <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2">
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
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-gray-200 dark:border-gray-700 hover:border-[#E31E24] dark:hover:border-[#E31E24]">
                {/* Compact Horizontal Layout */}
                <div className="flex items-stretch">
                  {/* Right Side - Reporter Image & Live Indicator */}
                  <div className="relative w-32 shrink-0 bg-gradient-to-br from-[#E31E24] to-[#B91C1C] flex items-center justify-center">
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      <span className="text-white text-[10px] font-bold">LIVE</span>
                    </div>
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl">
                        <img
                          src={item.reporter.image}
                          alt={item.reporter.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Mic className="w-3 h-3 text-[#E31E24]" />
                      </div>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 p-4 flex flex-col">
                    {/* Reporter Info */}
                    <div className="mb-3">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight mb-0.5">
                        {item.reporter.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {item.reporter.role} • {item.time}
                      </p>
                    </div>

                    {/* Article Preview */}
                    <button
                      onClick={() => {
                        window.location.href = createPageUrl(`Article?id=${item.article.id}`);
                      }}
                      className="block text-right w-full mb-3 flex-1"
                    >
                      <div className="flex items-start gap-2">
                        {item.article.is_breaking && (
                          <TrendingUp className="w-4 h-4 text-[#E31E24] shrink-0 mt-0.5" />
                        )}
                        <p className="text-sm text-gray-900 dark:text-white font-bold line-clamp-2 leading-snug">
                          {item.article.title}
                        </p>
                      </div>
                    </button>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setChatReporter(item);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        שיחה
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedReporter(item);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#E31E24] hover:bg-[#B91C1C] text-white text-sm font-bold rounded-lg transition-colors"
                      >
                        <Play className="w-4 h-4" fill="white" />
                        האזן
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-6">
        <Link
          to={createPageUrl("Reporters")}
          className="block text-center text-sm font-bold text-[#E31E24] hover:text-[#B91C1C] transition-colors py-3 bg-red-50 dark:bg-red-900/20 rounded-xl"
        >
          כל הכתבים ←
        </Link>
      </div>
      </div>
    </>
  );
}