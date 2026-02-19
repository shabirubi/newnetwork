import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Video, Home, Download, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function HeyGenGallery() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('listHeyGenVideos', {});
      console.log('📦 HeyGen Videos:', data);
      setVideos(data.videos || []);
      toast.success(`נמצאו ${data.total} סרטונים`);
    } catch (err) {
      console.error('❌ Error:', err);
      toast.error('שגיאה בטעינת סרטונים: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900" dir="rtl">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-xl border-b border-gray-800 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Video className="w-6 h-6 text-purple-500" />
          <div>
            <h1 className="text-xl font-bold text-white">גלריית HeyGen</h1>
            <p className="text-gray-500 text-sm">כל הסרטונים שנוצרו</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadVideos} variant="outline" size="sm" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'רענן'}
          </Button>
          <Link to={createPageUrl("Home")}>
            <Button variant="outline" size="sm">
              <Home className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-16 h-16 text-purple-500 animate-spin mb-4" />
            <p className="text-gray-400 text-lg">טוען סרטונים מ-HeyGen...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Video className="w-24 h-24 text-gray-700 mb-4" />
            <p className="text-gray-500 text-xl">לא נמצאו סרטונים</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {videos.length} סרטונים נמצאו
              </h2>
              <p className="text-gray-400">כל הסרטונים שנוצרו בחשבון HeyGen שלך</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, idx) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-black">
                    {video.thumbnail_url ? (
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-16 h-16 text-gray-700" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold ${
                      video.status === 'completed' 
                        ? 'bg-green-600 text-white' 
                        : video.status === 'processing'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-600 text-white'
                    }`}>
                      {video.status === 'completed' ? '✅ מוכן' : 
                       video.status === 'processing' ? '⏳ מעבד' : 
                       video.status}
                    </div>

                    {/* Play Button */}
                    {video.video_url && (
                      <button
                        onClick={() => setSelectedVideo(video)}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Play className="w-16 h-16 text-white" />
                      </button>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                      {video.title || `Video ${video.id.substring(0, 8)}`}
                    </h3>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                      <span>#{idx + 1}</span>
                      {video.duration && <span>{video.duration}s</span>}
                      {video.created_at && (
                        <span>{new Date(video.created_at).toLocaleDateString('he-IL')}</span>
                      )}
                    </div>

                    {/* Actions */}
                    {video.video_url && (
                      <div className="flex gap-2">
                        <a
                          href={video.video_url}
                          download
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <Download className="w-4 h-4" />
                          הורד
                        </a>
                        <button
                          onClick={() => setSelectedVideo(video)}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition-all"
                        >
                          צפה
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 rounded-2xl overflow-hidden border-2 border-purple-500 max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">
                {selectedVideo.title || 'Video'}
              </h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <video 
              src={selectedVideo.video_url} 
              controls 
              autoPlay
              className="w-full aspect-video bg-black"
            />
            <div className="p-4 bg-black/40">
              <a
                href={selectedVideo.video_url}
                download
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-5 h-5" />
                הורד סרטון
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}