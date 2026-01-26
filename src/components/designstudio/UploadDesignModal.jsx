import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader, Film, Newspaper, Grid3X3, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export function UploadDesignModal({ isOpen, onClose, imageUrl, designTitle = "Design" }) {
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [videoId, setVideoId] = useState("");
  const [articleId, setArticleId] = useState("");
  const [category, setCategory] = useState("breaking");
  const [isUploading, setIsUploading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [articles, setArticles] = useState([]);
  const [showVideos, setShowVideos] = useState(false);
  const [showArticles, setShowArticles] = useState(false);

  const categories = [
    "breaking", "security", "economy", "politics", "technology", 
    "sports", "entertainment", "world", "health", "music"
  ];

  // Fetch videos when component opens
  React.useEffect(() => {
    if (isOpen && !videos.length) {
      fetchVideos();
      fetchArticles();
    }
  }, [isOpen]);

  const fetchVideos = async () => {
    try {
      const data = await base44.entities.UserVideo.list('-created_date', 50);
      setVideos(data);
    } catch {
      toast.error("שגיאה בטעינת הוידאוים");
    }
  };

  const fetchArticles = async () => {
    try {
      const data = await base44.entities.NewsArticle.list('-created_date', 50);
      setArticles(data);
    } catch {
      toast.error("שגיאה בטעינת הכתבות");
    }
  };

  const handleUploadToVideo = async () => {
    if (!videoId) {
      toast.error("בחר וידאו");
      return;
    }

    setIsUploading(true);
    try {
      const video = videos.find(v => v.id === videoId);
      // Update video with design overlay metadata
      await base44.entities.UserVideo.update(videoId, {
        design_overlay: imageUrl,
        design_title: designTitle,
      });
      toast.success(`✅ הדיזיין נוסף לוידאו: ${video.title}`);
      onClose();
    } catch {
      toast.error("שגיאה בהוספת הדיזיין");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadToArticle = async () => {
    if (!articleId) {
      toast.error("בחר כתבה");
      return;
    }

    setIsUploading(true);
    try {
      const article = articles.find(a => a.id === articleId);
      // Update article with design image
      await base44.entities.NewsArticle.update(articleId, {
        featured_design: imageUrl,
        design_title: designTitle,
      });
      toast.success(`✅ הדיזיין נוסף לכתבה: ${article.title}`);
      onClose();
    } catch {
      toast.error("שגיאה בהוספת הדיזיין");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateFeed = async () => {
    if (!category) {
      toast.error("בחר קטגוריה");
      return;
    }

    setIsUploading(true);
    try {
      // Create new article with design
      const newArticle = await base44.entities.NewsArticle.create({
        title: designTitle,
        category,
        image_url: imageUrl,
        content: `דיזיין: ${designTitle}`,
        is_featured: true,
      });
      toast.success(`✅ דיזיין הוצג בקטגוריה: ${category}`);
      onClose();
    } catch {
      toast.error("שגיאה ביצירת הפיד");
    } finally {
      setIsUploading(false);
    }
  };

  const containerOptions = [
    {
      id: "video",
      icon: Film,
      label: "הוסף לוידאו",
      desc: "כ-overlay על וידאו קיים",
      color: "from-blue-600 to-blue-700",
      action: () => setSelectedContainer("video"),
    },
    {
      id: "article",
      icon: Newspaper,
      label: "הוסף לכתבה",
      desc: "תמונת עטיפה בכתבה",
      color: "from-cyan-600 to-cyan-700",
      action: () => setSelectedContainer("article"),
    },
    {
      id: "category",
      icon: Flame,
      label: "הפץ בקטגוריה",
      desc: "הצג בפיד קטגוריה",
      color: "from-red-600 to-red-700",
      action: () => setSelectedContainer("category"),
    },
  ];

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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Upload className="w-6 h-6 text-purple-400" />
                הוסף לקונטיינר
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {!selectedContainer ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {containerOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={option.action}
                      className={`bg-gradient-to-br ${option.color} p-6 rounded-xl text-white hover:shadow-lg transition-all text-center group`}
                    >
                      <Icon className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <h4 className="font-bold mb-1">{option.label}</h4>
                      <p className="text-xs text-white/80">{option.desc}</p>
                    </motion.button>
                  );
                })}
              </div>
            ) : null}

            {selectedContainer === "video" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <button
                  onClick={() => setSelectedContainer(null)}
                  className="text-sm text-gray-400 hover:text-white mb-4"
                >
                  ← חזור
                </button>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    בחר וידאו
                  </label>
                  <button
                    onClick={() => setShowVideos(!showVideos)}
                    className="w-full bg-black/60 border border-purple-500/30 text-white rounded-lg p-2 text-left flex justify-between items-center"
                  >
                    <span>{videoId ? videos.find(v => v.id === videoId)?.title : "בחר וידאו..."}</span>
                    <Upload className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {showVideos && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 bg-black/60 border border-purple-500/30 rounded-lg max-h-64 overflow-y-auto"
                      >
                        {videos.map((video) => (
                          <button
                            key={video.id}
                            onClick={() => {
                              setVideoId(video.id);
                              setShowVideos(false);
                            }}
                            className="w-full p-3 text-left hover:bg-purple-600/20 border-b border-purple-500/10 text-white text-sm"
                          >
                            {video.title}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  onClick={handleUploadToVideo}
                  disabled={isUploading || !videoId}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      מעדכן...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      הוסף לוידאו
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {selectedContainer === "article" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <button
                  onClick={() => setSelectedContainer(null)}
                  className="text-sm text-gray-400 hover:text-white mb-4"
                >
                  ← חזור
                </button>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    בחר כתבה
                  </label>
                  <button
                    onClick={() => setShowArticles(!showArticles)}
                    className="w-full bg-black/60 border border-purple-500/30 text-white rounded-lg p-2 text-left flex justify-between items-center"
                  >
                    <span>{articleId ? articles.find(a => a.id === articleId)?.title : "בחר כתבה..."}</span>
                    <Upload className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {showArticles && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 bg-black/60 border border-purple-500/30 rounded-lg max-h-64 overflow-y-auto"
                      >
                        {articles.map((article) => (
                          <button
                            key={article.id}
                            onClick={() => {
                              setArticleId(article.id);
                              setShowArticles(false);
                            }}
                            className="w-full p-3 text-left hover:bg-purple-600/20 border-b border-purple-500/10 text-white text-sm"
                          >
                            {article.title}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  onClick={handleUploadToArticle}
                  disabled={isUploading || !articleId}
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      מעדכן...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      הוסף לכתבה
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {selectedContainer === "category" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <button
                  onClick={() => setSelectedContainer(null)}
                  className="text-sm text-gray-400 hover:text-white mb-4"
                >
                  ← חזור
                </button>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    בחר קטגוריה
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black/60 border border-purple-500/30 text-white rounded-lg p-2"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleCreateFeed}
                  disabled={isUploading}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      יוצר...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      הפץ בקטגוריה
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}