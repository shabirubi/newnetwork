import React, { useState } from "react";
import { motion } from "framer-motion";
import { Globe, MessageCircle, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function WorldNewsReportersContainer() {
  const [generatingImages, setGeneratingImages] = useState({});

  const generateReporterImage = async (reporter) => {
    try {
      setGeneratingImages(prev => ({ ...prev, [reporter.id]: true }));
      const response = await base44.integrations.Core.GenerateImage({
        prompt: `Professional portrait of international news reporter. Clean, modern, professional journalist headshot style. High quality photo for news media. World news correspondent. IMPORTANT: NO TEXT in the image.`
      });
      return response.url;
    } catch (err) {
      console.error('Image generation failed:', err);
      return null;
    } finally {
      setGeneratingImages(prev => ({ ...prev, [reporter.id]: false }));
    }
  };

  const { data: reporters = [], isLoading } = useQuery({
    queryKey: ['world-news-reporters'],
    queryFn: async () => {
      const allReporters = await base44.entities.Reporter.list('-created_date', 50);
      const filtered = allReporters.filter(r => 
        r.is_active && 
        r.categories && 
        r.categories.some(cat => cat.toLowerCase().includes('world') || cat.toLowerCase().includes('global'))
      ).slice(0, 6);
      
      const withImages = await Promise.all(
        filtered.map(async (reporter) => {
          if (!reporter.image) {
            const backgroundImage = await generateReporterImage(reporter);
            return { ...reporter, background_image: backgroundImage };
          }
          return reporter;
        })
      );
      return withImages;
    },
    initialData: []
  });

  const handleReporterClick = () => {
    window.dispatchEvent(new CustomEvent('openReporterChat'));
  };

  if (isLoading) {
    return (
      <section className="px-4 sm:px-4 mt-8">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold dark:text-white">כתבנו בחדשות החוץ</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (reporters.length === 0) {
    return null;
  }

  return (
    <section className="px-4 sm:px-4 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="w-5 h-5 text-blue-500" />
        <h2 className="text-xl font-bold dark:text-white">כתבנו בחדשות החוץ</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reporters.map((reporter, idx) => (
          <motion.div
            key={reporter.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group relative rounded-2xl overflow-hidden border-2 border-[#E31E24]/40 hover:border-[#E31E24]/80 transition-all h-full flex flex-col bg-gradient-to-br from-black/80 via-[#E31E24]/30 to-black/80 backdrop-blur-sm text-white"
            style={{
              boxShadow: '0 0 20px rgba(227, 30, 36, 0.3), inset 0 0 20px rgba(227, 30, 36, 0.1)'
            }}
          >
            {/* Background Image */}
            {reporter.background_image ? (
              <div className="absolute inset-0">
                <img
                  src={reporter.background_image}
                  alt={reporter.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent group-hover:from-black/80 transition-all" />
              </div>
            ) : generatingImages[reporter.id] ? (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700" />
            )}

            <div className="relative z-10 p-5 h-full flex flex-col">
              {/* Reporter Image */}
              {reporter.image && (
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30 mb-3 mx-auto">
                  <img
                    src={reporter.image}
                    alt={reporter.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Reporter Info */}
              <h3 className="text-lg font-bold text-center mb-1">{reporter.name}</h3>
              <p className="text-white/80 text-sm text-center mb-1">{reporter.role}</p>
              
              {reporter.specialty && (
                <p className="text-white/70 text-xs text-center mb-3 line-clamp-2">
                  {reporter.specialty}
                </p>
              )}

              {/* Bio */}
              {reporter.bio && (
                <p className="text-white/75 text-xs mb-4 flex-1 line-clamp-2">
                  {reporter.bio}
                </p>
              )}

              {/* Categories */}
              {reporter.categories && reporter.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {reporter.categories.slice(0, 2).map((cat, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-white/20 px-2 py-1 rounded-full"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleReporterClick}
                className="w-full bg-white text-blue-600 font-bold py-2 rounded-lg hover:bg-white/90 transition-all flex items-center justify-center gap-2 mt-auto group/btn"
              >
                <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                שאל על חדשות החוץ
              </button>

              {/* Featured Badge */}
              {reporter.specialty && (
                <div className="absolute top-3 right-3 bg-yellow-400 text-blue-700 p-1.5 rounded-full">
                  <Star className="w-3 h-3 fill-current" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}