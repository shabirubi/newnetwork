import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Play, Eye, Star, Clock } from "lucide-react";
import { motion } from "framer-motion";

const categoryColors = {
  action: "bg-red-600",
  drama: "bg-purple-600",
  comedy: "bg-yellow-600",
  thriller: "bg-gray-800",
  documentary: "bg-blue-600",
  sports: "bg-green-600",
  kids: "bg-pink-500",
  romance: "bg-rose-600",
  horror: "bg-gray-900",
  scifi: "bg-indigo-600"
};

const categoryLabels = {
  action: "אקשן",
  drama: "דרמה",
  comedy: "קומדיה",
  thriller: "מתח",
  documentary: "דוקו",
  sports: "ספורט",
  kids: "ילדים",
  romance: "רומנטי",
  horror: "אימה",
  scifi: "מדע בדיוני"
};

export default function VODCard({ content, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link 
        to={createPageUrl(`VODPlayer?id=${content.id}`)}
        className="group block"
      >
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-900 shadow-lg">
          {/* Thumbnail */}
          {content.thumbnail_url ? (
            <img 
              src={content.thumbnail_url}
              alt={content.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <Play className="w-16 h-16 text-gray-600" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#E31E24] flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                <Play className="w-8 h-8 text-white mr-[-3px]" fill="white" />
              </div>
            </div>
          </div>

          {/* Category Badge */}
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold text-white ${categoryColors[content.category]}`}>
            {categoryLabels[content.category]}
          </div>

          {/* Rating */}
          {content.rating && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md">
              <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
              <span className="text-white text-xs font-bold">{content.rating}</span>
            </div>
          )}

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
            <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">
              {content.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              {content.year && <span>{content.year}</span>}
              {content.duration && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {content.duration}
                  </div>
                </>
              )}
              {content.views > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {content.views}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}