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
      { title: "ראש הממשלה בהצהרה חריפה: 'לא נסוג צעד אחד'", time: "06:23", hasVideo: true },
      { title: "המתיחות גוברת - האם נצפה להסלמה?", time: "05:45", hasVideo: false }
    ]
  },
  {
    id: 2,
    name: "רון חיימי",
    role: "כתב ביטחון",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    articles: [
      { title: "התקפה בגבול הצפון - צה\"ל בכוננות מירבית", time: "05:16", hasVideo: true },
      { title: "מקורות ביטחוניים: מצב רגיעה יחסית", time: "04:32", hasVideo: false }
    ]
  },
  {
    id: 3,
    name: "שירה לוי",
    role: "כתבת כלכלה",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    articles: [
      { title: "עליית מחירים חדה - מה קורה בשוק?", time: "06:02", hasVideo: true },
      { title: "בנק ישראל מעלה את הריבית", time: "03:21", hasVideo: false }
    ]
  },
  {
    id: 4,
    name: "אור רביבו",
    role: "כתב חקירות",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    articles: [
      { title: "חשד לשחיתות ברמות הגבוהות - פרטים בלעדיים", time: "02:41", hasVideo: false },
      { title: "חקירה מסועפת: המשטרה פשטה על משרדים", time: "01:12", hasVideo: true }
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
  }
];

export default function ReportersFeed() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-6 border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-3 border-b border-gray-700">
        <h2 className="font-bold text-sm text-white flex items-center gap-2">
          <span className="text-lg">👥</span>
          אנשי השטח
        </h2>
      </div>

      {/* Feed */}
      <div className="max-h-[calc(100vh-180px)] overflow-y-auto bg-gray-50 scroll-smooth">
        {reporters.map((reporter, reporterIndex) => (
          <div key={reporter.id}>
            {reporter.articles.map((article, articleIndex) => (
              <motion.div
                key={`${reporter.id}-${articleIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3,
                  ease: "easeOut",
                  delay: (reporterIndex + articleIndex) * 0.08 
                }}
                className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-all duration-200"
              >
                <Link 
                  to={createPageUrl("Home")}
                  className="flex items-start gap-2 p-2.5"
                >
                  {/* Reporter Image - always show */}
                  <div className="relative shrink-0">
                    <img 
                      src={reporter.image}
                      alt={reporter.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200"
                    />
                    {article.hasVideo && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#E31E24] rounded-full flex items-center justify-center">
                        <Play className="w-2 h-2 text-white" fill="white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-900 font-bold line-clamp-2 leading-tight mb-0.5">
                      {article.title}
                    </p>
                    <div className="flex items-center gap-1 text-[9px] text-gray-500">
                      <Clock size={9} />
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