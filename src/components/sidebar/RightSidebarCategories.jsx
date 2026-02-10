import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import {
  Radio, Shield, TrendingUp, Vote, Cpu, Trophy,
  Clapperboard, Globe, Heart, Music, Sparkles, Zap
} from "lucide-react";

const CATEGORIES = [
  { id: "breaking", label: "חם", icon: Radio, href: "Category?cat=breaking", color: "text-red-400" },
  { id: "security", label: "ביטחון", icon: Shield, href: "Category?cat=security", color: "text-orange-400" },
  { id: "economy", label: "כלכלה", icon: TrendingUp, href: "Category?cat=economy", color: "text-green-400" },
  { id: "politics", label: "פוליטיקה", icon: Vote, href: "Category?cat=politics", color: "text-purple-400" },
  { id: "technology", label: "טק", icon: Cpu, href: "Category?cat=technology", color: "text-blue-400" },
  { id: "sports", label: "ספורט", icon: Trophy, href: "Category?cat=sports", color: "text-yellow-400" },
  { id: "entertainment", label: "בידור", icon: Clapperboard, href: "Category?cat=entertainment", color: "text-pink-400" },
  { id: "world", label: "עולם", icon: Globe, href: "Category?cat=world", color: "text-indigo-400" },
  { id: "health", label: "בריאות", icon: Heart, href: "Category?cat=health", color: "text-teal-400" },
  { id: "music", label: "מוזיקה", icon: Music, href: "Category?cat=entertainment", color: "text-fuchsia-400" },
  { id: "horoscope", label: "כוכבים", icon: Sparkles, href: "Category?cat=horoscope", color: "text-cyan-400" },
  { id: "live", label: "שידור", icon: Zap, href: "Live", color: "text-red-500" },
];

export default function RightSidebarCategories() {
  const displayCategories = Array.from({ length: 3 }, () => CATEGORIES).flat();

  return (
    <div className="hidden xl:flex w-40 bg-black/60 backdrop-blur-xl border-r border-[#00D4FF]/30 overflow-hidden sticky top-0 h-screen">
      <div className="flex items-center justify-center w-full relative">
        <div className="flex flex-col gap-4 absolute">
          <motion.div
            animate={{ y: `-${(CATEGORIES.length * 90)}px` }}
            transition={{ duration: CATEGORIES.length * 3, repeat: Infinity, ease: "linear" }}
            className="flex flex-col gap-4"
          >
            {displayCategories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={`${cat.id}-${idx}`}
                  to={createPageUrl(cat.href)}
                  className="flex flex-col items-center gap-1 px-2 py-3 group cursor-pointer"
                  title={cat.label}
                >
                  <div className={`w-16 h-16 rounded-lg bg-black/40 border border-[#00D4FF]/30 flex items-center justify-center group-hover:border-[#00D4FF]/80 transition-all text-[#00D4FF]`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <span className="text-[10px] text-[#00D4FF] text-center font-bold">
                    {cat.label}
                  </span>
                </Link>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}