import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import ReporterCardModal from "./ReporterCardModal";
import ReporterChat from "../apps/ReporterChat";

export default function ReportersTickerStrip() {
  const [selectedReporter, setSelectedReporter] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [hoveredReporter, setHoveredReporter] = useState(null);
  const [openReporterChat, setOpenReporterChat] = useState(false);
  const [selectedReporterForChat, setSelectedReporterForChat] = useState(null);
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // CSS for grayscale images with smooth transition
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .reporter-ticker-image-bw {
        filter: grayscale(100%) !important;
        -webkit-filter: grayscale(100%) !important;
        transition: filter 0.4s ease-in-out !important;
      }
      .reporter-ticker-image-color {
        filter: grayscale(0%) !important;
        -webkit-filter: grayscale(0%) !important;
        transition: filter 0.4s ease-in-out !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const { data: reporters = [] } = useQuery({
    queryKey: ['reporters-ticker'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return [];
        return base44.entities.Reporter.filter({ is_active: true });
      } catch {
        return [];
      }
    },
    initialData: [],
    refetchInterval: 30000
  });

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

  if (reporters.length === 0) return null;

  return (
    <>
      <div ref={containerRef} className="relative bg-black/90 backdrop-blur-xl border-b border-[#E31E24]/30 shadow-xl shadow-[#E31E24]/20 py-3 z-10">
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

        <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide" onScroll={handleScroll} style={{ touchAction: 'pan-x' }}>
          <div className="flex gap-2 items-center px-2 lg:px-10 py-1">
        {reporters.map((reporter, idx) => (
          <motion.div
            key={`${reporter.id}-${idx}`}
            onClick={() => {
              setSelectedReporterForChat(reporter);
              setOpenReporterChat(true);
            }}
            onMouseEnter={() => setHoveredReporter(reporter.id)}
            onMouseLeave={() => setHoveredReporter(null)}
            className="flex-shrink-0 flex flex-col items-center gap-0.5 p-1 bg-black/60 backdrop-blur-xl rounded-lg border border-[#E31E24]/30 hover:border-[#E31E24]/60 hover:bg-[#E31E24]/20 transition-all cursor-pointer group shadow-lg hover:shadow-[#E31E24]/30"
            whileHover={{ scale: 1.05, y: -2 }}
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
            <img
              src={reporter.image}
              alt={reporter.name}
              className={`w-20 h-20 rounded-lg object-cover border-2 border-[#E31E24]/20 group-hover:border-[#E31E24] transition-all shadow-lg ${
                hoveredReporter === reporter.id ? 'reporter-ticker-image-color' : 'reporter-ticker-image-bw'
              }`}
            />
            <div className="text-center min-w-[60px]">
              <div className="text-white font-bold text-[9px] line-clamp-1">{reporter.name}</div>
              <div className="text-[#E31E24] text-[8px] font-medium line-clamp-1">{reporter.specialty}</div>
            </div>
          </motion.div>
          ))}
          </div>
          </div>
          </div>

          {selectedReporterForChat && openReporterChat && (
            <ReporterChat 
              externalIsOpen={openReporterChat}
              externalSetIsOpen={(isOpen) => {
                setOpenReporterChat(isOpen);
                if (!isOpen) setSelectedReporterForChat(null);
              }}
              preSelectedReporter={selectedReporterForChat}
            />
          )}
          </>
          );
          }