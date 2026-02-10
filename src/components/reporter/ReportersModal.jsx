import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Mic, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import ReporterChat from "../apps/ReporterChat";

const categoryLabels = {
  security: "ביטחון",
  economy: "כלכלה",
  politics: "פוליטיקה",
  technology: "טכנולוגיה",
  sports: "ספורט",
  entertainment: "בידור",
  world: "עולם",
  health: "בריאות",
  finance: "פיננסים",
  horoscope: "מזלות",
  music: "מוזיקה",
  breaking: "חדשות חמות"
};

export default function ReportersModal({ isOpen, onClose }) {
  const [selectedReporterForChat, setSelectedReporterForChat] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  const { data: reporters = [], isLoading } = useQuery({
    queryKey: ['reporters-modal'],
    queryFn: async () => {
      const result = await base44.entities.Reporter.list('name');
      console.log('📰 Loaded reporters in modal:', result);
      return result;
    },
    enabled: isOpen,
    staleTime: 0,
    refetchOnMount: true,
    initialData: []
  });

  const handleReporterClick = (reporter) => {
    setSelectedReporterForChat(reporter);
    setChatOpen(true);
  };

  if (!isOpen) return null;

  if (chatOpen && selectedReporterForChat) {
    return (
      <ReporterChat
        externalIsOpen={chatOpen}
        externalSetIsOpen={(isOpen) => {
          setChatOpen(isOpen);
          if (!isOpen) setSelectedReporterForChat(null);
        }}
        preSelectedReporter={selectedReporterForChat}
      />
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[85vh] overflow-hidden border-4 border-[#E31E24]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCA0LTRzNCwyIDQgNHYyYzAgMi0yIDQtNCA0cy00LTItNC00di0yem0wLTMwYzAtMiAyLTQgNC00czQgMiA0IDR2MmMwIDItMiA0LTQgNC00IDItNC0yLTQtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')]"></div>
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">נבחרת הכתבים שלנו</h2>
                  <p className="text-white/90 text-sm">
                    {reporters.length} כתבים מקצועיים בשטח
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all backdrop-blur-sm"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(85vh-120px)] p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : reporters.length === 0 ? (
              <div className="text-center py-20">
                <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
                  אין כתבים זמינים
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  הכתבים יתווספו בקרוב
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {reporters.map((reporter, index) => (
                  <motion.div
                    key={reporter.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => handleReporterClick(reporter)}
                    className="group bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-[#E31E24] dark:hover:border-[#E31E24] cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#001a4d] via-[#003d99] to-[#0080FF]">
                      <img
                        src={reporter.image}
                        alt={reporter.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      
                      {/* Live Badge */}
                      <div className="absolute top-1.5 right-1.5">
                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[#E31E24] text-white text-[8px] font-bold rounded-full">
                          <span className="relative flex h-1 w-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1 w-1 bg-white"></span>
                          </span>
                          LIVE
                        </div>
                      </div>

                      {/* Name Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <h3 className="text-white font-bold text-xs leading-tight">
                          {reporter.name}
                        </h3>
                        <p className="text-white/90 text-[10px]">
                          {reporter.role}
                        </p>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-2">
                      {/* Categories */}
                      <div className="flex flex-wrap gap-1">
                        {reporter.categories?.slice(0, 2).map(cat => (
                          <span
                            key={cat}
                            className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[8px] font-bold rounded-full"
                          >
                            {categoryLabels[cat] || cat}
                          </span>
                        ))}
                        {reporter.categories?.length > 2 && (
                          <span className="px-1.5 py-0.5 bg-[#E31E24] text-white text-[8px] font-bold rounded-full">
                            +{reporter.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}