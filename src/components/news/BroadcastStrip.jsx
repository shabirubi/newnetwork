import React from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function BroadcastStrip() {
  const { data: schedules = [] } = useQuery({
    queryKey: ['broadcast-schedules'],
    queryFn: () => base44.entities.BroadcastSchedule.list('-created_date', 20),
    initialData: [],
    refetchInterval: 60000
  });

  const displayItems = [...schedules, ...schedules];

  return (
    <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 overflow-hidden border-b border-red-900/20 h-6">
      <motion.div
        className="flex gap-8 whitespace-nowrap h-full items-center text-xs"
        animate={{ x: [0, -1000] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {displayItems.map((item, idx) => (
          <span key={`${item.id}-${idx}`} className="text-gray-400 flex-shrink-0">
            {item.is_live && <span className="text-red-500 font-bold">● </span>}
            {item.title} • {item.start_time}
          </span>
        ))}
      </motion.div>
    </div>
  );
}