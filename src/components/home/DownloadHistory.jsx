import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Trash2, RotateCcw, X, Calendar, Clock, FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DownloadHistory({ isOpen, onClose }) {
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('videoDownloadHistory');
    if (saved) {
      setDownloads(JSON.parse(saved));
    }
  }, [isOpen]);

  const saveDownload = (video) => {
    const newDownload = {
      id: Math.random(),
      title: video.title || "סרטון ללא שם",
      videoUrl: video.videoUrl,
      timestamp: new Date().toISOString(),
      scriptPreview: video.script?.substring(0, 50) + "..."
    };
    
    const updated = [newDownload, ...downloads].slice(0, 20); // שמור 20 אחרונים
    setDownloads(updated);
    localStorage.setItem('videoDownloadHistory', JSON.stringify(updated));
  };

  const deleteDownload = (id) => {
    const updated = downloads.filter(d => d.id !== id);
    setDownloads(updated);
    localStorage.setItem('videoDownloadHistory', JSON.stringify(updated));
  };

  const redownload = (videoUrl) => {
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border border-purple-500/30 p-6 max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">היסטוריית הורדות</h2>
                  <p className="text-gray-400 text-sm">{downloads.length} סרטונים</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Downloads List */}
            {downloads.length === 0 ? (
              <div className="text-center py-12">
                <FileVideo className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">אין היסטוריית הורדות עדיין</p>
              </div>
            ) : (
              <div className="space-y-2">
                {downloads.map((download) => (
                  <motion.div
                   key={download.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="bg-black/40 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all group overflow-hidden"
                  >
                   {/* Video Preview */}
                   {download.videoUrl && (
                     <div className="relative w-full aspect-video bg-gray-900">
                       <video 
                         src={download.videoUrl} 
                         controls 
                         className="w-full h-full"
                         playsInline
                       />
                     </div>
                   )}

                   {/* Info Section */}
                   <div className="p-4">
                     <div className="flex items-start justify-between">
                       <div className="flex-1">
                         <h3 className="text-white font-bold text-sm">{download.title}</h3>
                         <p className="text-gray-400 text-xs mt-1">{download.scriptPreview}</p>
                         <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                           <span className="flex items-center gap-1">
                             <Calendar className="w-3 h-3" />
                             {new Date(download.timestamp).toLocaleDateString('he-IL')}
                           </span>
                           <span className="flex items-center gap-1">
                             <Clock className="w-3 h-3" />
                             {new Date(download.timestamp).toLocaleTimeString('he-IL')}
                           </span>
                         </div>
                       </div>
                       <div className="flex gap-2">
                         <button
                           onClick={() => redownload(download.videoUrl)}
                           className="p-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg transition-all"
                           title="הורד שוב"
                         >
                           <Download className="w-4 h-4" />
                         </button>
                         <button
                           onClick={() => deleteDownload(download.id)}
                           className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-all"
                           title="מחק"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     </div>
                   </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}