import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ReporterChatModal from "./ReporterChatModal";

export default function ReporterChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReporter, setSelectedReporter] = useState(null);

  React.useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('openReporterChat', handleOpenChat);
    return () => window.removeEventListener('openReporterChat', handleOpenChat);
  }, []);

  const { data: reporters = [] } = useQuery({
    queryKey: ['reporters'],
    queryFn: () => base44.entities.Reporter.filter({ is_active: true }),
    initialData: []
  });

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="group relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-full p-4 sm:p-3.5 shadow-2xl border-2 border-white/30 hover:border-white/50 transition-all fixed left-4 sm:left-6 bottom-44 z-50"
        title="צ'אט עם הכתבים"
      >
        <MessageCircle className="w-6 h-6 sm:w-5 sm:h-5 text-white" />
      </motion.button>

      {/* Reporters List Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:w-[500px] max-h-[80vh] bg-gradient-to-b from-gray-900 to-black sm:rounded-2xl overflow-hidden shadow-2xl border-t sm:border border-blue-600/50"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 p-4 flex items-center justify-between border-b border-blue-600/30">
                <div>
                  <h2 className="text-xl font-bold text-white">בחר כתב לשיחה</h2>
                  <p className="text-sm text-blue-200">{reporters.length} כתבים זמינים</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Reporters Grid */}
              <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
                {reporters.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">אין כתבים זמינים כרגע</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {reporters.map((reporter) => (
                      <motion.button
                        key={reporter.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedReporter(reporter);
                          setIsOpen(false);
                        }}
                        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 hover:border-blue-600 transition-all group"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden mb-3 border-2 border-gray-700 group-hover:border-blue-600 transition-colors">
                          <img 
                            src={reporter.image}
                            alt={reporter.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="text-white font-bold text-sm mb-1 line-clamp-1">{reporter.name}</h3>
                        <p className="text-gray-400 text-xs mb-2 line-clamp-1">{reporter.role}</p>
                        <div className="flex items-center justify-center gap-1 text-blue-400 text-xs">
                          <Send className="w-3 h-3" />
                          <span>התחל שיחה</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      {selectedReporter && (
        <ReporterChatModal
          isOpen={!!selectedReporter}
          onClose={() => setSelectedReporter(null)}
          reporter={selectedReporter}
        />
      )}
    </>
  );
}