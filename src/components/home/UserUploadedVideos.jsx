import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Heart, MessageCircle, Share2, Upload, Film } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function UserUploadedVideos({ onUploadClick }) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  const { data: videos = [] } = useQuery({
    queryKey: ['userVideos'],
    queryFn: async () => {
      const allVideos = await base44.entities.UserVideo.list();
      return allVideos.filter(v => v.status === 'ready').slice(0, 6);
    }
  });

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold dark:text-white mb-2">
              סרטונים מהקהילה
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              כתבים מתחילים משתפים כתבות וסרטונים מהשטח בזמן אמת
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onUploadClick}
            className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 whitespace-nowrap"
          >
            <Upload className="w-5 h-5" />
            העלה סרטון
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              onClick={() => setSelectedVideo(video)}
              className="group cursor-pointer"
            >
              {/* Video Card */}
              <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-700 hover:border-red-600 transition-all duration-300">
                {/* Thumbnail */}
                <div className="relative h-0 pb-[56.25%] overflow-hidden bg-gray-900">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <Film className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="bg-red-600 rounded-full p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <Play className="w-8 h-8 text-white fill-white" />
                    </motion.div>
                  </div>

                  {/* Duration Badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 px-3 py-1 rounded-lg text-xs text-white font-bold">
                      {video.duration}s
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-lg">
                    חדש
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Title */}
                  <h3 className="font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2">
                    {video.title}
                  </h3>

                  {/* Uploader Info */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                      {video.uploader.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {video.uploader}
                      </p>
                      <p className="text-xs text-gray-400">
                        {video.uploadedAt}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <div className="flex items-center gap-4 text-gray-400 text-sm">
                      <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4" />
                        {video.likes}
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        {video.comments}
                      </button>
                      <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}