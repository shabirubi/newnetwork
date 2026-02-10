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
      <div ref={containerRef} className="relative bg-black/90 backdrop-blur-xl border-b-2 border-[#0080FF]/50 shadow-xl shadow-[#0080FF]/30 z-[35] overflow-hidden flex justify-center"><div className="w-full max-w-7xl">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-8 h-8 bg-gradient-to-r from-black via-black/80 to-transparent hover:from-black/60 transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-[#E31E24]" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-8 h-8 bg-gradient-to-l from-black via-black/80 to-transparent hover:from-black/60 transition-all"
        >
          <ChevronRight className="w-5 h-5 text-[#E31E24]" />
        </button>

        <div ref={scrollContainerRef} className="overflow-x-auto overflow-y-hidden scrollbar-hide" onScroll={handleScroll} style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          <div className="flex gap-2 px-2 py-3 min-h-fit" style={{ minWidth: 'max-content' }}>
          {reporters.slice(0, 15).map((reporter, idx) => (
            <motion.div
              key={`${reporter.id}-${idx}`}
              onClick={() => {
                setSelectedReporterForChat(reporter);
                setOpenLiveChat(true);
              }}
              onMouseEnter={() => setHoveredReporter(reporter.id)}
              onMouseLeave={() => setHoveredReporter(null)}
              onTouchStart={() => setHoveredReporter(reporter.id)}
              onTouchEnd={() => setHoveredReporter(null)}
              className="flex-shrink-0 flex flex-col items-center gap-1 p-2 bg-black/50 rounded-lg border border-[#0080FF]/40 hover:border-[#0080FF]/80 hover:bg-[#0080FF]/10 transition-all cursor-pointer group shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={reporter.image}
                alt={reporter.name}
                className="w-16 h-16 sm:w-16 sm:h-16 rounded-lg object-cover border border-[#0080FF]/30 shadow-lg reporter-ticker-image-animate"
                style={{ 
                  display: 'block', 
                  minWidth: '64px', 
                  minHeight: '64px',
                  animationDelay: `${idx * 0.3}s`
                }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23333" width="80" height="80"/%3E%3Ctext x="40" y="40" font-size="40" fill="white" text-anchor="middle" dy=".3em"%3E' + reporter.name.charAt(0) + '%3C/text%3E%3C/svg%3E';
                }}
              />
              <div className="text-center w-16 sm:w-16">
                <div className="text-white font-bold text-[8px] sm:text-[8px] line-clamp-2 leading-tight">{reporter.name}</div>
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