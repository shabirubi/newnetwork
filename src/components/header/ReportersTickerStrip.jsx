import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Mic } from "lucide-react";
import ReporterLiveChat from "../reporter/ReporterLiveChat";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face";

export default function ReportersTickerStrip() {
  const [selectedReporterForChat, setSelectedReporterForChat] = useState(null);
  const [openLiveChat, setOpenLiveChat] = useState(false);
  const scrollContainerRef = useRef(null);

  const { data: reporters = [], isError } = useQuery({
    queryKey: ['reporters-ticker'],
    queryFn: async () => {
      try {
        const result = await base44.entities.Reporter.filter({ is_active: true });
        return result || [];
      } catch (error) {
        return [];
      }
    },
    initialData: [],
    refetchInterval: 30000,
    retry: false,
  });

  if (isError || !reporters || reporters.length === 0) return null;

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  // First reporter is always "live" (index 0), rest are offline
  return (
    <>
      <div className="relative bg-[#000000] overflow-hidden z-[35] border-b border-[#222]" style={{ height: '88px' }}>
        {/* Gradient Overlays */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />

        {/* Scroll Arrows */}
        <button onClick={() => scroll('left')} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/80 p-1.5 rounded-full hover:bg-[#222] transition-all border border-gray-700">
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
        <button onClick={() => scroll('right')} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/80 p-1.5 rounded-full hover:bg-[#222] transition-all border border-gray-700">
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>

        {/* Reporters Scroll */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto h-full flex items-center px-10"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-4 items-center" style={{ width: 'max-content' }}>
            {reporters.map((reporter, index) => {
              const isLive = index === 0; // רק הראשון לייב
              return (
                <motion.div
                  key={reporter.id}
                  onClick={() => {
                    setSelectedReporterForChat(reporter);
                    setOpenLiveChat(true);
                  }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0 cursor-pointer flex flex-col items-center gap-1"
                >
                  {/* Image */}
                  <div className="relative w-12 h-12 overflow-hidden rounded group">
                    <img
                      src={reporter.image || DEFAULT_IMAGE}
                      alt={reporter.name}
                      className="w-full h-full object-cover transition-all duration-300 grayscale group-hover:grayscale-0"
                      onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                    />
                    {/* Live indicator */}
                    {isLive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Mic className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Live / Offline badge */}
                  {isLive ? (
                    <motion.div
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="flex items-center gap-1 bg-red-600 px-1.5 py-0.5 rounded text-white text-[9px] font-black"
                    >
                      <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />
                      LIVE
                    </motion.div>
                  ) : (
                    <span className="text-gray-500 text-[9px] font-bold">offline</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <ReporterLiveChat
        isOpen={openLiveChat}
        onClose={() => {
          setOpenLiveChat(false);
          setSelectedReporterForChat(null);
        }}
        reporter={selectedReporterForChat}
      />
    </>
  );
}