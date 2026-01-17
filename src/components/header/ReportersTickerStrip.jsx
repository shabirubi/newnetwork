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
    <div className="bg-gradient-to-r from-red-900/20 via-black to-red-900/20 overflow-hidden border-b border-red-900/40 h-16 flex items-center w-full backdrop-blur-sm">
      <div className="flex items-center gap-4 px-4 h-full shrink-0">
        <div className="flex items-center gap-2 flex-shrink-0 text-red-400 font-bold text-sm whitespace-nowrap">
          <Users className="w-4 h-4" />
          אנשי השטח
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex gap-6 h-full items-center overflow-x-auto">
          {reporters.map((reporter, idx) => (
            <div
              key={`${reporter.id}-${idx}`}
              className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-red-900/20 rounded-lg border border-red-500/30 hover:border-red-500/60 transition-all cursor-pointer group backdrop-blur-sm"
            >
              <img
                src={reporter.image}
                alt={reporter.name}
                className="w-8 h-8 rounded-full object-cover group-hover:ring-2 ring-red-500 transition-all"
              />
              <div className="text-sm whitespace-nowrap">
                <div className="text-white font-bold text-xs">{reporter.name}</div>
                <div className="text-red-300 text-xs">{reporter.specialty}</div>
              </div>
            </div>
          ))}
        </div>
        </div>
        </div>
        );
        }