import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { motion } from "framer-motion";
import { Clock, AlertTriangle, ChevronLeft, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import moment from "moment";

const categoryLabels = {
  breaking: "חדשות חמות",
  security: "ביטחון",
  economy: "כלכלה",
  politics: "פוליטיקה",
  technology: "טכנולוגיה",
  sports: "ספורט",
  entertainment: "בידור",
  world: "עולם",
  health: "בריאות"
};

const categoryColors = {
  breaking: "bg-[#E31E24] text-white",
  security: "bg-orange-500 text-white",
  economy: "bg-green-600 text-white",
  politics: "bg-purple-600 text-white",
  technology: "bg-blue-600 text-white",
  sports: "bg-emerald-600 text-white",
  entertainment: "bg-pink-500 text-white",
  world: "bg-indigo-600 text-white",
  health: "bg-teal-600 text-white"
};

export default function NewsCard({ 
  article, 
  variant = "default", // default, featured, compact
  index = 0 
}) {
  const { title, subtitle, content, category, image_url, video_url, is_breaking, created_date, id } = article;

  if (variant === "featured") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group relative overflow-hidden rounded-2xl bg-gray-900 shadow-xl"
      >
        <Link to={createPageUrl(`Article?id=${id}`)}>
          <div className="relative aspect-[16/9] md:aspect-[21/9]">
            {video_url ? (
              <>
                <video
                  src={video_url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  onMouseEnter={(e) => e.target.play()}
                  onMouseLeave={(e) => e.target.pause()}
                />
                <div className="absolute top-3 left-3 bg-[#E31E24] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Play size={12} fill="white" />
                  וידאו
                </div>
              </>
            ) : image_url ? (
              <img 
                src={image_url} 
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            
            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <div className="flex items-center gap-3 mb-4">
                {is_breaking && (
                  <Badge className="bg-[#E31E24] text-white flex items-center gap-1 animate-pulse">
                    <AlertTriangle size={14} />
                    חדשות חמות
                  </Badge>
                )}
                <Badge className={categoryColors[category]}>
                  {categoryLabels[category]}
                </Badge>
              </div>
              
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 group-hover:text-[#E31E24] transition-colors">
                {title}
              </h2>
              
              {subtitle && (
                <p className="text-gray-300 text-lg md:text-xl mb-4 line-clamp-2">
                  {subtitle}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {moment(created_date).fromNow()}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  if (variant === "compact") {
    return (
      <motion.article
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group"
      >
        <Link 
          to={createPageUrl(`Article?id=${id}`)}
          className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <span className="text-3xl font-bold text-gray-200 group-hover:text-[#E31E24] transition-colors">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 group-hover:text-[#E31E24] transition-colors line-clamp-2">
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <Badge variant="secondary" className="text-xs">
                {categoryLabels[category]}
              </Badge>
              <span>{moment(created_date).fromNow()}</span>
            </div>
          </div>
          <ChevronLeft size={20} className="text-gray-400 group-hover:text-[#E31E24] transition-colors shrink-0" />
        </Link>
      </motion.article>
    );
  }

  // Default variant
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent dark:border-gray-700"
    >
      <Link to={createPageUrl(`Article?id=${id}`)}>
        <div className="relative aspect-video overflow-hidden">
          {video_url ? (
            <>
              <video
                src={video_url}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                onMouseEnter={(e) => e.target.play()}
                onMouseLeave={(e) => e.target.pause()}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 bg-[#E31E24] text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                <Play size={12} fill="white" />
                וידאו
              </div>
            </>
          ) : image_url ? (
            <>
              <img 
                src={image_url} 
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500 text-4xl font-bold">{categoryLabels[category]?.[0]}</span>
            </div>
          )}
          
          {is_breaking && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-[#E31E24] text-white flex items-center gap-1 animate-pulse">
                <AlertTriangle size={12} />
                חם
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <Badge className={`${categoryColors[category]} text-xs mb-2`}>
            {categoryLabels[category]}
          </Badge>
          
          <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-[#E31E24] dark:group-hover:text-[#E31E24] transition-colors line-clamp-2 mb-2">
            {title}
          </h3>
          
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
              {subtitle}
            </p>
          )}
          
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
            <Clock size={12} />
            {moment(created_date).fromNow()}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}