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
    <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 overflow-hidden border-b border-red-900/20 h-12">
      <motion.div
        className="flex gap-8 whitespace-nowrap h-full items-center text-lg"
        animate={{ x: [0, -1000] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {displayItems.map((item, idx) => (
          <span key={`${item.id}-${idx}`} className="flex-shrink-0 font-bold text-base" style={{
            backgroundImage: 'linear-gradient(90deg, #E31E24, #FCD34D, #E31E24)',
            backgroundSize: '200% 100%',
            animation: 'gradientShift 3s ease-in-out infinite',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 20px rgba(227, 30, 36, 0.8), 0 0 10px rgba(252, 211, 77, 0.6)',
            filter: 'drop-shadow(0 0 8px rgba(227, 30, 36, 0.6)) drop-shadow(0 0 4px rgba(252, 211, 77, 0.4))'
          }}>
            {item.is_live && <span className="text-red-500 font-bold">● </span>}
            {item.title} • {item.host} • {item.start_time} - {item.end_time}
          </span>
        ))}
      </motion.div>
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}