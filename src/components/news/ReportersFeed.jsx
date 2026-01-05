import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Play, Clock } from "lucide-react";
import moment from "moment";

const reporters = [
  {
    id: 1,
    name: "נועה כהן",
    role: "כתבת פוליטית",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    articles: [
      { title: "ראש הממשלה בהצהרה חריפה: 'לא נסוג צעד אחד'", time: "06:23", hasVideo: true }
    ]
  },
  {
    id: 2,
    name: "רון חיימי",
    role: "כתב ביטחון",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    articles: [
      { title: "התקפה בגבול הצפון - צה\"ל בכוננות מירבית", time: "05:16", hasVideo: true }
    ]
  },
  {
    id: 3,
    name: "שירה לוי",
    role: "כתבת כלכלה",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    articles: [
      { title: "עליית מחירים חדה - מה קורה בשוק?", time: "06:02", hasVideo: true }
    ]
  },
  {
    id: 4,
    name: "אור רביבו",
    role: "כתב חקירות",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    articles: [
      { title: "חשד לשחיתות ברמות הגבוהות - פרטים בלעדיים", time: "02:41", hasVideo: false }
    ]
  },
  {
    id: 5,
    name: "עדי מזרחי",
    role: "כתבת חדשות",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    articles: [
      { title: "אירוע דרמטי בתל אביב - פינוי דיירים", time: "02:01", hasVideo: true }
    ]
  },
  {
    id: 6,
    name: "יואב שמעון",
    role: "כתב ספורט",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop",
    articles: [
      { title: "ניצחון דרמטי: הפועל תל אביב מעלה למקום הראשון", time: "01:45", hasVideo: true }
    ]
  },
  {
    id: 7,
    name: "מיכל אבני",
    role: "כתבת בריאות",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop",
    articles: [
      { title: "פריצת דרך רפואית: טיפול חדש לסרטן אושר", time: "01:20", hasVideo: false }
    ]
  },
  {
    id: 8,
    name: "תומר דוד",
    role: "כתב טכנולוגיה",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    articles: [
      { title: "חברת הייטק ישראלית גייסה 100 מיליון דולר", time: "00:58", hasVideo: true }
    ]
  },
  {
    id: 9,
    name: "רותם אלון",
    role: "כתבת עולם",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    articles: [
      { title: "התפתחויות בארצות הברית - מה קורה בוושינגטון?", time: "00:32", hasVideo: false }
    ]
  },
  {
    id: 10,
    name: "דניאל כץ",
    role: "כתב תחבורה",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    articles: [
      { title: "עומס חריג בכבישים - כל מה שצריך לדעת", time: "00:15", hasVideo: true }
    ]
  }
];

export default function ReportersFeed() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6 border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-3">
        <h2 className="font-bold text-xs text-white flex items-center gap-2">
          <span className="text-base">📡</span>
          אנשי השטח
        </h2>
      </div>

      {/* Feed - No scroll, fixed height */}
      <div className="bg-gray-50 h-[500px] overflow-hidden">
        {reporters.slice(0, 6).map((reporter, reporterIndex) => (
          <div key={reporter.id}>
            {reporter.articles.slice(0, 1).map((article, articleIndex) => (
              <motion.div
                key={`${reporter.id}-${articleIndex}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.5,
                  delay: reporterIndex * 0.2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: 5
                }}
                className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <Link 
                  to={createPageUrl("Home")}
                  className="flex items-start gap-2 p-2.5"
                >
                  {/* Reporter Image - always show */}
                  <div className="relative shrink-0">
                    <motion.img 
                      src={reporter.image}
                      alt={reporter.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          "0 0 0 0px rgba(227, 30, 36, 0)",
                          "0 0 0 3px rgba(227, 30, 36, 0.3)",
                          "0 0 0 0px rgba(227, 30, 36, 0)"
                        ]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: reporterIndex * 0.7
                      }}
                    />
                    {article.hasVideo && (
                      <motion.div 
                        className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#E31E24] rounded-full flex items-center justify-center"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Play className="w-2 h-2 text-white" fill="white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-900 font-bold line-clamp-2 leading-tight mb-0.5">
                      {article.title}
                    </p>
                    <div className="flex items-center gap-1 text-[9px] text-gray-500">
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Clock size={9} />
                      </motion.div>
                      {article.time}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <Link 
        to={createPageUrl("Home")}
        className="block p-2 text-center bg-gradient-to-br from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 transition-colors border-t border-gray-700"
      >
        <span className="text-white font-bold text-[10px]">לכל העדכונים →</span>
      </Link>
    </div>
  );
}