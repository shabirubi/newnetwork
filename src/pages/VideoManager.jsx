import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit2, Trash2, Eye, ThumbsUp, Share2, MoreVertical, 
  Search, Filter, ChevronLeft, X, Save, Home, TrendingUp,
  Play, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function VideoManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const queryClient = useQueryClient();

  // Fetch user's videos
  const { data: userVideos = [], isLoading } = useQuery({
    queryKey: ['user-videos'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return [];
      return base44.entities.UserVideo.filter({ uploader_email: user.email }, '-created_date', 100);
    },
    initialData: []
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (videoId) => base44.entities.UserVideo.delete(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-videos'] });
      toast.success("וידאו נמחק בהצלחה");
      setSelectedVideo(null);
    },
    onError: () => toast.error("שגיאה במחיקה")
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ videoId, data }) => base44.entities.UserVideo.update(videoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-videos'] });
      toast.success("וידאו עודכן בהצלחה");
      setEditingVideo(null);
    },
    onError: () => toast.error("שגיאה בעדכון")
  });

  const handleStartEdit = (video) => {
    setEditingVideo(video.id);
    setEditTitle(video.title);
    setEditDescription(video.description || "");
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      toast.error("כותרת חובה");
      return;
    }
    updateMutation.mutate({
      videoId: editingVideo,
      data: { title: editTitle, description: editDescription }
    });
  };

  const filteredVideos = userVideos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || video.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" dir="rtl">
      {/* Header */}
      <div className="bg-black/60 backdrop-blur-lg border-b border-blue-500/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={createPageUrl("Home")}>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">ניהול וידאוים</h1>
                  <p className="text-xs text-blue-300">עריכה, מחיקה וסטטיסטיקות</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-lg rounded-xl border border-blue-500/20 p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 w-4 h-4 text-blue-400" />
              <input
                type="text"
                placeholder="חפש וידאו..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/30 border border-blue-500/20 rounded-lg px-4 py-2 pr-10 text-white text-sm placeholder-blue-300/30 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              {["all", "ready", "processing", "failed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === status
                      ? "bg-blue-600 text-white"
                      : "bg-black/30 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20"
                  }`}
                >
                  {status === "all" ? "הכל" : status === "ready" ? "מוכן" : status === "processing" ? "בעיבוד" : "שגיאה"}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Videos Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin mx-auto mb-4"></div>
            <p className="text-blue-300">טוען וידאוים...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-lg rounded-xl border border-blue-500/20 p-12 text-center"
          >
            <Play className="w-12 h-12 text-blue-400/50 mx-auto mb-3" />
            <p className="text-blue-300 text-sm">אין וידאוים עדיין</p>
            <p className="text-blue-300/50 text-xs mt-1">כשתעלה וידאו הוא יופיע כאן</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-black/40 backdrop-blur-lg rounded-lg border border-blue-500/20 overflow-hidden hover:border-blue-500/50 transition-all cursor-pointer group"
                  onClick={() => setSelectedVideo(video)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-black overflow-hidden">
                    {video.thumbnail_url ? (
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600/20 to-purple-600/20">
                        <Play className="w-12 h-12 text-blue-400/30" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        video.status === "ready" ? "bg-green-500/80 text-white" :
                        video.status === "processing" ? "bg-yellow-500/80 text-white" :
                        video.status === "uploading" ? "bg-blue-500/80 text-white" :
                        "bg-red-500/80 text-white"
                      }`}>
                        {video.status === "ready" ? "מוכן" : video.status === "processing" ? "בעיבוד" : video.status === "uploading" ? "בהעלאה" : "שגיאה"}
                      </span>
                    </div>

                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-12 h-12 text-white fill-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">{video.title}</h3>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-blue-300/70 mb-3">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{video.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{video.likes || 0}</span>
                      </div>
                      {video.duration && (
                        <span>{Math.round(video.duration / 60)}:{String(Math.round(video.duration % 60)).padStart(2, '0')}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(video);
                        }}
                        className="flex-1 px-2 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 rounded text-xs font-semibold text-blue-300 transition-all"
                      >
                        <Edit2 className="w-3 h-3 inline mr-1" />
                        עריכה
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("בטוח שרוצה למחוק?")) {
                            deleteMutation.mutate(video.id);
                          }
                        }}
                        className="px-2 py-1.5 bg-red-600/30 hover:bg-red-600/50 border border-red-500/30 rounded text-xs font-semibold text-red-300 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Video Detail Modal */}
      <AnimatePresence>
        {selectedVideo && !editingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black/80 backdrop-blur-lg rounded-xl border border-blue-500/20 w-full max-w-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-600/20 to-blue-800/20 px-6 py-4 border-b border-blue-500/20">
                <h2 className="text-white font-bold">פרטי וידאו</h2>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Video Player */}
                <video
                  src={selectedVideo.video_url}
                  controls
                  className="w-full aspect-video rounded-lg bg-black"
                />

                {/* Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-blue-300 text-xs font-semibold mb-1">כותרת</p>
                    <p className="text-white text-sm">{selectedVideo.title}</p>
                  </div>

                  {selectedVideo.description && (
                    <div>
                      <p className="text-blue-300 text-xs font-semibold mb-1">תיאור</p>
                      <p className="text-white/80 text-sm">{selectedVideo.description}</p>
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 bg-black/40 rounded-lg p-3">
                    <div className="text-center">
                      <Eye className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                      <p className="text-white font-bold">{selectedVideo.views || 0}</p>
                      <p className="text-blue-300 text-xs">צפיות</p>
                    </div>
                    <div className="text-center">
                      <ThumbsUp className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                      <p className="text-white font-bold">{selectedVideo.likes || 0}</p>
                      <p className="text-blue-300 text-xs">לייקים</p>
                    </div>
                    <div className="text-center">
                      <Settings className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                      <p className="text-white font-bold text-sm">{selectedVideo.status}</p>
                      <p className="text-blue-300 text-xs">סטטוס</p>
                    </div>
                  </div>

                  {/* File Info */}
                  {selectedVideo.file_size && (
                    <div className="text-xs text-blue-300/70 bg-black/40 rounded p-2">
                      <p>גודל: {(selectedVideo.file_size / 1024).toFixed(2)} MB</p>
                      {selectedVideo.duration && (
                        <p>משך: {Math.round(selectedVideo.duration / 60)}:{String(Math.round(selectedVideo.duration % 60)).padStart(2, '0')}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-2 bg-black/40 px-6 py-4 border-t border-blue-500/20">
                <button
                  onClick={() => {
                    handleStartEdit(selectedVideo);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  עריכה
                </button>
                <button
                  onClick={() => {
                    if (confirm("בטוח שרוצה למחוק?")) {
                      deleteMutation.mutate(selectedVideo.id);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  מחיקה
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
            onClick={() => setEditingVideo(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black/80 backdrop-blur-lg rounded-xl border border-blue-500/20 w-full max-w-md"
            >
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-600/20 to-blue-800/20 px-6 py-4 border-b border-blue-500/20">
                <h2 className="text-white font-bold">עריכת וידאו</h2>
                <button
                  onClick={() => setEditingVideo(null)}
                  className="p-2 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-blue-300 text-xs font-semibold block mb-2">כותרת</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-black/30 border border-blue-500/20 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                    dir="rtl"
                  />
                </div>

                <div>
                  <label className="text-blue-300 text-xs font-semibold block mb-2">תיאור (אופציונלי)</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full bg-black/30 border border-blue-500/20 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none h-24 resize-none"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="flex gap-2 px-6 py-4 border-t border-blue-500/20">
                <button
                  onClick={() => setEditingVideo(null)}
                  className="flex-1 px-4 py-2 bg-black/50 border border-blue-500/20 text-white rounded-lg text-sm font-semibold hover:bg-black/70 transition-all"
                >
                  ביטול
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {updateMutation.isPending ? "שומר..." : "שמור"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}