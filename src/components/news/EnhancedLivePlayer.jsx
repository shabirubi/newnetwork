import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LivePlayer from "./LivePlayer";
import ReportersFeed from "./ReportersFeed";
import UpdatesFeed from "./UpdatesFeed";

export default function EnhancedLivePlayer({ 
  title, 
  viewerCount, 
  isLive, 
  thumbnailUrl,
  streamUrl 
}) {
  const [activePanel, setActivePanel] = useState(null); // null, 'reporters', 'updates'
  const [showPanels, setShowPanels] = useState(false);

  return (
    <div className="relative">
      {/* Main Player */}
      <LivePlayer 
        title={title}
        isLive={isLive}
        viewerCount={viewerCount}
        thumbnailUrl={thumbnailUrl}
        streamUrl={streamUrl}
      />

      {/* Overlay Panels Button - Desktop */}
      <button
        onClick={() => setShowPanels(!showPanels)}
        className="hidden lg:flex absolute top-4 left-4 z-20 items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg transition-all"
      >
        <ChevronRight className={`w-4 h-4 transition-transform ${showPanels ? 'rotate-180' : ''}`} />
        <span className="text-sm font-medium">עוד</span>
      </button>

      {/* Desktop Panels - Overlay on player */}
      <AnimatePresence>
        {showPanels && (
          <>
            {/* Reporters Panel */}
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className="hidden lg:block absolute bottom-0 left-4 z-30 w-96"
            >
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-2xl border border-gray-700 border-b-0 overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <button
                    onClick={() => setActivePanel(activePanel === 'reporters' ? null : 'reporters')}
                    className={`w-full text-left font-bold text-white hover:text-[#E31E24] transition-colors ${activePanel === 'reporters' ? 'text-[#E31E24]' : ''}`}
                  >
                    אנשי השטח
                  </button>
                </div>
                {activePanel === 'reporters' && (
                  <div className="max-h-96 overflow-y-auto p-4">
                    <ReportersFeed />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Updates Panel */}
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ delay: 0.05 }}
              className="hidden lg:block absolute bottom-0 left-4 z-30 w-96"
            >
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-2xl border border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <button
                    onClick={() => setActivePanel(activePanel === 'updates' ? null : 'updates')}
                    className={`w-full text-left font-bold text-white hover:text-[#E31E24] transition-colors ${activePanel === 'updates' ? 'text-[#E31E24]' : ''}`}
                  >
                    עדכונים
                  </button>
                </div>
                {activePanel === 'updates' && (
                  <div className="max-h-96 overflow-y-auto p-4">
                    <UpdatesFeed />
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile - Below Player */}
      <div className="lg:hidden">
        {/* Reporters */}
        <div className="bg-gray-900 border-t border-gray-700 p-4">
          <h3 className="font-bold text-white mb-4 text-lg">אנשי השטח</h3>
          <ReportersFeed />
        </div>

        {/* Updates */}
        <div className="bg-gray-900 border-t border-gray-700 p-4">
          <h3 className="font-bold text-white mb-4 text-lg">עדכונים</h3>
          <UpdatesFeed />
        </div>
      </div>
    </div>
  );
}