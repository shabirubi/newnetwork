import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Award, Users, TrendingUp, ExternalLink, MessageSquare, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import ReporterChat from "../apps/ReporterChat";

export default function ReportersSpotlight() {
  const [selectedReporter, setSelectedReporter] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: reporters = [] } = useQuery({
    queryKey: ['reporters-spotlight'],
    queryFn: () => base44.entities.Reporter.filter({ is_active: true }),
    initialData: []
  });

  const topReporters = reporters.slice(0, 6);
  const otherReporters = topReporters.slice(1, 7);
  
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % otherReporters.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + otherReporters.length) % otherReporters.length);
  };

  return (
    <section className="px-4 sm:px-4 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-[#E31E24]" />
          <h2 className="text-2xl font-bold dark:text-white">כתבים מובילים</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Featured Reporter */}
        {topReporters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="relative bg-gradient-to-br from-black/80 via-[#E31E24]/30 to-black/80 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-[#E31E24]/40 h-full"
              style={{
                boxShadow: '0 0 30px rgba(227, 30, 36, 0.3), inset 0 0 30px rgba(227, 30, 36, 0.1)'
              }}
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#E31E24]/10 to-transparent opacity-50"></div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between p-6">
                {/* Image */}
                <div className="mb-4">
                  <img
                    src={topReporters[0].image}
                    alt={topReporters[0].name}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </div>

                {/* Info */}
                <div>
                  <h3 className="text-white font-bold text-xl mb-1">
                    {topReporters[0].name}
                  </h3>
                  <p className="text-[#E31E24] font-bold text-sm mb-3">
                    {topReporters[0].role}
                  </p>
                  <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                    {topReporters[0].bio}
                  </p>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {topReporters[0].categories?.slice(0, 3).map((cat) => (
                      <span
                        key={cat}
                        className="text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded-full"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 border-t border-gray-700 pt-3">
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <Eye className="w-4 h-4 text-[#E31E24]" />
                      <span>מומחה בתחום: {topReporters[0].specialty}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedReporter(topReporters[0])}
                  className="mt-4 w-full bg-[#E31E24] hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  שאל שאלה
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Right - Carousel */}
        <div className="lg:col-span-2">
          <div className="relative">
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {otherReporters.slice(currentIndex, currentIndex + 2).map((reporter, idx) => (
                    <motion.div
                      key={reporter.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-black/80 via-[#E31E24]/20 to-black/80 backdrop-blur-sm rounded-xl p-4 border-2 border-[#E31E24]/40 hover:border-[#E31E24]/80 transition-all cursor-pointer group"
                      style={{
                        boxShadow: '0 0 15px rgba(227, 30, 36, 0.3), inset 0 0 15px rgba(227, 30, 36, 0.1)'
                      }}
                      onClick={() => setSelectedReporter(reporter)}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <img
                          src={reporter.image}
                          alt={reporter.name}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0 group-hover:ring-2 ring-[#E31E24] transition-all"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-bold text-sm">{reporter.name}</h4>
                          <p className="text-[#E31E24] text-xs font-bold">{reporter.role}</p>
                        </div>
                      </div>

                      {/* Specialty */}
                      <p className="text-gray-300 text-xs mb-3 line-clamp-2">
                        {reporter.specialty}
                      </p>

                      {/* Categories */}
                      <div className="flex flex-wrap gap-1">
                        {reporter.categories?.slice(0, 2).map((cat) => (
                          <span
                            key={cat}
                            className="text-xs bg-gray-700 text-gray-200 px-1.5 py-0.5 rounded"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-[#E31E24] hover:bg-red-700 text-white p-2 rounded-full transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-[#E31E24] hover:bg-red-700 text-white p-2 rounded-full transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: Math.ceil(otherReporters.length / 2) }).map((_, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setCurrentIndex(idx * 2)}
                  className={`h-2 rounded-full transition-all ${
                    idx === Math.floor(currentIndex / 2) ? 'bg-[#E31E24] w-8' : 'bg-gray-600 w-2'
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reporter Chat */}
      {selectedReporter && (
        <ReporterChat
          reporter={selectedReporter}
          onClose={() => setSelectedReporter(null)}
        />
      )}
    </section>
  );
}