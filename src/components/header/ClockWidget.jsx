import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export default function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('he-IL', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short'
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full"
    >
      <Clock className="w-4 h-4 text-[#E31E24]" />
      <div className="flex items-center gap-2 text-sm">
        <span className="font-bold text-gray-900 dark:text-white">{formatTime(time)}</span>
        <span className="text-gray-500 dark:text-gray-400 text-xs">{formatDate(time)}</span>
      </div>
    </motion.div>
  );
}