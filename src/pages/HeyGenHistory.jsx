import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Download, Trash2, Home, Plus, Play, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";

export default function HeyGenHistory() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    // Load from localStorage
    try {
      const saved = localStorage.getItem('videoDownloadHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('📊 Loaded videos:', parsed.length);
        
        // Filter HeyGen videos only
        const heygenVideos = parsed.filter(v => v.source === 'heygen' || v.source === 'heygen');
        console.log('🎬 HeyGen videos:', heygenVideos.length);
        
        setVideos(parsed); // Show all for debugging
      }
    } catch (e) {
      console.error('Error loading history:', e);
    }
    setLoading(false);
  }, []);

  const deleteVideo = (id) => {
    setVideos(prev => {
      const updated = prev.filter(v => v.id !== id);
      localStorage.setItem('videoDownloadHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAll = () => {
    if (window.confirm('הנך בטוח? זה ימחק את כל הסרטונים')) {
      setVideos([]);
      localStorage.removeItem('videoDownloadHistory');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 sm:p-6" dir="rtl">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Video className="w-8 h-8 text-purple-500" />
            <div>
              <h1 className="text-3xl font-bold text-white">היסטוריית סרטונים</h1>
              <p className="text-gray-400 text-sm">סה"כ: {videos.length} סרטונים</p>
            </div>
          </div>
          <Link to={createPageUrl("Home")}>
            <Button variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              חזרה לדף הבית
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/60 border border-purple-500/30 rounded-lg p-4">
            <p className="text-gray-400 text-sm">כל הסרטונים</p>
            <p className="text-2xl font-bold text-purple-500">{videos.length}</p>
          </div>
          <div className="bg-black/60 border border-green-500/30 rounded-lg p-4">
            <p className="text-gray-400 text-sm">מוכנים</p>
            <p className="text-2xl font-bold text-green-500">{videos.filter(v => v.status !== 'processing').length}</p>
          </div>
          <div className="bg-black/60 border border-blue-500/30 rounded-lg p-4">
            <p className="text-gray-400 text-sm">מ-HeyGen</p>
            <p className="text-2xl font-bold text-blue-500">{videos.filter(v => v.source === 'heygen').length}</p>
          </div>
          <div className="bg-black/60 border border-orange-500/30 rounded-lg p-4">
            <p className="text-gray-400 text-sm">מ-Database</p>
            <p className="text-2xl font-bold text-orange-500">{videos.filter(v => v.source === 'database').length}</p>
          </div>
        </div>

        {/* Clear All Button */}
        {videos.length > 0 && (
          <button
            onClick={clearAll}
            className="mb-6 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4 inline mr-2" />
            מחק הכל
          </button>
        )}
      </div>

      {/* Videos Grid */}
      <div className="max-w-7xl mx-auto">
        {videos.length === 0 ? (
          <div className="text-center py-20">
            <Video className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">אין סרטונים בהיסטוריה</p>
            <Link to={createPageUrl("VideoCreator")}>
              <Button className="mt-4 bg-purple-600 hover:bg-purple-700 gap-2">
                <Plus className="w-4 h-4" />
                יצור סרטון חדש
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group bg-black/60 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all"
              >
                {/* Video Preview */}
                <div className="relative aspect-video bg-gray-900 cursor-pointer">
                  <video 
                    src={video.videoUrl}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Badge */}
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1 rounded text-white text-xs font-bold">
                    {video.source === 'heygen' ? 'HeyGen' : 'DB'}
                  </div>

                  {/* Status */}
                  <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-gray-300 text-xs">
                    {video.status === 'processing' ? '⏳ מעבד' : '✅ מוכן'}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 space-y-3">
                  <div>
                    <p className="text-white font-medium text-sm truncate">{video.title}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(video.timestamp).toLocaleDateString('he-IL')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <a
                      href={video.videoUrl}
                      download
                      className="flex-1 bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 text-green-400 px-2 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      <Download className="w-3 h-3" />
                      <span className="hidden sm:inline">הורד</span>
                    </a>
                    <button
                      onClick={() => setSelectedVideo(video)}
                      className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 px-2 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      <Play className="w-3 h-3" />
                      <span className="hidden sm:inline">הצג</span>
                    </button>
                    <button
                      onClick={() => deleteVideo(video.id)}
                      className="bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 px-2 py-1.5 rounded text-xs font-bold transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-4xl bg-black rounded-xl overflow-hidden border border-purple-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src={selectedVideo.videoUrl}
                controls
                autoPlay
                className="w-full aspect-video bg-black"
              />
              <div className="p-4 border-t border-gray-800">
                <p className="text-white font-bold mb-2">{selectedVideo.title}</p>
                <p className="text-gray-400 text-sm mb-4">
                  {new Date(selectedVideo.timestamp).toLocaleString('he-IL')}
                </p>
                <div className="flex gap-2">
                  <a
                    href={selectedVideo.videoUrl}
                    download
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    הורד סרטון
                  </a>
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-bold transition-all"
                  >
                    סגור
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}