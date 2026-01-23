import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Settings } from "lucide-react";

export default function StudioTabs({ activeTab, onTabChange }) {
  const tabs = [
    {
      id: "create",
      label: "יצירת וידאו",
      icon: Sparkles,
      description: "צור וידאו חדש"
    },
    {
      id: "manage",
      label: "ניהול וידאוים",
      icon: Settings,
      description: "ערוך ומחק וידאוים"
    }
  ];

  return (
    <div className="hidden lg:flex flex-col sticky top-6 h-fit bg-black/40 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E31E24]/20 to-red-900/20 px-4 py-3 border-b border-[#E31E24]/30">
        <h3 className="text-white font-bold text-sm">סטודיו שידור</h3>
        <p className="text-white/50 text-xs mt-1">D-ID Video Studio</p>
      </div>

      {/* Tabs */}
      <div className="p-2 space-y-2">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left flex items-start gap-3 ${
                activeTab === tab.id
                  ? "border-[#E31E24] bg-[#E31E24]/20"
                  : "border-[#E31E24]/20 bg-black/20 hover:bg-[#E31E24]/10 hover:border-[#E31E24]/50"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                activeTab === tab.id
                  ? "bg-[#E31E24]/30"
                  : "bg-black/40"
              }`}>
                <Icon className={`w-5 h-5 ${
                  activeTab === tab.id
                    ? "text-[#E31E24]"
                    : "text-white/70"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${
                  activeTab === tab.id
                    ? "text-[#E31E24]"
                    : "text-white/70"
                }`}>
                  {tab.label}
                </p>
                <p className="text-white/50 text-xs mt-0.5">{tab.description}</p>
              </div>
              {activeTab === tab.id && (
                <div className="w-2 h-2 rounded-full bg-[#E31E24] flex-shrink-0" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#E31E24]/30 bg-black/20">
        <p className="text-white/60 text-xs leading-relaxed">
          💡 בחר טאב להתחיל ליצור או לנהל את הוידאוים שלך
        </p>
      </div>
    </div>
  );
}