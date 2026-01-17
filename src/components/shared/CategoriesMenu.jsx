import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { 
  Radio, TrendingUp, Shield, Vote, Cpu, Trophy, 
  Clapperboard, Globe, Heart, Newspaper, Cloud
} from "lucide-react";

const CATEGORIES = [
  { id: "breaking", label: "חדשות עכשיו", icon: Radio, color: "from-red-600 to-red-700" },
  { id: "security", label: "ביטחון ומדיניות", icon: Shield, color: "from-blue-600 to-blue-700" },
  { id: "economy", label: "כלכלה ועסקים", icon: TrendingUp, color: "from-green-600 to-green-700" },
  { id: "politics", label: "פוליטיקה", icon: Vote, color: "from-purple-600 to-purple-700" },
  { id: "technology", label: "טכנולוגיה", icon: Cpu, color: "from-cyan-600 to-cyan-700" },
  { id: "sports", label: "ספורט", icon: Trophy, color: "from-yellow-600 to-yellow-700" },
  { id: "entertainment", label: "בידור ודרמה", icon: Clapperboard, color: "from-pink-600 to-pink-700" },
  { id: "world", label: "חדשות עולם", icon: Globe, color: "from-indigo-600 to-indigo-700" },
  { id: "health", label: "בריאות", icon: Heart, color: "from-orange-600 to-orange-700" },
];

export default function CategoriesMenu({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[105] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:w-[600px] max-h-[80vh] bg-gradient-to-b from-gray-900 to-black sm:rounded-2xl overflow-hidden shadow-2xl border-t sm:border border-red-600/50"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-900 via-red-800 to-red-900 p-4 flex items-center justify-between border-b border-red-600/30">
              <div>
                <h2 className="text-xl font-bold text-white">קטגוריות חדשות</h2>
                <p className="text-sm text-red-200">{CATEGORIES.length} קטגוריות זמינות</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Categories Grid */}
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="grid grid-cols-2 gap-4">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <motion.div
                      key={cat.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to={createPageUrl(`Category?cat=${cat.id}`)}
                        onClick={onClose}
                        className={`block bg-gradient-to-br ${cat.color} rounded-xl p-4 border border-white/10 hover:border-white/30 transition-all group h-full`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Icon className="w-6 h-6 text-white" />
                          <span className="text-xs font-bold text-white/80 bg-white/10 px-2 py-1 rounded-full">חדשות</span>
                        </div>
                        <h3 className="text-white font-bold text-sm leading-tight">{cat.label}</h3>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}