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
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=faces",
    gender: "male",
    categories: ["finance","economy"],
    specialty: "מומחה לפיננסים והשקעות"
  },
  {
    id: 11,
    name: "רינה לוי",
    role: "כתבת מזלות ואסטרולוגיה",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=faces",
    gender: "female",
    categories: ["horoscope","entertainment"],
    specialty: "אסטרולוגית ומומחית למזלות"
  },
  {
    id: 12,
    name: "גל שטרן",
    role: "כתב מוזיקה",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
    gender: "male",
    categories: ["music","entertainment"],
    specialty: "מבקר מוזיקה וכתב תרבות"
  },
  {
    id: 13,
    name: "מאיה דוד",
    role: "כתבת אופנה וסגנון",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces",
    gender: "female",
    categories: ["entertainment","world"],
    specialty: "מומחית לאופנה ועיצוב"
  },
  {
    id: 14,
    name: "ליאור אברהם",
    role: "כתב רכב וטכנולוגיה",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces",
    gender: "male",
    categories: ["technology","economy"],
    specialty: "מומחה לרכב וחדשנות"
  },
  {
    id: 15,
    name: "שירה גרין",
    role: "כתבת תיירות ונופש",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces",
    gender: "female",
    categories: ["world","entertainment"],
    specialty: "מומחית לתיירות וטיולים"
  },
  {
    id: 16,
    name: "יובל מרדכי",
    role: "כתב סביבה ואקולוגיה",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces",
    gender: "male",
    categories: ["health","world"],
    specialty: "מומחה לסביבה ואקלים"
  },
  {
    id: 17,
    name: "דנה ורד",
    role: "כתבת אוכל ומסעדות",
    image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=faces",
    gender: "female",
    categories: ["entertainment","health"],
    specialty: "מומחית לקולינריה ואוכל"
  },
  {
    id: 18,
    name: "נדב פרץ",
    role: "כתב קולנוע וקריקטורות",
    image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=400&fit=crop&crop=faces",
    gender: "male",
    categories: ["entertainment","world"],
    specialty: "מבקר קולנוע ומומחה לסדרות"
  },
  {
    id: 19,
    name: "עדי בן דוד",
    role: "כתבת משפט ופלילים",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces",
    gender: "female",
    categories: ["breaking","politics"],
    specialty: "מומחית למשפט פלילי"
  },
  {
    id: 20,
    name: "איתן רון",
    role: "כתב נדל״ן ובנייה",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces",
    gender: "male",
    categories: ["economy","finance"],
    specialty: "מומחה לנדל״ן ושוק הדיור"
  },
  {
    id: 21,
    name: "הילה זוהר",
    role: "כתבת מדע וחלל",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=faces",
    gender: "female",
    categories: ["technology","world"],
    specialty: "מומחית למדע וחקר החלל"
  },
  {
    id: 22,
    name: "רם שמיר",
    role: "כתב צבא וכלי נשק",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=faces",
    gender: "male",
    categories: ["security","breaking"],
    specialty: "מומחה לכלי נשק וציוד צבאי"
  },
  {
    id: 23,
    name: "שני אלון",
    role: "כתבת דיגיטל ורשתות",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces",
    gender: "female",
    categories: ["technology","entertainment"],
    specialty: "מומחית לרשתות חברתיות ודיגיטל"
  },
  {
    id: 24,
    name: "בן זוהר",
    role: "כתב היסטוריה ומורשת",
    image: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop&crop=faces",
    gender: "male",
    categories: ["world","entertainment"],
    specialty: "מומחה להיסטוריה ותרבות"
  },
  {
    id: 25,
    name: "טל גולדברג",
    role: "כתבת חדשנות וסטארטאפים",
    image: "https://images.unsplash.com/photo-1507101105822-7472b28e22ac?w=400&h=400&fit=crop&crop=faces",
    gender: "female",
    categories: ["technology","economy"],
    specialty: "מומחית לסטארטאפים וחדשנות"
  },
  {
    id: 26,
    name: "אדם לוין",
    role: "כתב בלוקצ׳יין וקריפטו",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=faces",
    gender: "male",
    categories: ["finance","technology"],
    specialty: "מומחה למטבעות דיגיטליים"
  },
  {
    id: 27,
    name: "מור שחר",
    role: "כתבת משחקי מחשב",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces",
    gender: "female",
    categories: ["entertainment","technology"],
    specialty: "מומחית לגיימינג ומשחקים"
  },
  {
    id: 28,
    name: "נועם שגיא",
    role: "כתב פסיכולוגיה ומשפחה",
    image: "https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=400&h=400&fit=crop&crop=faces",
    gender: "male",
    categories: ["health","world"],
    specialty: "פסיכולוג ומומחה לקשרי משפחה"
  },
  {
    id: 29,
    name: "ליה כהן",
    role: "מגישה - ערוץ הילדים",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=faces",
    gender: "female",
    categories: ["entertainment"],
    specialty: "מגישה לילדים ונוער"
  },
  {
    id: 30,
    name: "מיה פרידמן",
    role: "מגישה - ערוץ הילדים",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=faces",
    gender: "female",
    categories: ["entertainment"],
    specialty: "מגישה ושחקנית ילדים"
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
                <button
                  onClick={() => {
                    window.location.href = createPageUrl(`Article?id=${item.article.id}`);
                  }}
                  className="block text-right w-full cursor-pointer"
                >
                  <p className="text-xs text-gray-800 dark:text-gray-200 font-medium line-clamp-2 leading-snug group-hover:text-[#E31E24] dark:group-hover:text-[#E31E24] transition-colors mb-2">
                    {item.article.title}
                  </p>
                  {item.article.subtitle && (
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                      {item.article.subtitle}
                      </p>
                      )}
                      </button>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  {item.article.is_breaking && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#E31E24] text-white text-[9px] font-bold rounded-full">
                      <TrendingUp className="w-2.5 h-2.5" />
                      חם
                    </span>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setChatReporter(item);
                      }}
                      className="flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      <MessageCircle className="w-3 h-3" />
                      צ׳אט עם הכתב
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedReporter(item);
                      }}
                      className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B1B] text-white text-[10px] font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      <Play className="w-3 h-3" fill="white" />
                      שמע כתבה
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <Link
          to={createPageUrl("Reporters")}
          className="block text-center text-xs font-bold text-[#E31E24] hover:text-[#B91C1C] transition-colors"
        >
          כל הכתבים ←
        </Link>
      </div>
      </div>
    </>
  );
}