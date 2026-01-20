import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, Sparkles } from "lucide-react";

export default function FieldReportersSection() {
  const { data: reporters = [] } = useQuery({
    queryKey: ['field-reporters'],
    queryFn: () => base44.entities.FieldReporter.filter({ is_active: true }),
    initialData: [],
    refetchInterval: 60000
  });

  return (
    <section className="px-4 sm:px-4 mt-12 mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#E31E24]" />
          <h2 className="text-3xl font-bold text-white">כתבים מהשטח</h2>
        </div>
        <div className="text-gray-400 text-sm">
          {reporters.length} כתבים בשטח
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {reporters.map((reporter, idx) => (
          <motion.div
            key={reporter.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -8 }}
            className="group relative overflow-hidden rounded-2xl"
            style={{
              boxShadow: '0 0 30px rgba(227, 30, 36, 0.4), inset 0 0 20px rgba(227, 30, 36, 0.1)'
            }}
          >
            {/* Background Image */}
            <div className="relative aspect-[3/4] overflow-hidden">
              <img 
                src={reporter.image}
                alt={reporter.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="font-bold text-lg mb-1">{reporter.name}</h3>
              
              {reporter.specialty && (
                <p className="text-sm text-[#E31E24] font-semibold mb-2">
                  {reporter.specialty}
                </p>
              )}
              
              {reporter.location && (
                <div className="flex items-center gap-1 text-xs text-gray-300">
                  <MapPin className="w-3 h-3 text-[#E31E24]" />
                  {reporter.location}
                </div>
              )}

              {reporter.bio && (
                <p className="text-xs text-gray-300 mt-2 line-clamp-2">
                  {reporter.bio}
                </p>
              )}
            </div>

            {/* Badge */}
            <div className="absolute top-3 right-3 bg-[#E31E24]/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
              בשטח
            </div>
          </motion.div>
        ))}
      </div>

      {reporters.length === 0 && (
        <div className="bg-gradient-to-br from-black/80 via-[#E31E24]/20 to-black/80 backdrop-blur-sm rounded-xl p-12 text-center border-2 border-[#E31E24]/40">
          <Sparkles className="w-16 h-16 text-[#E31E24] mx-auto mb-4" />
          <p className="text-gray-400 text-lg">אין כתבים בשטח כרגע</p>
        </div>
      )}
    </section>
  );
}