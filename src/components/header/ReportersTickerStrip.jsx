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
      <div className="relative bg-black overflow-hidden z-[35]" style={{ height: '72px' }}>
        {/* Gradient Overlays */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />

        {/* Scroll Arrows */}
        <button onClick={() => scroll('left')} className="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-1 text-gray-600 hover:text-white transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={() => scroll('right')} className="absolute left-1 top-1/2 -translate-y-1/2 z-20 p-1 text-gray-600 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Reporters Scroll */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto h-full flex items-center px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-5 items-center" style={{ width: 'max-content' }}>
            {reporters.map((reporter, index) => {
              const isLive = index === 0;
              return (
                <motion.div
                  key={reporter.id}
                  onClick={() => {
                    setSelectedReporterForChat(reporter);
                    setOpenLiveChat(true);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0 cursor-pointer flex flex-col items-center gap-1"
                >
                  {/* Image — circle, no border */}
                  <div className="relative w-10 h-10 overflow-hidden rounded-full group">
                    <img
                      src={reporter.image || DEFAULT_IMAGE}
                      alt={reporter.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                      onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                    />
                  </div>

                  {/* Badge */}
                  {isLive ? (
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="text-red-500 text-[8px] font-black tracking-widest"
                    >
                      ● LIVE
                    </motion.span>
                  ) : (
                    <span className="text-gray-700 text-[8px]">·</span>
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