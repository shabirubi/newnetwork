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
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] p-4">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          כל העדכונים
        </h2>
      </div>

      {/* Feed */}
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {reporters.map((reporter, reporterIndex) => (
          <div key={reporter.id}>
            {reporter.articles.map((article, articleIndex) => (
              <motion.div
                key={`${reporter.id}-${articleIndex}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (reporterIndex + articleIndex) * 0.1 }}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <Link 
                  to={createPageUrl("Home")}
                  className="flex items-start gap-3 p-4"
                >
                  {/* Reporter Image */}
                  <div className="relative shrink-0">
                    <img 
                      src={reporter.image}
                      alt={reporter.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#E31E24]"
                    />
                    {articleIndex === 0 && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#E31E24] rounded-full flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">
                          {reporter.articles.length}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Reporter info - only on first article */}
                    {articleIndex === 0 && (
                      <div className="mb-1">
                        <p className="font-bold text-gray-900 text-sm">{reporter.name}</p>
                        <p className="text-xs text-gray-500">{reporter.role}</p>
                      </div>
                    )}

                    {/* Article */}
                    <div className="flex items-start gap-2">
                      {article.hasVideo && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center shrink-0">
                          <Play className="w-6 h-6 text-white" fill="white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium line-clamp-2 leading-snug">
                          {article.title}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <Clock size={12} />
                          {article.time}
                        </div>
                      </div>
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
        className="block p-4 text-center bg-gray-50 hover:bg-gray-100 transition-colors border-t border-gray-200"
      >
        <span className="text-[#E31E24] font-bold text-sm">לכל העדכונים →</span>
      </Link>
    </div>
  );
}