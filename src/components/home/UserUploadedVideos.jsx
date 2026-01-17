import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Heart, MessageCircle, Share2, Upload } from "lucide-react";

const mockVideos = [
  {
    id: 1,
    thumbnail: "https://images.unsplash.com/photo-1516251193007-45ef944ab9c9?w=400&h=300&fit=crop",
    title: "דיווח חי מהשטח - ירושלים",
    uploader: "דניאל כהן",
    uploadedAt: "30 דקות",
    views: 2341,
    likes: 156,
    comments: 23,
    badge: "כתב חדש"
  },
  {
    id: 2,
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    title: "עדכון ממהיר - תאונה בכביש 1",
    uploader: "ליאור רבינוביץ'",
    uploadedAt: "1 שעה",
    views: 5234,
    likes: 412,
    comments: 67,
    badge: "כתב חדש"
  },
  {
    id: 3,
    thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop",
    title: "הציבור מתערער - ראיונות רחוב",
    uploader: "שרה לוי",
    uploadedAt: "2 שעות",
    views: 3145,
    likes: 289,
    comments: 45,
    badge: "כתב חדש"
  },
  {
    id: 4,
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
    title: "כנס עיתונאים צעירים - תל אביב",
    uploader: "אור גבריאל",
    uploadedAt: "3 שעות",
    views: 1876,
    likes: 134,
    comments: 28,
    badge: "כתב חדש"
  },
  {
    id: 5,
    thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop",
    title: "תיעוד מהפגנה בקריית אונו",
    uploader: "מירון דוד",
    uploadedAt: "4 שעות",
    views: 4102,
    likes: 356,
    comments: 82,
    badge: "כתב חדש"
  },
  {
    id: 6,
    thumbnail: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop",
    title: "טיול בעיתוןות - מאחורי הקלמרות",
    uploader: "נתן שפיר",
    uploadedAt: "5 שעות",
    views: 6543,
    likes: 521,
    comments: 93,
    badge: "כתב חדש"
  }
];

export default function UserUploadedVideos({ onUploadClick }) {
  const [selectedVideo, setSelectedVideo] = useState(null);

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
          {mockVideos.map((video, index) => (
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
                <div className="relative h-0 pb-[56.25%] overflow-hidden bg-black">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="bg-red-600 rounded-full p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <Play className="w-8 h-8 text-white fill-white" />
                    </motion.div>
                  </div>

                  {/* Views Count */}
                  <div className="absolute bottom-2 right-2 bg-black/70 px-3 py-1 rounded-lg text-xs text-white font-bold">
                    {video.views.toLocaleString('he-IL')} צפיות
                  </div>

                  {/* Badge */}
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-lg">
                    {video.badge}
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