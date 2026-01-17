import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { 
  Radio, Shield, TrendingUp, Vote, Cpu, 
  Trophy, Clapperboard, Globe, Heart
} from "lucide-react";

const categories = [
  { id: "breaking", label: "חדשות חמות", icon: Radio, color: "from-red-600 to-red-700" },
  { id: "security", label: "ביטחון", icon: Shield, color: "from-orange-600 to-orange-700" },
  { id: "economy", label: "כלכלה", icon: TrendingUp, color: "from-green-600 to-green-700" },
  { id: "politics", label: "פוליטיקה", icon: Vote, color: "from-purple-600 to-purple-700" },
  { id: "technology", label: "טכנולוגיה", icon: Cpu, color: "from-blue-600 to-blue-700" },
  { id: "sports", label: "ספורט", icon: Trophy, color: "from-emerald-600 to-emerald-700" },
  { id: "entertainment", label: "בידור", icon: Clapperboard, color: "from-pink-600 to-pink-700" },
  { id: "world", label: "עולם", icon: Globe, color: "from-indigo-600 to-indigo-700" },
];

export default function CategoriesHighlightContainer() {
  return (
    <section className="px-4 sm:px-4 mt-8">
      <h2 className="text-xl font-bold dark:text-white mb-6">קטגוריות חמות</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.05 }}
            >
              <Link
                to={createPageUrl(`Category?cat=${cat.id}`)}
                className={`bg-gradient-to-br ${cat.color} rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all group relative overflow-hidden`}
              >
                <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full group-hover:bg-white/20 transition-all" />
                
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3 group-hover:bg-white/30 transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-sm">{cat.label}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}