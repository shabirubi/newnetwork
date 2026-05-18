import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import {
  Radio, Shield, TrendingUp, Vote, Cpu, Trophy,
  Clapperboard, Globe, Heart, Music, Sparkles, Zap,
  AlertTriangle, Home, Newspaper, Users, FlaskConical
} from "lucide-react";

const CATEGORIES = [
  { id: "home", label: "בית", icon: Home, href: "Home", color: "#E87722" },
  { id: "breaking", label: "חם", icon: Radio, href: "Category?cat=breaking", color: "#ff3333" },
  { id: "security", label: "ביטחון", icon: Shield, href: "Category?cat=security", color: "#1565C0" },
  { id: "economy", label: "כלכלה", icon: TrendingUp, href: "Category?cat=economy", color: "#22c55e" },
  { id: "politics", label: "פוליטיקה", icon: Vote, href: "Category?cat=politics", color: "#a855f7" },
  { id: "technology", label: "טק", icon: Cpu, href: "Category?cat=technology", color: "#06b6d4" },
  { id: "sports", label: "ספורט", icon: Trophy, href: "Category?cat=sports", color: "#f59e0b" },
  { id: "entertainment", label: "בידור", icon: Clapperboard, href: "Category?cat=entertainment", color: "#ec4899" },
  { id: "world", label: "עולם", icon: Globe, href: "Category?cat=world", color: "#3b82f6" },
  { id: "health", label: "בריאות", icon: Heart, href: "Category?cat=health", color: "#ef4444" },
  { id: "music", label: "מוזיקה", icon: Music, href: "Category?cat=music", color: "#8b5cf6" },
  { id: "horoscope", label: "כוכבים", icon: Sparkles, href: "Category?cat=horoscope", color: "#fbbf24" },
  { id: "crime", label: "פלילים", icon: AlertTriangle, href: "Category?cat=crime", color: "#f97316" },
  { id: "israel", label: "ישראל", icon: Newspaper, href: "Category?cat=israel", color: "#1565C0" },
  { id: "science", label: "מדע", icon: FlaskConical, href: "Category?cat=science", color: "#10b981" },
  { id: "live", label: "שידור", icon: Zap, href: "Live", color: "#ff3333" },
];

export default function RightSidebarCategories() {
  return (
    <div className="hidden xl:flex w-36 bg-black/70 backdrop-blur-xl border-r border-[#1565C0]/30 self-start sticky top-0 max-h-screen overflow-y-auto flex-col py-3 gap-0.5">
      <style>{`
        @keyframes catPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px var(--cat-color); }
          50% { opacity: 0.6; box-shadow: 0 0 18px var(--cat-color); }
        }
        .cat-item { animation: catPulse 2.5s ease-in-out infinite; }
        .cat-item:nth-child(2) { animation-delay: 0.2s; }
        .cat-item:nth-child(3) { animation-delay: 0.4s; }
        .cat-item:nth-child(4) { animation-delay: 0.6s; }
        .cat-item:nth-child(5) { animation-delay: 0.8s; }
        .cat-item:nth-child(6) { animation-delay: 1.0s; }
        .cat-item:nth-child(7) { animation-delay: 1.2s; }
        .cat-item:nth-child(8) { animation-delay: 1.4s; }
        .cat-item:nth-child(9) { animation-delay: 1.6s; }
        .cat-item:nth-child(10) { animation-delay: 1.8s; }
        .cat-item:nth-child(11) { animation-delay: 2.0s; }
        .cat-item:nth-child(12) { animation-delay: 2.2s; }
        .cat-item:nth-child(13) { animation-delay: 2.4s; }
        .cat-item:nth-child(14) { animation-delay: 2.6s; }
        .cat-item:nth-child(15) { animation-delay: 2.8s; }
        .cat-item:nth-child(16) { animation-delay: 3.0s; }
      `}</style>
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        return (
          <Link
            key={cat.id}
            to={createPageUrl(cat.href)}
            className="cat-item flex flex-col items-center gap-1 px-2 py-2 group cursor-pointer rounded-xl mx-1 hover:bg-white/10 transition-colors"
            style={{ "--cat-color": cat.color }}
            title={cat.label}
          >
            <div
              className="w-11 h-11 rounded-lg bg-black/50 flex items-center justify-center transition-all border"
              style={{ borderColor: `${cat.color}55`, color: cat.color }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-center font-bold" style={{ color: cat.color }}>
              {cat.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}