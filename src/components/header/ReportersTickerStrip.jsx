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
      <div className="relative bg-[#000000] overflow-hidden z-[35] border-b border-[#222]" style={{ height: '80px' }}>
        {/* Gradient Overlays */}
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />

        {/* Scroll Arrows */}
        <button
          onClick={() => scroll('left')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/80 backdrop-blur-sm p-2 rounded-full hover:bg-[#222] transition-all shadow-lg border border-gray-700"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={() => scroll('right')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/80 backdrop-blur-sm p-2 rounded-full hover:bg-[#222] transition-all shadow-lg border border-gray-700"
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
                  {/* Reporter Image - grayscale, color on hover */}
                  <div className="relative w-12 h-12 overflow-hidden rounded group">
                    <img
                      src={reporter.image}
                      alt={reporter.name}
                      className="w-full h-full object-cover transition-all duration-300 grayscale group-hover:grayscale-0"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-green-400 rounded-full"
                    />
                  </div>
                  <p className="text-white font-bold text-[10px] text-center max-w-[60px] truncate">
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