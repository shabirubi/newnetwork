import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import UpdatesFeed from "./UpdatesFeed";
import ReportersFeed from "../news/ReportersFeed";

export default function PopupFeed({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("updates");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-black/80 backdrop-blur-lg border border-gray-700/50 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-b from-gray-900/50 to-transparent border-b border-gray-700/30 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("updates")}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    activeTab === "updates"
                      ? "bg-[#E31E24] text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  עדכונים
                </button>
                <button
                  onClick={() => setActiveTab("reporters")}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    activeTab === "reporters"
                      ? "bg-[#E31E24] text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  אנשי השטח
                </button>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-70px)]">
              {activeTab === "updates" && (
                <div className="p-6">
                  <UpdatesFeed />
                </div>
              )}
              {activeTab === "reporters" && (
                <div className="p-6">
                  <ReportersFeed />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}