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
    <div className="bg-black/40 overflow-hidden border-b border-black/50 h-16 flex items-center w-full backdrop-blur-md">
      <div className="flex items-center gap-4 px-4 h-full shrink-0">
        <div className="flex items-center gap-2 flex-shrink-0 text-white font-bold text-sm whitespace-nowrap">
          <Users className="w-4 h-4" />
          אנשי השטח
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <motion.div 
          className="flex gap-6 h-full items-center"
          animate={{ x: ["0%", "-100%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {displayReporters.map((reporter, idx) => (
            <motion.div
              key={`${reporter.id}-${idx}`}
              className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-black/30 rounded-lg border border-white/10 hover:border-white/30 transition-all cursor-pointer group backdrop-blur-md"
              whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.5)" }}
            >
              <img
                src={reporter.image}
                alt={reporter.name}
                className="w-8 h-8 rounded-full object-cover group-hover:ring-2 ring-white/50 transition-all"
              />
              <div className="text-sm whitespace-nowrap">
                <div className="text-white font-bold text-xs">{reporter.name}</div>
                <div className="text-gray-300 text-xs">{reporter.specialty}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
        </div>
        );
        }