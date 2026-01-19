import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import ReporterCardModal from "./ReporterCardModal";

export default function ReportersTickerStrip() {
  const [selectedReporter, setSelectedReporter] = useState(null);
  const [dragX, setDragX] = useState(0);
  const containerRef = useRef(null);

  const { data: reporters = [] } = useQuery({
    queryKey: ['reporters-ticker'],
    queryFn: () => base44.entities.Reporter.filter({ is_active: true }),
    initialData: [],
    refetchInterval: 30000
  });

  if (reporters.length === 0) return null;

  // Create 8 duplicates for completely seamless infinite loop
  const displayReporters = [...reporters, ...reporters, ...reporters, ...reporters, ...reporters, ...reporters, ...reporters, ...reporters];

  return (
    <>
      <div ref={containerRef} className="bg-black/90 backdrop-blur-xl border-b border-[#E31E24]/30 shadow-xl shadow-[#E31E24]/20 overflow-hidden py-2" style={{ touchAction: 'pan-y' }}>
        <motion.div 
          className="flex gap-2 items-center min-w-max"
          animate={{ x: ["0%", "-12.5%"] }}
          transition={{ 
            duration: reporters.length * 2.5,
            repeat: Infinity, 
            ease: "linear",
            repeatType: "loop"
          }}
        >
        {displayReporters.map((reporter, idx) => (
          <motion.div
            key={`${reporter.id}-${idx}`}
            onClick={() => setSelectedReporter(reporter)}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 p-2 bg-black/60 backdrop-blur-xl rounded-xl border border-[#E31E24]/30 hover:border-[#E31E24]/60 hover:bg-[#E31E24]/20 transition-all cursor-pointer group shadow-lg hover:shadow-[#E31E24]/30"
            whileHover={{ scale: 1.08, y: -4 }}
            animate={{
              boxShadow: [
                '0 0 10px rgba(227, 31, 36, 0.2)',
                '0 0 20px rgba(227, 31, 36, 0.4)',
                '0 0 10px rgba(227, 31, 36, 0.2)'
              ]
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: idx * 0.1
              }
            }}
          >
            <motion.img
              src={reporter.image}
              alt={reporter.name}
              className="w-12 h-12 rounded-lg object-cover border-2 border-[#E31E24]/20 group-hover:border-[#E31E24] transition-all"
              whileHover={{ rotate: [0, -2, 2, 0] }}
              transition={{ duration: 0.3 }}
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