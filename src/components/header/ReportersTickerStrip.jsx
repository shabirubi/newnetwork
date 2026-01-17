import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import ReporterCardModal from "./ReporterCardModal";

export default function ReportersTickerStrip() {
  const [selectedReporter, setSelectedReporter] = useState(null);

  const { data: reporters = [] } = useQuery({
    queryKey: ['reporters-ticker'],
    queryFn: () => base44.entities.Reporter.filter({ is_active: true }),
    initialData: [],
    refetchInterval: 30000
  });

  if (reporters.length === 0) return null;

  // Create multiple duplicates for seamless looping
  const displayReporters = Array.from({ length: 10 }, () => reporters).flat();

  // Calculate duration based on number of reporters to maintain consistent speed
  const duration = reporters.length * 3.5;

  return (
    <>
      <div className="bg-gradient-to-r from-black/60 via-black/40 to-black/60 overflow-hidden border-b border-[#E31E24]/20 py-2 backdrop-blur-md">
        <motion.div 
        className="flex gap-2 items-center px-2"
        initial={{ x: 0 }}
        animate={{ x: `-${(reporters.length / displayReporters.length) * 100}%` }}
        transition={{ duration, repeat: Infinity, ease: "linear", repeatType: "loop" }}
      >
        {displayReporters.map((reporter, idx) => (
          <motion.div
            key={`${reporter.id}-${idx}`}
            onClick={() => setSelectedReporter(reporter)}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 p-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-[#E31E24]/20 hover:border-[#E31E24]/60 transition-all cursor-pointer group backdrop-blur-sm hover:bg-gray-800/60"
            whileHover={{ scale: 1.05, y: -3 }}
          >
            <img
              src={reporter.image}
              alt={reporter.name}
              className="w-12 h-12 rounded-md object-cover group-hover:ring-2 ring-[#E31E24] transition-all"
            />
            <div className="text-center min-w-[100px]">
              <div className="text-white font-bold text-xs line-clamp-1">{reporter.name}</div>
              <div className="text-[#E31E24] text-[10px] font-medium line-clamp-1">{reporter.specialty}</div>
            </div>
          </motion.div>
        ))}
        </motion.div>
      </div>

      <ReporterCardModal 
        reporter={selectedReporter}
        isOpen={!!selectedReporter}
        onClose={() => setSelectedReporter(null)}
      />
    </>
  );
}