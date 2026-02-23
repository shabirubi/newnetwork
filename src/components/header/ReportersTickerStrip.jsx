import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import ReporterCardModal from "./ReporterCardModal";
import ReporterChat from "../apps/ReporterChat";
import ReporterLiveChat from "../reporter/ReporterLiveChat";

export default function ReportersTickerStrip() {
  const [selectedReporter, setSelectedReporter] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [hoveredReporter, setHoveredReporter] = useState(null);
  const [openReporterChat, setOpenReporterChat] = useState(false);
  const [selectedReporterForChat, setSelectedReporterForChat] = useState(null);
  const [openLiveChat, setOpenLiveChat] = useState(false);
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // CSS for grayscale images with animated transition + floating effect
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes colorPulse {
        0%, 100% { filter: grayscale(0%); -webkit-filter: grayscale(0%); }
        50% { filter: grayscale(100%); -webkit-filter: grayscale(100%); }
      }
      @keyframes slideHorizontal {
        0%, 100% { transform: translateX(0px); }
        50% { transform: translateX(4px); }
      }
      .reporter-ticker-image-animate {
        animation: colorPulse 4s ease-in-out infinite, slideHorizontal 2s ease-in-out infinite;
        filter: grayscale(0%);
        -webkit-filter: grayscale(0%);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const { data: reporters = [], isError } = useQuery({
    queryKey: ['reporters-ticker'],
    queryFn: async () => {
      try {
        const result = await base44.entities.Reporter.filter({ is_active: true });
        return result || [];
      } catch (error) {
        console.error('Failed to fetch reporters:', error);
        return [];
      }
    },
    initialData: [],
    refetchInterval: 30000,
    retry: false,
    enabled: true
  });

  if (isError || !reporters || reporters.length === 0) {
    return null;
  }

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollAmount = 200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollLeft);
    }
  };

  return (
    <>
      {reporters.length > 0 && (
      <div className="relative bg-gradient-to-br from-black via-[#0080FF]/5 to-black overflow-hidden z-[35] border-b border-[#0080FF]/20" style={{ height: '80px' }}>
        {/* Gradient Overlays */}
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />

        {/* Scroll Arrows */}
        <button
          onClick={() => scroll('left')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 backdrop-blur-sm p-2 rounded-full hover:bg-black/80 transition-all shadow-lg border border-[#0080FF]/30"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={() => scroll('right')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 backdrop-blur-sm p-2 rounded-full hover:bg-black/80 transition-all shadow-lg border border-[#0080FF]/30"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        {/* Reporters Scroll */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto h-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={handleScroll}
        >
          <div className="flex gap-3 py-4 h-full items-center justify-center" style={{ minWidth: '100%', width: 'max-content', margin: '0 auto' }}>
            {reporters.map((reporter) => (
              <motion.div
                key={reporter.id}
                onClick={() => {
                  setSelectedReporterForChat(reporter);
                  setOpenLiveChat(true);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 cursor-pointer"
              >
                <div className="flex flex-col items-center gap-1">
                  {/* Reporter Image */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#0080FF]/40 hover:border-[#0080FF]/80 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,128,255,0.3)]">
                    <img
                      src={reporter.image}
                      alt={reporter.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23333" width="80" height="80"/%3E%3Ctext x="40" y="40" font-size="40" fill="white" text-anchor="middle" dy=".3em"%3E' + reporter.name.charAt(0) + '%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    {/* Live Indicator */}
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-0.5 right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white"
                    />
                  </div>

                  {/* Reporter Name */}
                  <p className="text-white font-bold text-[10px] text-center drop-shadow-lg max-w-[60px] truncate">
                    {reporter.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      )}

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