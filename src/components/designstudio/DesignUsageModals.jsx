import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

// Save Design Modal
export function SaveDesignModal({ isOpen, onClose, imageUrl, prompt }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("אנא הזן כותרת");
      return;
    }

    setIsSaving(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.SavedDesign.create({
        title,
        description,
        imageUrl,
        prompt,
        category: "other",
        userEmail: user.email,
        tags: [],
      });
      toast.success("✅ הדיזיין נשמר בהצלחה");
      setTitle("");
      setDescription("");
      onClose();
    } catch (error) {
      toast.error("שגיאה בשמירת הדיזיין");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">💾 שמור דיזיין</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  כותרת
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="לדוגמה: כרזה אריה זהוב"
                  className="bg-black/60 border-purple-500/30"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  תיאור (אופציונלי)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="תיאור קצר..."
                  className="w-full bg-black/60 border border-purple-500/30 text-white rounded-lg p-2 text-sm resize-none h-20"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isSaving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    שומר...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    שמור לספריה
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Add to Video Modal
export function AddToVideoModal({ isOpen, onClose, imageUrl }) {
  const [videos, setVideos] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedVideo, setSelectedVideo] = React.useState(null);
  const [isAdding, setIsAdding] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      loadVideos();
    }
  }, [isOpen]);

  const loadVideos = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.UserVideo.filter({ status: "ready" }, "-created_date", 50);
      setVideos(data);
    } catch (error) {
      toast.error("שגיאה בטעינת הוידאוים");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToVideo = async () => {
    if (!selectedVideo) {
      toast.error("אנא בחר וידאו");
      return;
    }

    setIsAdding(true);
    try {
      await base44.entities.UserVideo.update(selectedVideo, {
        overlay_image: imageUrl,
        overlay_enabled: true,
      });
      toast.success("✅ הדיזיין הוכנס לוידאו בהצלחה");
      onClose();
    } catch (error) {
      toast.error("שגיאה בהוספת הדיזיין");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-blue-900/40 to-black border border-blue-500/30 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-black/50 -m-6 mb-4 p-6">
              <h3 className="text-xl font-bold text-white">🎬 הכנס לוידאו</h3>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <Loader className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
              </div>
            ) : videos.length === 0 ? (
              <p className="text-gray-400 text-center py-8">אין וידאוים זמינים</p>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {videos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => setSelectedVideo(video.id)}
                      className={`w-full p-3 rounded-lg text-left border-2 transition-all ${
                        selectedVideo === video.id
                          ? "border-blue-400 bg-blue-500/20"
                          : "border-blue-500/20 bg-black/40 hover:border-blue-500/50"
                      }`}
                    >
                      <p className="font-semibold text-white text-sm">{video.title}</p>
                      <p className="text-gray-400 text-xs">{video.duration || "N/A"}</p>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleAddToVideo}
                  disabled={isAdding || !selectedVideo}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isAdding ? "מוסיף..." : "הכנס לוידאו"}
                </Button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Add to Article Modal
export function AddToArticleModal({ isOpen, onClose, imageUrl }) {
  const [articles, setArticles] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedArticle, setSelectedArticle] = React.useState(null);
  const [isAdding, setIsAdding] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      loadArticles();
    }
  }, [isOpen]);

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.NewsArticle.list("-created_date", 50);
      setArticles(data);
    } catch (error) {
      toast.error("שגיאה בטעינת הכתבות");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToArticle = async () => {
    if (!selectedArticle) {
      toast.error("אנא בחר כתבה");
      return;
    }

    setIsAdding(true);
    try {
      const article = articles.find((a) => a.id === selectedArticle);
      const currentImages = article.featured_images || [];
      await base44.entities.NewsArticle.update(selectedArticle, {
        featured_images: [...currentImages, imageUrl],
      });
      toast.success("✅ הדיזיין הוכנס לכתבה בהצלחה");
      onClose();
    } catch (error) {
      toast.error("שגיאה בהוספת הדיזיין");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-cyan-900/40 to-black border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-black/50 -m-6 mb-4 p-6">
              <h3 className="text-xl font-bold text-white">📝 הכנס לכתבה</h3>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <Loader className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
              </div>
            ) : articles.length === 0 ? (
              <p className="text-gray-400 text-center py-8">אין כתבות זמינות</p>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {articles.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => setSelectedArticle(article.id)}
                      className={`w-full p-3 rounded-lg text-left border-2 transition-all ${
                        selectedArticle === article.id
                          ? "border-cyan-400 bg-cyan-500/20"
                          : "border-cyan-500/20 bg-black/40 hover:border-cyan-500/50"
                      }`}
                    >
                      <p className="font-semibold text-white text-sm line-clamp-1">
                        {article.title}
                      </p>
                      <p className="text-gray-400 text-xs">{article.category}</p>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleAddToArticle}
                  disabled={isAdding || !selectedArticle}
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                >
                  {isAdding ? "מוסיף..." : "הכנס לכתבה"}
                </Button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Add to Broadcast Modal
export function AddToBroadcastModal({ isOpen, onClose, imageUrl }) {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleAddToBroadcast = async () => {
    setIsSaving(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.SavedDesign.create({
        title: "Broadcast Overlay",
        description: "שידור חי - overlay",
        imageUrl,
        prompt: "Broadcast overlay",
        category: "broadcast",
        userEmail: user.email,
        tags: ["broadcast"],
      });
      toast.success("✅ הדיזיין הוכנס לשידור בהצלחה");
      onClose();
    } catch (error) {
      toast.error("שגיאה בהוספת הדיזיין לשידור");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-red-900/40 to-black border border-red-500/30 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">📡 שדר בשידור חי</h3>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="bg-black/60 p-4 rounded-lg mb-4 border border-red-500/20">
              <p className="text-sm text-gray-300 mb-3">
                הדיזיין יוסף כ-overlay לשידור החי ויהיה זמין בעת ההשידור.
              </p>
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-24 object-cover rounded-lg border border-red-500/30"
              />
            </div>

            <Button
              onClick={handleAddToBroadcast}
              disabled={isSaving}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isSaving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  מוסיף...
                </>
              ) : (
                "הוסף לשידור"
              )}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}