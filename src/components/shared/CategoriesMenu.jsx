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
  { id: "breaking", label: "חדשות עכשיו", icon: Radio },
  { id: "security", label: "ביטחון ומדיניות", icon: Shield },
  { id: "economy", label: "כלכלה ועסקים", icon: TrendingUp },
  { id: "politics", label: "פוליטיקה", icon: Vote },
  { id: "technology", label: "טכנולוגיה", icon: Cpu },
  { id: "sports", label: "ספורט", icon: Trophy },
  { id: "entertainment", label: "בידור ודרמה", icon: Clapperboard },
  { id: "world", label: "חדשות עולם", icon: Globe },
  { id: "health", label: "בריאות", icon: Heart },
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
            className="w-full sm:w-[600px] max-h-[80vh] bg-gradient-to-br from-black/90 via-[#E31E24]/20 to-black/90 backdrop-blur-xl sm:rounded-2xl overflow-hidden border-t sm:border-2 border-[#E31E24]/40"
            style={{
              boxShadow: '0 0 40px rgba(227, 30, 36, 0.4), inset 0 0 30px rgba(227, 30, 36, 0.1)'
            }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-br from-black/80 via-[#E31E24]/60 to-black/80 backdrop-blur-sm p-4 flex items-center justify-between border-b-2 border-[#E31E24]/40">
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
                        className="block bg-gradient-to-br from-black/80 via-[#E31E24]/30 to-black/80 backdrop-blur-sm rounded-xl p-4 border-2 border-[#E31E24]/40 hover:border-[#E31E24]/80 transition-all group h-full"
                        style={{
                          boxShadow: '0 0 15px rgba(227, 30, 36, 0.3), inset 0 0 15px rgba(227, 30, 36, 0.1)'
                        }}
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