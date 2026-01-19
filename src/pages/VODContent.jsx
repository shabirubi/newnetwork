import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Play, X } from "lucide-react";

const BACKGROUND_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/43de178a9_image.png";

export default function VODContent() {
  const [selectedContent, setSelectedContent] = useState(null);

  const { data: vodContent = [] } = useQuery({
    queryKey: ['vod-content'],
    queryFn: () => base44.entities.VODContent.list('-order', 100),
    initialData: []
  });

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url('${BACKGROUND_IMAGE}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col py-8 px-4">
        {/* Video Player */}
        {selectedContent && (
          <div className="max-w-5xl mx-auto w-full mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <button
                onClick={() => setSelectedContent(null)}
                className="absolute -top-10 right-0 text-white hover:text-[#E31E24] transition-colors z-10"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-2xl">
                {selectedContent.stream_url ? (
                  <iframe
                    src={selectedContent.stream_url}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-[#E31E24] mx-auto mb-4" />
                      <p className="text-white">אין קישור זמין</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Content Details */}
              <div className="mt-6 space-y-3">
                <h2 className="text-3xl font-bold text-white">
                  {selectedContent.title}
                </h2>
                <p className="text-gray-300">
                  {selectedContent.description}
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Videos Grid */}
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vodContent.map((content, index) => (
              <motion.div
                key={content.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedContent(content)}
                className="group cursor-pointer"
              >
                <div className="relative rounded-xl overflow-hidden bg-gray-900 shadow-2xl hover:shadow-3xl transition-all duration-300">
                  {content.thumbnail ? (
                    <img
                      src={content.thumbnail}
                      alt={content.title}
                      className="w-full aspect-video object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-gradient-to-br from-[#E31E24]/20 to-[#B91C1C]/20 flex items-center justify-center">
                      <span className="text-4xl">🎥</span>
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#E31E24] rounded-full p-4 opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl"
                    >
                      <Play className="w-6 h-6 text-white fill-white" />
                    </motion.button>
                  </div>

                  {/* Badge */}
                  {content.is_live && (
                    <div className="absolute top-3 right-3 bg-[#E31E24] text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      ישיר
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="mt-3 space-y-1">
                  <h3 className="text-white font-bold line-clamp-2 group-hover:text-[#E31E24] transition-colors">
                    {content.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-1">
                    {content.strip_name || content.category}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}