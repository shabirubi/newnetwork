import React from "react";
import { motion } from "framer-motion";
import { Clock, Radio, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const categoryLabels = {
  news: "חדשות",
  politics: "פוליטיקה",
  economy: "כלכלה",
  security: "ביטחון",
  entertainment: "בידור",
  special: "מיוחד"
};

const categoryColors = {
  news: "bg-[#E31E24]",
  politics: "bg-purple-600",
  economy: "bg-green-600",
  security: "bg-orange-500",
  entertainment: "bg-pink-500",
  special: "bg-blue-600"
};

export default function ScheduleCard({ schedule, isActive = false, index = 0 }) {
  const { title, description, start_time, end_time, category, host, is_live } = schedule;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`relative overflow-hidden rounded-xl transition-all ${
        isActive || is_live
          ? "shadow-2xl scale-[1.02]"
          : "shadow-md hover:shadow-lg"
      }`}
    >
      {/* Colored Side Bar */}
      <div className={`absolute right-0 top-0 bottom-0 w-1.5 ${categoryColors[category]}`} />
      
      {/* Main Content */}
      <div className={`bg-white p-5 ${isActive || is_live ? 'bg-gradient-to-l from-red-50' : ''}`}>
        <div className="flex items-start gap-4">
          {/* Time Badge */}
          <div className={`shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-xl ${
            isActive || is_live 
              ? categoryColors[category] + ' text-white shadow-lg' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            <div className="text-xl font-bold">{start_time}</div>
            {end_time && (
              <div className="text-[10px] opacity-80">{end_time}</div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[category]} text-white`}>
                {categoryLabels[category]}
              </span>
              {(isActive || is_live) && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#E31E24] bg-red-50 px-2.5 py-1 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E31E24] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E31E24]"></span>
                  </span>
                  בשידור
                </span>
              )}
            </div>
            
            <h3 className="font-bold text-xl mb-2 text-gray-900 line-clamp-1">
              {title}
            </h3>
            
            {description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
            
            {host && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">●</span>
                <span className="text-gray-700 font-medium">{host}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}