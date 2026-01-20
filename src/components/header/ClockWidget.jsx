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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group"
    >
      <div className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20">
        <Clock className="w-4 h-4 text-white" />
        <div className="flex flex-col">
          <span className="font-bold text-white text-sm leading-none">{formatTime(time)}</span>
          <span className="text-white/80 text-[10px] leading-none mt-0.5">{formatDate(time)}</span>
        </div>
      </div>
    </motion.div>
  );
}