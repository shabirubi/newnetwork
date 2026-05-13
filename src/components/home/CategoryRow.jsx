import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Clock, Play, Upload } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function CategoryRow({ category, title, icon: Icon, onUploadClick }) {
  const { data: articles = [] } = useQuery({
    queryKey: ['cat-articles', category],
    queryFn: async () => {
      const all = await base44.entities.NewsArticle.list('-created_date', 100);
      return all.filter(a => a.category === category).slice(0, 8);
    },
    initialData: [],
    staleTime: 60 * 1000
  });

  const { data: videos = [] } = useQuery({
    queryKey: ['cat-videos', category],
    queryFn: async () => {
      const all = await base44.entities.UserVideo.list('-created_date', 50);
      return all.filter(v => v.category === category && v.status === 'ready').slice(0, 6);
    },
    initialData: [],
    staleTime: 30 * 1000
  });

  const hasContent = articles.length > 0 || videos.length > 0;
  if (!hasContent) return null;

  return (
    <section className="w-full px-2 sm:px-4 mb-6" dir="rtl">
      <div className="max-w-7xl mx-auto bg-[#0d0d0d] rounded-xl overflow-hidden border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#0057B8]/20 rounded-lg">
              <Icon className="w-5 h-5 text-[#0057B8]" />
            </div>
            <h3 className="font-bold text-white text-base sm:text-lg">{title}</h3>
            {articles.length > 0 && (
              <span className="text-xs text-gray-500">{articles.length} כתבות</span>
            )}
            {videos.length > 0 && (
              <span className="text-xs text-[#0057B8]">· {videos.length} סרטונים</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onUploadClick}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-[#0057B8]/20 hover:bg-[#0057B8]/40 text-[#0057B8] rounded-lg transition-colors border border-[#0057B8]/30"
            >
              <Upload className="w-3 h-3" />
              העלה סרטון
            </button>
            <Link to={createPageUrl(`Category?cat=${category}`)}>
              <span className="text-xs text-gray-400 hover:text-white transition-colors">כל החדשות →</span>
            </Link>
          </div>
        </div>

        {/* Horizontal scroll of articles + videos */}
        <div className="flex gap-3 overflow-x-auto p-3 scrollbar-hide">
          {/* Articles */}
          {articles.map((article) => (
            <Link key={article.id} to={`/Article?id=${article.id}`} className="flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="w-48 sm:w-56 bg-[#111] rounded-xl overflow-hidden border border-gray-800 hover:border-[#0057B8]/50 transition-all cursor-pointer"
              >
                <div className="relative h-28 overflow-hidden">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  {article.is_breaking && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse">חם</span>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-white text-xs font-bold line-clamp-2 leading-snug mb-1">{article.title}</p>
                  <div className="flex items-center gap-1 text-gray-500 text-[10px]">
                    <Clock className="w-3 h-3" />
                    {new Date(article.created_date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}

          {/* Videos */}
          {videos.map((video) => (
            <motion.div
              key={video.id}
              whileHover={{ scale: 1.02 }}
              className="flex-shrink-0 w-48 sm:w-56 bg-[#111] rounded-xl overflow-hidden border border-[#0057B8]/30 hover:border-[#0057B8] transition-all cursor-pointer"
              onClick={() => window.dispatchEvent(new CustomEvent('playVideo', { detail: { url: video.video_url, title: video.title } }))}
            >
              <div className="relative h-28 overflow-hidden bg-gray-900">
                {video.thumbnail_url && video.thumbnail_url !== video.video_url ? (
                  <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#0057B8]/10">
                    <Play className="w-10 h-10 text-[#0057B8]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="bg-[#0057B8] rounded-full p-2">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
                <span className="absolute top-2 left-2 bg-[#0057B8] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">וידאו</span>
              </div>
              <div className="p-2">
                <p className="text-white text-xs font-bold line-clamp-2 leading-snug mb-1">{video.title}</p>
                <div className="flex items-center gap-1 text-gray-500 text-[10px]">
                  <Clock className="w-3 h-3" />
                  {new Date(video.created_date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}