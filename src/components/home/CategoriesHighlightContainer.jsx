import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { 
  Radio, Shield, TrendingUp, Vote, Cpu, 
  Trophy, Clapperboard, Globe, Heart
} from "lucide-react";

const categories = [
  { id: "breaking", label: "חדשות חמות", icon: Radio },
  { id: "security", label: "ביטחון", icon: Shield },
  { id: "economy", label: "כלכלה", icon: TrendingUp },
  { id: "politics", label: "פוליטיקה", icon: Vote },
  { id: "technology", label: "טכנולוגיה", icon: Cpu },
  { id: "sports", label: "ספורט", icon: Trophy },
  { id: "entertainment", label: "בידור", icon: Clapperboard },
  { id: "world", label: "עולם", icon: Globe },
];

export default function CategoriesHighlightContainer() {
  return (
    <section className="px-4 sm:px-4 mt-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold dark:text-white mb-2">קטגוריות חמות</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">בחר את הקטגוריה שמעניינת אותך</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -8 }}
            >
              <Link
                to={createPageUrl(`Category?cat=${cat.id}`)}
                className="bg-gradient-to-br from-black/80 via-[#E31E24]/30 to-black/80 backdrop-blur-sm rounded-2xl p-6 text-white border-2 border-[#E31E24]/40 hover:border-[#E31E24]/80 transition-all group relative overflow-hidden h-full flex flex-col items-center justify-center text-center"
                style={{
                  boxShadow: '0 0 20px rgba(227, 30, 36, 0.3), inset 0 0 20px rgba(227, 30, 36, 0.1)'
                }}
              >
                {/* Background elements */}
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/10 rounded-full group-hover:bg-white/20 transition-all" />
                <div className="absolute -bottom-5 -left-5 w-16 h-16 bg-white/5 rounded-full" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3 group-hover:bg-white/30 transition-all mx-auto backdrop-blur-sm">
                    <Icon className="w-8 h-8" />
                  </div>
                  <p className="font-bold text-base leading-tight">{cat.label}</p>
                  <p className="text-white/70 text-[10px] mt-2">לחץ להצגה</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}