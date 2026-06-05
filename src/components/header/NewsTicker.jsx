import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Flame, Siren, MessageSquareWarning, Menu, Clock, Radio } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ClockWidget from "./ClockWidget";
import WeatherWidget from "./WeatherWidget";
import ChannelSelector from "./ChannelSelector";


export default function NewsTicker({ darkMode, setDarkMode, onMenuClick }) {
  const news = [
    "🎬 פרמיירה: כל הסדרות והתכניות החדשות משודרות החל מ-7 למרץ 2026",
    "📺 עונות חדשות של סדרות הפופולריות יותר ביותר מגיעות לערוץ",
    "🔥 תכנים בלעדיים ומקוריים - אל תפספסו את ההשקה הגדולה",
    "⭐ צפייה ישירה ללא הגבלה בכל הסדרות והתכניות שלנו",
    "🎭 דרמה, קומדיה, אקשן ועוד - הכל במקום אחד החל מ-7 למרץ"
  ];



  return (
    <div className="bg-gradient-to-r from-black via-[#001a40] to-black border-b border-[#0055BB]/40 backdrop-blur-xl shadow-xl shadow-[#0055BB]/30 relative overflow-hidden z-[37] text-white w-full flex justify-center">
      {/* Breaking News Strip */}
      <div className="flex items-center gap-1 sm:gap-3 px-4 py-3 w-full max-w-7xl">
        {/* Menu Button - Right Side */}
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg hover:bg-white/20 text-orange-500 active:scale-95 transition-all touch-manipulation relative z-[70] group shrink-0"
          title="תפריט"
        >
          <div className="flex flex-col gap-1.5">
            <div className="w-5 h-0.5 bg-[#E31E24] rounded-full group-hover:w-6 transition-all"></div>
            <div className="w-5 h-0.5 bg-[#E31E24] rounded-full group-hover:w-6 transition-all"></div>
            <div className="w-5 h-0.5 bg-[#E31E24] rounded-full group-hover:w-6 transition-all"></div>
          </div>
        </button>

        {/* Logo + Radio Button */}
          <div className="flex items-center gap-2 shrink-0">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png" 
              alt="הרשת החדשה" 
              className="h-12 sm:h-16 w-auto"
            />
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openAIRadio'))}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-gradient-to-r from-[#E31E24]/80 to-red-800/80 hover:from-[#E31E24] hover:to-red-800 rounded-lg text-white text-xs sm:text-sm font-bold transition-all active:scale-95"
          >
            <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">רדיו</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center min-w-0 relative z-10">
          {/* Scrolling text */}
          <div className="overflow-hidden w-full">
            <div className="flex items-center whitespace-nowrap">
              {news.map((item, index) => (
                <span key={`news-${index}`} className="inline-flex items-center gap-6 px-6 font-bold text-base md:text-lg text-white animate-marquee">
                  {item}
                </span>
              ))}
            </div>
          </div>
          {/* Israeli Flag */}
          <div className="flex items-center justify-center mt-1">
            <svg width="80" height="48" viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg">
              <rect width="220" height="150" fill="white"/>
              <rect y="0" width="220" height="28" fill="#0038b8"/>
              <rect y="122" width="220" height="28" fill="#0038b8"/>
              {/* Star of David */}
              <polygon points="110,45 122,65 98,65" fill="none" stroke="#0038b8" strokeWidth="5"/>
              <polygon points="110,105 98,85 122,85" fill="none" stroke="#0038b8" strokeWidth="5"/>
              <line x1="110" y1="45" x2="110" y2="105" stroke="none"/>
              {/* Magen David proper */}
              <g transform="translate(110,75)">
                <polygon points="0,-28 24,14 -24,14" fill="none" stroke="#0038b8" strokeWidth="5"/>
                <polygon points="0,28 24,-14 -24,-14" fill="none" stroke="#0038b8" strokeWidth="5"/>
              </g>
            </svg>
          </div>
        </div>

        <style>{`
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-marquee {
            animation: marquee 12s linear infinite;
          }
        `}</style>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0 relative z-[60]">

          <div className="hidden sm:block">
             <ClockWidget />
           </div>
           <div className="hidden md:block">
             <WeatherWidget />
           </div>

          <div className="relative z-[70]">
             <ChannelSelector />
           </div>

          <button 
            onClick={() => {
              window.location.href = createPageUrl("WarRoom");
            }}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors"
          >
            <Siren size={13} className="animate-pulse" />
            חדר מלחמה
          </button>

          <button 
            onClick={() => {
              window.location.href = createPageUrl("PublicReports");
            }}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors"
          >
            <MessageSquareWarning size={13} />
            דיווח מפגע
          </button>
        </div>
      </div>

    </div>
  );
}