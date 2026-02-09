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
      <div className="flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-xl rounded-lg shadow-lg border border-white/20">
         <Clock className="w-3 h-3 text-white" />
         <div className="flex flex-col">
           <span className="font-bold text-white text-xs leading-none">{formatTime(time)}</span>
           <span className="text-white/80 text-[8px] leading-none mt-0.5">{formatDate(time)}</span>
         </div>
       </div>
    </motion.div>
  );
}