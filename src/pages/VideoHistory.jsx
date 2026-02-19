import React, { useState, useEffect } from "react";
import { Download, Trash2, Plus, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function VideoHistory() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // טעון את כל הסרטונים מ-localStorage
    try {
      const saved = localStorage.getItem('videoDownloadHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('📊 Loaded videos:', parsed.length);
        setVideos(parsed);
      }
    } catch (e) {
      console.error('Error loading videos:', e);
      toast.error('שגיאה בטעינת הסרטונים');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVideo = (id) => {
    const updated = videos.filter(v => v.id !== id);
    setVideos(updated);
    localStorage.setItem('videoDownloadHistory', JSON.stringify(updated));
    toast.success('הסרטון נמחק');
  };

  const clearAll = () => {
    if (window.confirm('בטוח שברצונך למחוק את כל הסרטונים?')) {
      setVideos([]);
      localStorage.removeItem('videoDownloadHistory');
      toast.success('כל הסרטונים נמחקו');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-purple-500 mx-auto mb-4"></div>
          <p>טוען סרטונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">היסטוריית סרטונים</h1>
            <p className="text-gray-400">
              {videos.length} סרטונים שנוצרו
            </p>
          </div>
          <Link to={createPageUrl("Home")}>
            <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all">
              <Home className="w-5 h-5" />
              חזרה
            </button>
          </Link>
        </div>

        {videos.length > 0 && (
          <button
            onClick={clearAll}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            מחק הכל
          </button>
        )}
      </div>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-white mb-2">אין סרטונים</h2>
          <p className="text-gray-400 mb-6">כל סרטון שתיצור יופיע כאן</p>
          <Link to={createPageUrl("VideoCreator")}>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 mx-auto transition-all">
              <Plus className="w-5 h-5" />
              צור סרטון חדש
            </button>
          </Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {videos.map((video, idx) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all"
              >
                {/* Video Preview */}
                <div className="relative aspect-video bg-black overflow-hidden group">
                  <video
                    src={video.videoUrl}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a
                      href={video.videoUrl}
                      download
                      className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full transition-all"
                    >
                      <Download className="w-6 h-6" />
                    </a>
                  </div>

                  {/* Badge */}
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1 rounded text-white text-xs font-bold">
                    #{idx + 1}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-white font-semibold truncate text-sm">
                      {video.title || 'סרטון ללא שם'}
                    </h3>
                    <p className="text-gray-500 text-xs">
                      {new Date(video.timestamp).toLocaleDateString('he-IL', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <a
                      href={video.videoUrl}
                      download
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      הורד
                    </a>
                    <button
                      onClick={() => deleteVideo(video.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      מחק
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Bottom CTA */}
      {videos.length > 0 && (
        <div className="max-w-7xl mx-auto mt-12 text-center">
          <Link to={createPageUrl("VideoCreator")}>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-bold flex items-center gap-2 mx-auto transition-all">
              <Plus className="w-5 h-5" />
              צור סרטון חדש
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}