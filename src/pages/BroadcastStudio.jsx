import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, Upload, Loader, FileVideo, Image, Type, 
  Sparkles, Zap, Download, ChevronLeft, Eye, Settings, 
  Volume2, User, Users, Video, Play, Search, Filter, Edit2, Trash2, ThumbsUp, Save, X, Globe
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import VideoUploadConfirmation from "../components/broadcast/VideoUploadConfirmation";
import HistoricalSourceSelector from "../components/broadcast/HistoricalSourceSelector";
import ArticleEditor from "../components/broadcast/ArticleEditor";
import StudioTabs from "../components/broadcast/StudioTabs";

export default function BroadcastStudio() {
  // Tab Selection
  const [tab, setTab] = useState("create"); // create | manage
  
  // Mode Selection
  const [mode, setMode] = useState("talks"); // talks | clips | express
  const [inputType, setInputType] = useState("text"); // text | audio

  // Common States
  const [articleText, setArticleText] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [sceneBackground, setSceneBackground] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState("he-IL-AvriNeural");

  // Historical Sources
  const [historicalArticles, setHistoricalArticles] = useState([]);
  const [selectedHistoricalArticle, setSelectedHistoricalArticle] = useState(null);

  // Google Search
  const [googleSearchQuery, setGoogleSearchQuery] = useState("");
  const [googleSearchResults, setGoogleSearchResults] = useState([]);
  const [searchingGoogle, setSearchingGoogle] = useState(false);
  const [selectedGoogleArticle, setSelectedGoogleArticle] = useState(null);
  const [editingGoogleArticle, setEditingGoogleArticle] = useState(null);
  const [articleEditorOpen, setArticleEditorOpen] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState(null);

  // Talks Mode (V2 - Head Only)
  const [avatarImage, setAvatarImage] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const bgInputRef = useRef(null);

  // Clips Mode - Load reporters
  const [selectedPresenter, setSelectedPresenter] = useState(null);
  const { data: reporters = [] } = useQuery({
    queryKey: ['reporters-for-studio'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return [];
        return base44.entities.Reporter.filter({ is_active: true }, 'name');
      } catch {
        return [];
      }
    },
    initialData: []
  });

  // Manage Tab States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const queryClient = useQueryClient();

  // Fetch user's videos
  const { data: userVideos = [], isLoading: videosLoading } = useQuery({
    queryKey: ['user-videos-manage'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return [];
      return base44.entities.UserVideo.filter({ uploader_email: user.email }, '-created_date', 100);
    },
    initialData: [],
    enabled: tab === "manage"
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (videoId) => base44.entities.UserVideo.delete(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-videos-manage'] });
      toast.success("וידאו נמחק בהצלחה");
      setSelectedVideo(null);
    },
    onError: () => toast.error("שגיאה במחיקה")
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ videoId, data }) => base44.entities.UserVideo.update(videoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-videos-manage'] });
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

  // Express Mode (V3 Instant - Custom Full Body)
  const [trainingVideo, setTrainingVideo] = useState(null);
  const [customAvatarId, setCustomAvatarId] = useState(null);
  const trainingVideoRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = response.file_url;
      const cleanUrl = fileUrl.includes('?') ? fileUrl.split('?')[0] : fileUrl;
      setAvatarImage(cleanUrl);
      toast.success("תמונה הועלתה ✓");
    } catch (error) {
      toast.error("שגיאה בהעלאת תמונה");
    }
  };

  const handleTrainingVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = response.file_url;
      const cleanUrl = fileUrl.includes('?') ? fileUrl.split('?')[0] : fileUrl;
      setTrainingVideo(cleanUrl);
      toast.success("וידאו אימון הועלה ✓");
    } catch (error) {
      toast.error("שגיאה בהעלאת וידאו");
    }
  };

  const handleGenerateVideo = async () => {
    if (!articleText.trim()) {
      toast.error("אנא כתוב טקסט");
      return;
    }

    if (mode === "talks" && !avatarImage) {
      toast.error("אנא העלה תמונה");
      return;
    }

    if (mode === "clips" && !selectedPresenter) {
      toast.error("אנא בחר שדרן");
      return;
    }

    if (mode === "express" && !customAvatarId) {
      toast.error("אנא צור אווטר מותאם");
      return;
    }

    setLoading(true);
    toast.loading("יוצר וידאו... ⏳", { id: "video-gen" });

    try {
       let response;

       if (mode === "talks") {
         // V2 Talks API - Head only
         response = await base44.functions.invoke("generateTalkingVideo", {
           text: inputType === "text" ? articleText : undefined,
           audioUrl: inputType === "audio" ? audioFile : undefined,
           avatarUrl: avatarImage,
           voiceId: selectedVoice,
           backgroundUrl: sceneBackground,
           mode: "talks"
         });
      } else if (mode === "clips") {
         // V3 Clips API - Using reporter presenter
         response = await base44.functions.invoke("generateTalkingVideo", {
           text: articleText,
           presenterId: selectedPresenter,
           voiceId: selectedVoice,
           mode: "clips"
         });
      } else if (mode === "express") {
        // V3 Express API - Custom avatar
        response = await base44.functions.invoke("generateTalkingVideo", {
          text: articleText,
          avatarId: customAvatarId,
          voiceId: selectedVoice,
          mode: "express"
        });
      }

      const videoUrl = response.data?.video_url;
      if (videoUrl) {
        setGeneratedVideo(videoUrl);
        toast.success("וידאו מוכן! 🎥", { id: "video-gen" });
      } else {
        throw new Error("לא התקבל וידאו");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMsg = error.response?.data?.error || error.message;
      toast.error("שגיאה: " + errorMsg, { id: "video-gen" });
    } finally {
      setLoading(false);
    }
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = response.file_url;
      const cleanUrl = fileUrl.includes('?') ? fileUrl.split('?')[0] : fileUrl;
      setAudioFile(cleanUrl);
      toast.success("קובץ אודיו הועלה ✓");
    } catch (error) {
      toast.error("שגיאה בהעלאת אודיו");
    }
  };

  const handleBgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = response.file_url;
      const cleanUrl = fileUrl.includes('?') ? fileUrl.split('?')[0] : fileUrl;
      setSceneBackground(cleanUrl);
      toast.success("רקע הועלה ✓");
    } catch (error) {
      toast.error("שגיאה בהעלאת רקע");
    }
  };

  const handleReset = () => {
    setGeneratedVideo(null);
    setArticleText("");
    setAudioFile(null);
    setAvatarImage(null);
    setSelectedPresenter(null);
  };

  const handleGoogleSearch = async (e) => {
    e.preventDefault();
    if (!googleSearchQuery.trim()) {
      toast.error("אנא הקלד שאילתת חיפוש");
      return;
    }

    setSearchingGoogle(true);
    toast.loading("מחפש בעולם...", { id: "search" });

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `עשה חיפוש מקיף וגלובלי על "${googleSearchQuery}". 
        
חפש:
1. כתבות חדשות ותקשורת
2. מידע על אנשים (ביוגרפיה, ניוזות)
3. מידע על עסקים וחברות
4. אירועים ודברים שקורים כרגע
5. קישורים לעמודים רלוונטיים

עבור כל תוצאה, תן:
- כותרת (מושך, בעברית)
- תיאור מפורט (3-4 משפטים)
- תמונה (URL אמיתית אם קיימת)
- סוג התוכן (כתבה/אדם/עסק/אירוע)
- מקור המידע

החזר עד 8 תוצאות מהחזקות ביותר. בפורמט JSON.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  image_url: { type: "string" },
                  source_url: { type: "string" },
                  content_type: { type: "string" },
                  source: { type: "string" }
                }
              }
            }
          }
        }
      });

      setGoogleSearchResults(response.results || []);
      toast.success(`נמצאו ${response.results?.length || 0} תוצאות`, { id: "search" });
    } catch (error) {
      toast.error("שגיאה בחיפוש", { id: "search" });
      console.error("Search error:", error);
    } finally {
      setSearchingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/50 to-slate-900" dir="rtl">
      {/* Header */}
      <div className="bg-black/60 backdrop-blur-lg border-b border-[#E31E24]/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={createPageUrl("Home")}>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E31E24] to-red-800 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">סטודיו שידור מקצועי</h1>
                  <p className="text-xs text-white/70">D-ID Video Studio</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-white text-sm">פעיל</span>
            </div>
          </div>
        </div>
      </div>



      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
        
        {/* CREATE TAB */}
        {tab === "create" && (
        <>
        {/* Google Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#E31E24]/20 to-red-900/20 px-4 py-2 border-b border-[#E31E24]/30 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#E31E24]" />
            <h2 className="text-white font-semibold text-sm">חיפוש גלובלי - כתבות, אנשים, עסקים</h2>
          </div>
          <div className="p-4">
            <form onSubmit={handleGoogleSearch} className="flex gap-2">
              <input
                type="text"
                value={googleSearchQuery}
                onChange={(e) => setGoogleSearchQuery(e.target.value)}
                placeholder="חפש כתבות..."
                className="flex-1 bg-black/30 border border-[#E31E24]/30 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:border-[#E31E24] focus:outline-none"
                dir="rtl"
              />
              <Button
                type="submit"
                disabled={searchingGoogle}
                className="bg-[#E31E24] hover:bg-red-800 px-4"
              >
                {searchingGoogle ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </form>

            {googleSearchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 max-h-80 overflow-y-auto">
                {googleSearchResults.map((article, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedGoogleArticle(article);
                      setEditingGoogleArticle({ ...article, title: article.title, description: article.description });
                    }}
                    className="p-3 rounded-lg border-2 border-[#E31E24]/20 bg-black/20 hover:bg-black/40 hover:border-[#E31E24]/50 transition-all text-left group"
                  >
                    {article.image_url && (
                      <img src={article.image_url} alt={article.title} className="w-full h-24 object-cover rounded mb-2 group-hover:scale-105 transition-transform" />
                    )}
                    <h3 className="text-white font-semibold text-sm line-clamp-2">{article.title}</h3>
                    {article.content_type && (
                      <span className="inline-block text-[#E31E24] text-[10px] font-bold mt-1 px-2 py-0.5 bg-[#E31E24]/20 rounded">
                        {article.content_type}
                      </span>
                    )}
                    <p className="text-white/50 text-xs mt-1 line-clamp-2">{article.description}</p>
                    {article.source && (
                      <p className="text-white/30 text-[10px] mt-2">📍 {article.source}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Google Article Editor */}
        <AnimatePresence>
          {editingGoogleArticle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
              onClick={() => setEditingGoogleArticle(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-black/80 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between bg-gradient-to-r from-[#E31E24]/20 to-red-900/20 px-6 py-4 border-b border-[#E31E24]/30 sticky top-0 z-10">
                  <h2 className="text-white font-bold">עריכת כתבה</h2>
                  <button
                    onClick={() => setEditingGoogleArticle(null)}
                    className="p-2 rounded-lg hover:bg-white/10"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-white/70 text-xs font-semibold block mb-2">כותרת</label>
                    <input
                      type="text"
                      value={editingGoogleArticle.title}
                      onChange={(e) => setEditingGoogleArticle({ ...editingGoogleArticle, title: e.target.value })}
                      className="w-full bg-black/30 border border-[#E31E24]/30 rounded-lg px-3 py-2 text-white text-sm focus:border-[#E31E24] focus:outline-none"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="text-white/70 text-xs font-semibold block mb-2">תיאור</label>
                    <textarea
                      value={editingGoogleArticle.description}
                      onChange={(e) => setEditingGoogleArticle({ ...editingGoogleArticle, description: e.target.value })}
                      className="w-full bg-black/30 border border-[#E31E24]/30 rounded-lg px-3 py-2 text-white text-sm focus:border-[#E31E24] focus:outline-none h-24 resize-none"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="text-white/70 text-xs font-semibold block mb-2">URL של תמונה</label>
                    <input
                      type="text"
                      value={editingGoogleArticle.image_url || ""}
                      onChange={(e) => setEditingGoogleArticle({ ...editingGoogleArticle, image_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-black/30 border border-[#E31E24]/30 rounded-lg px-3 py-2 text-white text-sm focus:border-[#E31E24] focus:outline-none"
                      dir="ltr"
                    />
                  </div>

                  {editingGoogleArticle.image_url && (
                    <div>
                      <p className="text-white/70 text-xs font-semibold mb-2">תצוגה מקדימה:</p>
                      <img src={editingGoogleArticle.image_url} alt="preview" className="w-full h-48 object-cover rounded-lg" />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 px-6 py-4 border-t border-[#E31E24]/30 sticky bottom-0 bg-black/40 backdrop-blur-sm">
                  <button
                    onClick={() => setEditingGoogleArticle(null)}
                    className="flex-1 px-4 py-2 bg-black/50 border border-[#E31E24]/20 text-white rounded-lg text-sm font-semibold hover:bg-black/70 transition-all"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={() => {
                      setArticleToEdit({
                        title: editingGoogleArticle.title,
                        description: editingGoogleArticle.description || "",
                        content: editingGoogleArticle.description || "",
                        image_url: editingGoogleArticle.image_url || "",
                        category: "breaking"
                      });
                      setArticleEditorOpen(true);
                      setEditingGoogleArticle(null);
                    }}
                    className="flex-1 px-4 py-2 bg-[#E31E24] hover:bg-red-800 text-white rounded-lg text-sm font-semibold transition-all"
                  >
                    עורך מקצועי
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Historical Sources */}
        <HistoricalSourceSelector 
          onSourceSelect={() => {}}
          onArticlesLoad={(articles) => {
            setHistoricalArticles(articles);
            toast.success("נטענו כתבות מהארכיון");
          }}
        />

        {/* Historical Articles Selection */}
        {historicalArticles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#E31E24]/20 to-red-900/20 px-4 py-2 border-b border-[#E31E24]/30">
              <h2 className="text-white font-semibold text-sm">כתבות מהארכיון</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {historicalArticles.map((article, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedHistoricalArticle(article);
                      setArticleText(article.title + "\n\n" + (article.content || article.description || ""));
                    }}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedHistoricalArticle?.title === article.title
                        ? "border-[#E31E24] bg-[#E31E24]/20"
                        : "border-[#E31E24]/20 bg-black/20 hover:bg-black/40"
                    }`}
                  >
                    <h3 className="text-white font-semibold text-sm line-clamp-2">{article.title}</h3>
                    <p className="text-white/50 text-xs mt-1">{article.year || article.date}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#E31E24]/20 to-red-900/20 px-4 py-2 border-b border-[#E31E24]/30">
            <h2 className="text-white font-semibold text-sm">בחר סוג אווטר</h2>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Talks Mode */}
            <button
              onClick={() => setMode("talks")}
              className={`p-4 rounded-lg border-2 transition-all text-right ${
                mode === "talks"
                  ? "border-[#E31E24] bg-[#E31E24]/20"
                  : "border-[#E31E24]/20 bg-black/20 hover:bg-black/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#E31E24]/30 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-[#E31E24]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Talks - ראש בלבד</h3>
                   <p className="text-white/70 text-xs">תמונה סטטית → וידאו מדבר</p>
                   <p className="text-white/50 text-xs mt-1">V2 API</p>
                </div>
              </div>
            </button>

            {/* Clips Mode */}
            <button
              onClick={() => setMode("clips")}
              className={`p-4 rounded-lg border-2 transition-all text-right ${
                mode === "clips"
                  ? "border-[#E31E24] bg-[#E31E24]/20"
                  : "border-[#E31E24]/20 bg-black/20 hover:bg-black/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#E31E24]/30 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-[#E31E24]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Clips - גוף מלא</h3>
                   <p className="text-white/70 text-xs">שדרנים מוכנים + ידיים</p>
                   <p className="text-white/50 text-xs mt-1">V3 Pro API</p>
                </div>
              </div>
            </button>

            {/* Express Mode */}
            <button
              onClick={() => setMode("express")}
              className={`p-4 rounded-lg border-2 transition-all text-right ${
                mode === "express"
                  ? "border-[#E31E24] bg-[#E31E24]/20"
                  : "border-[#E31E24]/20 bg-black/20 hover:bg-black/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#E31E24]/30 flex items-center justify-center flex-shrink-0">
                  <Video className="w-5 h-5 text-[#E31E24]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Express - מותאם</h3>
                   <p className="text-white/70 text-xs">אווטר אישי + ידיים</p>
                   <p className="text-white/50 text-xs mt-1">V3 Instant API</p>
                </div>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Mode Content */}
        <AnimatePresence mode="wait">
          {mode === "talks" && (
            <motion.div
              key="talks"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Choose from existing reporters OR upload custom */}
              <div className="bg-black/40 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 overflow-hidden">
                <div className="bg-gradient-to-r from-[#E31E24]/20 to-red-900/20 px-4 py-2 border-b border-[#E31E24]/30">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-[#E31E24]" />
                    <h2 className="text-white font-semibold text-sm">תמונת שדרן</h2>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {/* Existing Reporters */}
                  <div>
                    <p className="text-white/70 text-xs font-semibold mb-2">כתבים קיימים:</p>
                    {reporters.length === 0 ? (
                      <div className="text-center py-3">
                        <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-[#E31E24]" />
                         <p className="text-white/70 text-sm">טוען כתבים...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-auto-fit gap-2" style={{
                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))'
                      }}>
                        {reporters.map((reporter) => (
                          <button
                            key={reporter.id}
                            onClick={() => {
                              setAvatarImage(reporter.image);
                            }}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              avatarImage === reporter.image
                                ? "border-[#E31E24] ring-2 ring-[#E31E24]/50"
                                : "border-[#E31E24]/20 hover:border-[#E31E24]/50"
                            }`}
                            title={reporter.name}
                          >
                            <img src={reporter.image} alt={reporter.name} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-0.5">
                              <p className="text-white text-[9px] font-bold line-clamp-1">{reporter.name}</p>
                            </div>
                            {avatarImage === reporter.image && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#E31E24] flex items-center justify-center">
                                <Play className="w-2 h-2 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-[#E31E24]/20"></div>
                    <span className="text-[#E31E24] text-xs font-semibold">או</span>
                    <div className="flex-1 h-px bg-[#E31E24]/20"></div>
                  </div>

                  {/* Custom Avatar Upload */}
                  <div>
                    <p className="text-white/70 text-xs font-semibold mb-2">העלה תמונה משלך:</p>
                     <div
                       onClick={() => fileInputRef.current?.click()}
                       className="relative aspect-video rounded-lg border-2 border-dashed border-[#E31E24]/30 hover:border-[#E31E24] bg-black/30 hover:bg-black/50 cursor-pointer transition-all flex items-center justify-center group"
                    >
                      {avatarImage && !reporters.some(r => r.image === avatarImage) ? (
                        <>
                          <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover rounded-lg" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Upload className="w-8 h-8 text-[#E31E24]" />
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <Upload className="w-10 h-10 text-[#E31E24] mx-auto mb-2" />
                          <p className="text-white text-sm font-medium">העלה תמונה</p>
                          <p className="text-blue-300/50 text-xs mt-1">PNG, JPG - רק הראש ידבר</p>
                        </div>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {mode === "clips" && (
            <motion.div
              key="clips"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Presenter Selection */}
              <div className="bg-black/40 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 overflow-hidden">
                <div className="bg-gradient-to-r from-[#E31E24]/20 to-red-900/20 px-4 py-2 border-b border-[#E31E24]/30">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#E31E24]" />
                    <h2 className="text-white font-semibold text-sm">בחר שדרן מקצועי (גוף מלא)</h2>
                  </div>
                </div>
                <div className="p-4">
                  {reporters.length === 0 ? (
                    <div className="text-center py-8">
                      <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-[#E31E24]" />
                      <p className="text-white/70 text-sm">טוען כתבים...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-auto-fit gap-3" style={{
                      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))'
                    }}>
                      {reporters.map((reporter) => (
                        <button
                          key={reporter.id}
                          onClick={() => setSelectedPresenter(reporter.id)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            selectedPresenter === reporter.id
                              ? "border-[#E31E24] ring-2 ring-[#E31E24]/50"
                              : "border-[#E31E24]/20 hover:border-[#E31E24]/50"
                          }`}
                          title={reporter.name}
                        >
                          <img src={reporter.image} alt={reporter.name} className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                            <p className="text-white text-[10px] font-bold line-clamp-1">{reporter.name}</p>
                          </div>
                          {selectedPresenter === reporter.id && (
                            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#E31E24] flex items-center justify-center">
                              <Play className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {mode === "express" && (
            <motion.div
              key="express"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Choose from existing reporters OR create custom */}
              <div className="bg-black/40 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 overflow-hidden">
                <div className="bg-gradient-to-r from-[#E31E24]/20 to-red-900/20 px-4 py-2 border-b border-[#E31E24]/30">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#E31E24]" />
                    <h2 className="text-white font-semibold text-sm">בחר אווטר (גוף מלא)</h2>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {/* Existing Reporters */}
                  <div>
                    <p className="text-white/70 text-xs font-semibold mb-2">כתבים קיימים:</p>
                    {reporters.length === 0 ? (
                      <div className="text-center py-4">
                        <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-[#E31E24]" />
                        <p className="text-white/70 text-sm">טוען כתבים...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-auto-fit gap-2" style={{
                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))'
                      }}>
                        {reporters.map((reporter) => (
                          <button
                            key={reporter.id}
                            onClick={() => {
                              setCustomAvatarId(reporter.id);
                              setTrainingVideo(null);
                            }}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              customAvatarId === reporter.id
                                ? "border-[#E31E24] ring-2 ring-[#E31E24]/50"
                                : "border-[#E31E24]/20 hover:border-[#E31E24]/50"
                             }`}
                            title={reporter.name}
                          >
                            <img src={reporter.image} alt={reporter.name} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-0.5">
                              <p className="text-white text-[9px] font-bold line-clamp-1">{reporter.name}</p>
                            </div>
                            {customAvatarId === reporter.id && (
                               <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#E31E24] flex items-center justify-center">
                                <Play className="w-2 h-2 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-[#E31E24]/20"></div>
                    <span className="text-[#E31E24] text-xs font-semibold">או</span>
                    <div className="flex-1 h-px bg-[#E31E24]/20"></div>
                  </div>

                  {/* Custom Avatar Training */}
                  <div>
                    <p className="text-white/70 text-xs font-semibold mb-2">צור אווטר חדש:</p>
                     <div
                       onClick={() => trainingVideoRef.current?.click()}
                       className="relative aspect-video rounded-lg border-2 border-dashed border-[#E31E24]/30 hover:border-[#E31E24] bg-black/30 hover:bg-black/50 cursor-pointer transition-all flex items-center justify-center group"
                    >
                      {trainingVideo ? (
                        <>
                          <video src={trainingVideo} className="w-full h-full object-cover rounded-lg" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Upload className="w-8 h-8 text-[#E31E24]" />
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <Video className="w-10 h-10 text-[#E31E24] mx-auto mb-2" />
                          <p className="text-white text-sm font-medium">העלה וידאו אימון (1-2 דקות)</p>
                          <p className="text-white/50 text-xs mt-1">MP4 - דבר בצורה טבעית</p>
                        </div>
                      )}
                    </div>
                    <input ref={trainingVideoRef} type="file" accept="video/*" onChange={handleTrainingVideoUpload} className="hidden" />
                    
                    {trainingVideo && !customAvatarId && (
                      <Button
                          onClick={async () => {
                            toast.loading("מאמן אווטר... זה לוקח 4-10 דקות", { id: "train" });
                            try {
                              const response = await base44.functions.invoke("trainExpressAvatar", {
                                videoUrl: trainingVideo
                              });
                              setCustomAvatarId(response.data.avatar_id);
                              toast.success("אווטר מוכן!", { id: "train" });
                            } catch (error) {
                              toast.error("שגיאה באימון", { id: "train" });
                            }
                          }}
                          className="w-full bg-[#E31E24] hover:bg-red-800 mt-2"
                        >
                        <Sparkles className="w-4 h-4 mr-2" />
                        צור אווטר מהווידאו
                      </Button>
                    )}
                  </div>

                  {customAvatarId && trainingVideo && (
                    <div className="bg-[#E31E24]/10 border border-[#E31E24]/30 rounded-lg p-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#E31E24]"></div>
                      <span className="text-[#E31E24] text-xs">אווטר מותאם מוכן לשימוש</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#E31E24]/20 to-red-900/20 px-4 py-2 border-b border-[#E31E24]/30">
            <h2 className="text-white font-semibold text-sm">קלט</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setInputType("text")}
              className={`p-3 rounded-lg border-2 transition-all text-sm font-semibold ${
                inputType === "text"
                  ? "border-[#E31E24] bg-[#E31E24]/20 text-[#E31E24]"
                  : "border-[#E31E24]/20 bg-black/20 text-white hover:bg-black/40"
              }`}
            >
              📝 טקסט
            </button>
            <button
              onClick={() => setInputType("audio")}
              className={`p-3 rounded-lg border-2 transition-all text-sm font-semibold ${
                inputType === "audio"
                  ? "border-[#E31E24] bg-[#E31E24]/20 text-[#E31E24]"
                  : "border-[#E31E24]/20 bg-black/20 text-white hover:bg-black/40"
              }`}
            >
              🎵 אודיו
            </button>
          </div>
        </motion.div>

        {/* Voice Settings (only for text) */}
        {inputType === "text" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#E31E24]/20 to-red-900/20 px-4 py-2 border-b border-[#E31E24]/30">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#E31E24]" />
                <h2 className="text-white font-semibold text-sm">קול</h2>
              </div>
            </div>
            <div className="p-4">
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full bg-black/30 border border-[#E31E24]/30 rounded-lg px-3 py-2 text-white text-sm focus:border-[#E31E24] focus:outline-none"
              >
                <option value="he-IL-AvriNeural">עברי - אברי (זכר)</option>
                <option value="he-IL-HilaNeural">עברית - הילה (נקבה)</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Article Text (for text input) */}
        {inputType === "text" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#E31E24]/20 to-red-900/20 px-4 py-2 border-b border-[#E31E24]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-[#E31E24]" />
                <h2 className="text-white font-semibold text-sm">טקסט</h2>
              </div>
              <span className="text-white/70 text-xs">{articleText.length} תווים</span>
            </div>
            <div className="p-4">
              <textarea
                value={articleText}
                onChange={(e) => setArticleText(e.target.value)}
                placeholder="כתוב את הטקסט שהאווטר ידבר..."
                className="w-full h-32 bg-black/30 border border-[#E31E24]/30 rounded-lg p-3 text-white text-sm placeholder-white/30 focus:border-[#E31E24] focus:outline-none resize-none"
                dir="rtl"
              />
            </div>
          </motion.div>
        )}

        {/* Audio File Input (for audio input) */}
        {inputType === "audio" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#E31E24]/20 to-red-900/20 px-4 py-2 border-b border-[#E31E24]/30">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#E31E24]" />
                <h2 className="text-white font-semibold text-sm">קובץ אודיו</h2>
              </div>
            </div>
            <div className="p-4">
              <div
                onClick={() => audioInputRef.current?.click()}
                className="relative rounded-lg border-2 border-dashed border-[#E31E24]/30 hover:border-[#E31E24] bg-black/30 hover:bg-black/50 cursor-pointer transition-all flex items-center justify-center p-6 group"
              >
                {audioFile ? (
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-lg bg-[#E31E24]/20 flex items-center justify-center mx-auto mb-2">
                      <Volume2 className="w-5 h-5 text-[#E31E24]" />
                    </div>
                    <p className="text-white text-sm font-medium">קובץ נבחר ✓</p>
                    <p className="text-blue-300/70 text-xs mt-1">{audioFile.split('/').pop()}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Volume2 className="w-10 h-10 text-[#E31E24] mx-auto mb-2" />
                    <p className="text-white text-sm font-medium">העלה אודיו</p>
                    <p className="text-white/50 text-xs mt-1">MP3, WAV, M4A</p>
                  </div>
                )}
              </div>
              <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
            </div>
          </motion.div>
        )}

        {/* Scene Background (Optional) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#E31E24]/20 to-red-900/20 px-4 py-2 border-b border-[#E31E24]/30">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-[#E31E24]" />
              <h2 className="text-white font-semibold text-sm">רקע סצנה (אופציונלי)</h2>
            </div>
          </div>
          <div className="p-4">
            <div
               onClick={() => bgInputRef.current?.click()}
               className="relative rounded-lg border-2 border-dashed border-[#E31E24]/30 hover:border-[#E31E24] bg-black/30 hover:bg-black/50 cursor-pointer transition-all flex items-center justify-center p-4 group"
            >
              {sceneBackground ? (
                <>
                  <img src={sceneBackground} alt="Background" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Upload className="w-6 h-6 text-[#E31E24]" />
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <Image className="w-8 h-8 text-[#E31E24] mx-auto mb-1" />
                  <p className="text-white text-xs font-medium">בחר רקע</p>
                  <p className="text-white/50 text-[10px] mt-1">PNG, JPG</p>
                </div>
              )}
            </div>
            <input ref={bgInputRef} type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
          </div>
        </motion.div>

        {/* Generate Button */}
        <Button
           onClick={handleGenerateVideo}
           disabled={loading || (inputType === "text" && !articleText.trim()) || (inputType === "audio" && !audioFile)}
           className="w-full bg-gradient-to-r from-[#E31E24] to-red-800 hover:from-red-800 hover:to-red-900 text-white font-bold py-5 text-base disabled:opacity-50 rounded-xl"
        >
          {loading ? (
            <>
              <Zap className="w-5 h-5 animate-spin mr-2" />
              יוצר וידאו...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              צור וידאו
            </>
          )}
        </Button>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#E31E24]/10 border border-[#E31E24]/20 rounded-lg p-3"
        >
          <div className="text-xs text-white/70 space-y-1">
            {mode === "talks" && <p>• V2 API - רק הראש ידבר מתמונה סטטית</p>}
            {mode === "clips" && <p>• V3 Pro API - שדרן בגוף מלא עם תנועות ידיים</p>}
            {mode === "express" && <p>• V3 Instant API - אווטר אישי בגוף מלא עם תנועות ידיים</p>}
            <p>• קול AI בעברית מקצועי</p>
            <p>• HD איכות גבוהה</p>
          </div>
        </motion.div>

        {/* Video Preview */}
        {generatedVideo && (
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-black/40 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 overflow-hidden"
           >
             <div className="bg-gradient-to-r from-[#E31E24]/20 to-red-900/20 px-4 py-2 border-b border-[#E31E24]/30 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <Eye className="w-4 h-4 text-[#E31E24]" />
                <h2 className="text-white font-semibold text-sm">תצוגה מקדימה</h2>
              </div>
              <span className="text-[#E31E24] text-xs">✓ מוכן</span>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <video src={generatedVideo} controls autoPlay className="w-full aspect-video rounded-lg bg-black" />
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={handleReset}
                    size="sm"
                    variant="outline"
                    className="bg-black/50 border-[#E31E24]/30 text-white hover:bg-[#E31E24]/20"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    חדש
                  </Button>
                  <Button
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = generatedVideo;
                      a.download = "broadcast.mp4";
                      a.click();
                    }}
                    size="sm"
                    className="bg-slate-600 hover:bg-slate-700"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    הורדה
                  </Button>
                  <Button
                    onClick={() => setUploadDialogOpen(true)}
                    size="sm"
                    className="bg-gradient-to-r from-[#E31E24] to-red-800 hover:from-red-800 hover:to-red-900"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    העלה
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Upload Confirmation Modal */}
        <VideoUploadConfirmation
          videoUrl={generatedVideo}
          isOpen={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          onSuccess={() => {
            handleReset();
          }}
        />

        {/* Article Editor */}
        <ArticleEditor
          article={articleToEdit}
          isOpen={articleEditorOpen}
          onClose={() => {
            setArticleEditorOpen(false);
            setArticleToEdit(null);
            setEditingGoogleArticle(null);
          }}
          onPublish={() => {
            toast.success("הכתבה פורסמה בהצלחה!");
            setArticleToEdit(null);
          }}
        />
        </>
        )}

        {/* MANAGE TAB */}
        {tab === "manage" && (
        <>
        {/* Search and Filter */}
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-black/40 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 w-4 h-4 text-[#E31E24]" />
              <input
                type="text"
                placeholder="חפש וידאו..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/30 border border-[#E31E24]/30 rounded-lg px-4 py-2 pr-10 text-white text-sm placeholder-white/30 focus:border-[#E31E24] focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              {["all", "ready", "processing", "failed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === status
                      ? "bg-[#E31E24] text-white"
                      : "bg-black/30 border border-[#E31E24]/20 text-white/70 hover:bg-[#E31E24]/20"
                  }`}
                >
                  {status === "all" ? "הכל" : status === "ready" ? "מוכן" : status === "processing" ? "בעיבוד" : "שגיאה"}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Videos Grid */}
        {videosLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-[#E31E24]/20 border-t-[#E31E24] animate-spin mx-auto mb-4"></div>
            <p className="text-white/70">טוען וידאוים...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 p-12 text-center"
          >
            <Play className="w-12 h-12 text-[#E31E24]/50 mx-auto mb-3" />
            <p className="text-white/70 text-sm">אין וידאוים עדיין</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredVideos.map((video) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-black/40 backdrop-blur-lg rounded-lg border border-[#E31E24]/20 overflow-hidden hover:border-[#E31E24]/50 transition-all cursor-pointer group"
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
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#E31E24]/20 to-red-900/20 gap-2">
                        <Play className="w-16 h-16 text-[#E31E24]/50" />
                        <p className="text-white/50 text-xs">אין תמונה</p>
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
                    <div className="flex items-center justify-between text-xs text-white/70 mb-3">
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
                        className="flex-1 px-2 py-1.5 bg-[#E31E24]/30 hover:bg-[#E31E24]/50 border border-[#E31E24]/30 rounded text-xs font-semibold text-[#E31E24] transition-all"
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
                className="bg-black/80 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 w-full max-w-2xl overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-[#E31E24]/20 to-red-900/20 px-6 py-4 border-b border-[#E31E24]/30">
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
                  <video
                    src={selectedVideo.video_url}
                    controls
                    className="w-full aspect-video rounded-lg bg-black"
                  />

                  <div className="space-y-3">
                    <div>
                      <p className="text-white/70 text-xs font-semibold mb-1">כותרת</p>
                      <p className="text-white text-sm">{selectedVideo.title}</p>
                    </div>

                    {selectedVideo.description && (
                      <div>
                        <p className="text-white/70 text-xs font-semibold mb-1">תיאור</p>
                        <p className="text-white/80 text-sm">{selectedVideo.description}</p>
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 bg-black/40 rounded-lg p-3">
                      <div className="text-center">
                        <Eye className="w-4 h-4 text-[#E31E24] mx-auto mb-1" />
                        <p className="text-white font-bold">{selectedVideo.views || 0}</p>
                        <p className="text-white/70 text-xs">צפיות</p>
                      </div>
                      <div className="text-center">
                        <ThumbsUp className="w-4 h-4 text-[#E31E24] mx-auto mb-1" />
                        <p className="text-white font-bold">{selectedVideo.likes || 0}</p>
                        <p className="text-white/70 text-xs">לייקים</p>
                      </div>
                      <div className="text-center">
                        <Settings className="w-4 h-4 text-[#E31E24] mx-auto mb-1" />
                        <p className="text-white font-bold text-sm">{selectedVideo.status}</p>
                        <p className="text-white/70 text-xs">סטטוס</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-2 bg-black/40 px-6 py-4 border-t border-[#E31E24]/30">
                  <button
                    onClick={() => {
                      handleStartEdit(selectedVideo);
                    }}
                    className="flex-1 px-4 py-2 bg-[#E31E24] hover:bg-red-800 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
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
                className="bg-black/80 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 w-full max-w-md"
                >
                <div className="flex items-center justify-between bg-gradient-to-r from-[#E31E24]/20 to-red-900/20 px-6 py-4 border-b border-[#E31E24]/30">
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
                    <label className="text-white/70 text-xs font-semibold block mb-2">כותרת</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-black/30 border border-[#E31E24]/30 rounded-lg px-3 py-2 text-white text-sm focus:border-[#E31E24] focus:outline-none"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="text-white/70 text-xs font-semibold block mb-2">תיאור (אופציונלי)</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full bg-black/30 border border-[#E31E24]/30 rounded-lg px-3 py-2 text-white text-sm focus:border-[#E31E24] focus:outline-none h-24 resize-none"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="flex gap-2 px-6 py-4 border-t border-[#E31E24]/30">
                  <button
                    onClick={() => setEditingVideo(null)}
                    className="flex-1 px-4 py-2 bg-black/50 border border-[#E31E24]/20 text-white rounded-lg text-sm font-semibold hover:bg-black/70 transition-all"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={updateMutation.isPending}
                    className="flex-1 px-4 py-2 bg-[#E31E24] hover:bg-red-800 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {updateMutation.isPending ? "שומר..." : "שמור"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </>
        )}
      </div>
    </div>
  );
}