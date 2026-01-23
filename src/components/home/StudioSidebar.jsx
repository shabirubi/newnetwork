import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { motion } from "framer-motion";
import { User, Users, Video, ArrowLeft } from "lucide-react";

export default function StudioSidebar() {
  const studioOptions = [
    {
      id: "talks",
      label: "Talks - ראש בלבד",
      description: "תמונה סטטית → וידאו מדבר",
      icon: User,
      color: "from-blue-500 to-blue-700",
      borderColor: "border-blue-500/30",
      hoverColor: "hover:bg-blue-500/20"
    },
    {
      id: "clips",
      label: "Clips - גוף מלא",
      description: "שדרנים מוכנים + ידיים",
      icon: Users,
      color: "from-purple-500 to-purple-700",
      borderColor: "border-purple-500/30",
      hoverColor: "hover:bg-purple-500/20"
    },
    {
      id: "express",
      label: "Express - מותאם",
      description: "אווטר אישי + ידיים",
      icon: Video,
      color: "from-pink-500 to-pink-700",
      borderColor: "border-pink-500/30",
      hoverColor: "hover:bg-pink-500/20"
    }
  ];

  return (
    <div className="hidden lg:block sticky top-6 h-fit bg-black/40 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E31E24]/20 to-red-900/20 px-4 py-3 border-b border-[#E31E24]/30">
        <h3 className="text-white font-bold text-sm">סטודיו שידור</h3>
        <p className="text-white/50 text-xs mt-1">בחר סוג אווטר</p>
      </div>

      {/* Studio Options */}
      <div className="p-3 space-y-2">
        {studioOptions.map((option, idx) => {
          const Icon = option.icon;
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link to={createPageUrl("BroadcastStudio")}>
                <button className={`w-full p-3 rounded-lg border-2 transition-all text-left group ${option.borderColor} ${option.hoverColor}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm leading-tight">{option.label}</p>
                      <p className="text-white/50 text-xs mt-1">{option.description}</p>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-white/50 group-hover:text-white/70 flex-shrink-0" />
                  </div>
                </button>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Info */}
      <div className="px-4 py-3 border-t border-[#E31E24]/30 bg-black/20">
        <p className="text-white/60 text-xs leading-relaxed">
          💡 בחר בסוג האווטר המתאים וצור וידאו בעזרת AI
        </p>
      </div>
    </div>
  );
}