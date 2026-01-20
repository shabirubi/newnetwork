import React from "react";
import { motion } from "framer-motion";
import { Music, Heart, MessageCircle, Share2 } from "lucide-react";

export default function TikTokNewsContainer() {
  const tiktokVideos = [
    {
      id: 1,
      title: "חדשות עכשיו - ביטחון",
      username: "@hareshet_live",
      views: "234K",
      likes: "12K",
      comments: "2K",
      image: "https://images.unsplash.com/photo-1611339555312-e607c90352fd?w=500&h=800&fit=crop"
    },
    {
      id: 2,
      title: "כלכלה - אפדייט חם",
      username: "@hareshet_economy",
      views: "567K",
      likes: "45K",
      comments: "8K",
      image: "https://images.unsplash.com/photo-1579621970563-430f63602022?w=500&h=800&fit=crop"
    },
    {
      id: 3,
      title: "ספורט - התוקפת השעה",
      username: "@hareshet_sports",
      views: "892K",
      likes: "78K",
      comments: "12K",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=800&fit=crop"
    },
    {
      id: 4,
      title: "טכנולוגיה - חידוש פורץ",
      username: "@hareshet_tech",
      views: "456K",
      likes: "34K",
      comments: "6K",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=800&fit=crop"
    }
  ];

  return (
    <section className="px-4 sm:px-4 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Music className="w-6 h-6 text-[#E31E24]" />
          <h2 className="text-2xl font-bold dark:text-white">סרטוני חדשות בטיקטוק</h2>
        </div>
        <a
          href="https://www.tiktok.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#E31E24] hover:text-red-700 font-bold text-sm transition-colors"
        >
          עיין הכל →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiktokVideos.map((video, idx) => (
          <motion.a
            key={video.id}
            href="https://www.tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="group relative rounded-2xl overflow-hidden aspect-[9/16] bg-black cursor-pointer border-2 border-[#E31E24]/40 hover:border-[#E31E24]/80 transition-all"
            style={{
              boxShadow: '0 0 20px rgba(227, 30, 36, 0.3), inset 0 0 20px rgba(227, 30, 36, 0.1)'
            }}
          >
            {/* Video Thumbnail */}
            <img
              src={video.image}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Title */}
              <div>
                <h3 className="text-white font-bold text-sm line-clamp-2 mb-2">
                  {video.title}
                </h3>
                <p className="text-white/80 text-xs font-medium">{video.username}</p>
              </div>

              {/* Stats */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/90 text-xs">
                  <span className="font-bold">{video.views}</span>
                  <span>צפיות</span>
                </div>
                <div className="flex items-center gap-4 text-white/80">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-current" />
                    <span className="text-xs">{video.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">{video.comments}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Play Icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Music className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}