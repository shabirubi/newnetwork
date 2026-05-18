import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import {
  Radio, Shield, TrendingUp, Vote, Cpu, Trophy,
  Clapperboard, Globe, Heart, Music, Sparkles, Zap,
  AlertTriangle, Home, Newspaper
} from "lucide-react";

const CATEGORIES = [
  { id: "home", label: "בית", icon: Home, href: "Home" },
  { id: "breaking", label: "חם", icon: Radio, href: "Category?cat=breaking" },
  { id: "security", label: "ביטחון", icon: Shield, href: "Category?cat=security" },
  { id: "economy", label: "כלכלה", icon: TrendingUp, href: "Category?cat=economy" },
  { id: "politics", label: "פוליטיקה", icon: Vote, href: "Category?cat=politics" },
  { id: "technology", label: "טק", icon: Cpu, href: "Category?cat=technology" },
  { id: "sports", label: "ספורט", icon: Trophy, href: "Category?cat=sports" },
  { id: "entertainment", label: "בידור", icon: Clapperboard, href: "Category?cat=entertainment" },
  { id: "world", label: "עולם", icon: Globe, href: "Category?cat=world" },
  { id: "health", label: "בריאות", icon: Heart, href: "Category?cat=health" },
  { id: "music", label: "מוזיקה", icon: Music, href: "Category?cat=entertainment" },
  { id: "horoscope", label: "כוכבים", icon: Sparkles, href: "Category?cat=horoscope" },
  { id: "crime", label: "פלילים", icon: AlertTriangle, href: "Category?cat=crime" },
  { id: "israel", label: "ישראל", icon: Newspaper, href: "Category?cat=israel" },
  { id: "live", label: "שידור", icon: Zap, href: "Live" },
];

export default function RightSidebarCategories() {
  return (
    <div className="hidden xl:flex w-36 bg-black/60 backdrop-blur-xl border-r border-[#1565C0]/30 self-start sticky top-0 max-h-screen overflow-y-auto flex-col py-4 gap-1">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        return (
          <Link
            key={cat.id}
            to={createPageUrl(cat.href)}
            className="flex flex-col items-center gap-1 px-2 py-2.5 group cursor-pointer rounded-xl mx-1 hover:bg-[#1565C0]/20 transition-all"
            title={cat.label}
          >
            <div className="w-12 h-12 rounded-lg bg-black/40 border border-[#1565C0]/30 flex items-center justify-center group-hover:border-[#E87722]/70 transition-all text-[#1565C0] group-hover:text-[#E87722]">
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-[10px] text-gray-300 group-hover:text-[#E87722] text-center font-bold transition-colors">
              {cat.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}