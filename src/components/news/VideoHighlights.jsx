import React from "react";
import { motion } from "framer-motion";
import { Play, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

const highlights = [
  {
    id: 1,
    title: "ניצחון דרמטי של הפועל תל אביב",
    thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=450&fit=crop",
    duration: "2:34",
    views: "12K",
    category: "sports"
  },
  {
    id: 2,
    title: "ראיון בלעדי עם שר הביטחון",
    thumbnail: "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=800&h=450&fit=crop",
    duration: "5:12",
    views: "45K",
    category: "security"
  },
  {
    id: 3,
    title: "מהדורת החדשות המרכזית",
    thumbnail: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop",
    duration: "15:30",
    views: "89K",
    category: "news"
  },
  {
    id: 4,
    title: "כך נראה העתיד הטכנולוגי",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop",
    duration: "4:45",
    views: "23K",
    category: "technology"
  }
];

export default function VideoHighlights() {
  return (
    <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-900 dark:to-black rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#E31E24] flex items-center justify-center">
          <Play className="w-6 h-6 text-white" fill="white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">וידאו מומלצים</h2>
          <p className="text-gray-400 text-sm">הכי נצפים היום</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {highlights.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-xl cursor-pointer"
          >
            <Link to={createPageUrl("Home")} className="block">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-[#E31E24] flex items-center justify-center shadow-2xl">
                    <Play className="w-7 h-7 text-white mr-[-2px]" fill="white" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-bold">
                  {video.duration}
                </div>

                {/* Views */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Eye size={12} />
                  {video.views}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-white font-bold text-sm line-clamp-2 group-hover:text-[#E31E24] transition-colors">
                  {video.title}
                </h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}