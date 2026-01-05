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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative p-4 rounded-xl border-2 transition-all ${
        isActive || is_live
          ? "border-[#E31E24] bg-red-50"
          : "border-transparent bg-white hover:border-gray-200"
      }`}
    >
      {/* Live Indicator */}
      {(isActive || is_live) && (
        <div className="absolute top-4 left-4">
          <Badge className="bg-[#E31E24] text-white flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            עכשיו בשידור
          </Badge>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Time */}
        <div className="text-center shrink-0">
          <div className="text-2xl font-bold text-gray-900">{start_time}</div>
          {end_time && (
            <div className="text-sm text-gray-500">{end_time}</div>
          )}
        </div>

        {/* Divider */}
        <div className={`w-1 self-stretch rounded-full ${categoryColors[category]}`} />

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">
              {categoryLabels[category]}
            </Badge>
          </div>
          
          <h3 className="font-bold text-lg text-gray-900">{title}</h3>
          
          {description && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{description}</p>
          )}
          
          {host && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <User size={14} />
              {host}
            </div>
          )}
        </div>

        {/* Play Icon for active */}
        {(isActive || is_live) && (
          <div className="shrink-0">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-10 h-10 rounded-full bg-[#E31E24] flex items-center justify-center"
            >
              <Radio size={20} className="text-white" />
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}