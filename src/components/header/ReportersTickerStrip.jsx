import React from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";

export default function ReportersTickerStrip() {
  const { data: reporters = [] } = useQuery({
    queryKey: ['reporters-ticker'],
    queryFn: () => base44.entities.Reporter.filter({ is_active: true }),
    initialData: [],
    refetchInterval: 30000
  });

  if (reporters.length === 0) return null;

  // Create 6 duplicates for seamless looping
  const displayReporters = Array.from({ length: 6 }, () => reporters).flat();

  return (
    <div className="bg-gradient-to-r from-black/60 via-black/40 to-black/60 overflow-hidden border-b border-[#E31E24]/20 py-4 backdrop-blur-md">
      <motion.div 
        className="flex gap-4 items-center px-4"
        animate={{ x: ["0%", "-100%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {displayReporters.map((reporter, idx) => (
          <motion.div
            key={`${reporter.id}-${idx}`}
            className="flex-shrink-0 flex flex-col items-center gap-2 p-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-[#E31E24]/20 hover:border-[#E31E24]/60 transition-all cursor-pointer group backdrop-blur-sm hover:bg-gray-800/60"
            whileHover={{ scale: 1.08, y: -5 }}
          >
            <img
              src={reporter.image}
              alt={reporter.name}
              className="w-16 h-16 rounded-lg object-cover group-hover:ring-2 ring-[#E31E24] transition-all"
            />
            <div className="text-center min-w-[120px]">
              <div className="text-white font-bold text-sm line-clamp-1">{reporter.name}</div>
              <div className="text-[#E31E24] text-xs font-medium line-clamp-1">{reporter.specialty}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
        }