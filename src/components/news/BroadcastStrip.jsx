import React from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Radio, Clock } from "lucide-react";

export default function BroadcastStrip() {
  const { data: schedules = [] } = useQuery({
    queryKey: ['broadcast-schedules'],
    queryFn: () => base44.entities.BroadcastSchedule.list('-created_date', 20),
    initialData: [],
    refetchInterval: 60000
  });

  const displayItems = [...schedules, ...schedules]; // Duplicate for seamless loop

  return (
    <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 overflow-hidden py-4 px-4 sm:px-6 border-y border-red-900/30">
      <motion.div
        className="flex gap-6 whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {displayItems.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-red-600/30 backdrop-blur-sm flex-shrink-0 hover:border-red-600/60 transition-all"
          >
            {item.is_live && (
              <div className="flex items-center gap-2">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <Clock className="w-3 h-3" />
                  <span>{item.start_time}</span>
                </div>
              </div>
              {item.host && (
                <div className="text-xs text-gray-400 ml-2 px-2 py-1 bg-white/5 rounded-md">
                  {item.host}
                </div>
              )}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}