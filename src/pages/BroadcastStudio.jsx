import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, Upload, Loader, FileVideo, Image, Type, 
  Sparkles, Zap, Download, ChevronLeft, Eye, Settings, 
  Volume2, User, Users, Video, Play
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import VideoUploadConfirmation from "../components/broadcast/VideoUploadConfirmation";

export default function BroadcastStudio() {
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
    queryFn: () => base44.entities.Reporter.filter({ is_active: true }, 'name'),
    initialData: []
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
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">סטודיו שידור מקצועי</h1>
                  <p className="text-xs text-blue-300">D-ID Video Studio</p>
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
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">
        
        {/* Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-lg rounded-xl border border-blue-500/20 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 px-4 py-2 border-b border-blue-500/20">
            <h2 className="text-white font-semibold text-sm">בחר סוג אווטר</h2>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Talks Mode */}
            <button
              onClick={() => setMode("talks")}
              className={`p-4 rounded-lg border-2 transition-all text-right ${
                mode === "talks"
                  ? "border-blue-500 bg-blue-500/20"
                  : "border-blue-500/20 bg-black/20 hover:bg-black/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600/30 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Talks - ראש בלבד</h3>
                  <p className="text-blue-200/70 text-xs">תמונה סטטית → וידאו מדבר</p>
                  <p className="text-blue-300/50 text-xs mt-1">V2 API</p>
                </div>
              </div>
            </button>

            {/* Clips Mode */}
            <button
              onClick={() => setMode("clips")}
              className={`p-4 rounded-lg border-2 transition-all text-right ${
                mode === "clips"
                  ? "border-blue-500 bg-blue-500/20"
                  : "border-blue-500/20 bg-black/20 hover:bg-black/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600/30 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Clips - גוף מלא</h3>
                  <p className="text-blue-200/70 text-xs">שדרנים מוכנים + ידיים</p>
                  <p className="text-purple-300/50 text-xs mt-1">V3 Pro API</p>
                </div>
              </div>
            </button>

            {/* Express Mode */}
            <button
              onClick={() => setMode("express")}
              className={`p-4 rounded-lg border-2 transition-all text-right ${
                mode === "express"
                  ? "border-blue-500 bg-blue-500/20"
                  : "border-blue-500/20 bg-black/20 hover:bg-black/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-600/30 flex items-center justify-center flex-shrink-0">
                  <Video className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Express - מותאם</h3>
                  <p className="text-blue-200/70 text-xs">אווטר אישי + ידיים</p>
                  <p className="text-green-300/50 text-xs mt-1">V3 Instant API</p>
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
              <div className="bg-black/40 backdrop-blur-lg rounded-xl border border-blue-500/20 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 px-4 py-2 border-b border-blue-500/20">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-blue-400" />
                    <h2 className="text-white font-semibold text-sm">תמונת שדרן</h2>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {/* Existing Reporters */}
                  <div>
                    <p className="text-blue-300 text-xs font-semibold mb-2">כתבים קיימים:</p>
                    {reporters.length === 0 ? (
                      <div className="text-center py-3">
                        <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
                        <p className="text-blue-300 text-sm">טוען כתבים...</p>
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
                                ? "border-blue-500 ring-2 ring-blue-500/50"
                                : "border-blue-500/20 hover:border-blue-500/50"
                            }`}
                            title={reporter.name}
                          >
                            <img src={reporter.image} alt={reporter.name} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-0.5">
                              <p className="text-white text-[9px] font-bold line-clamp-1">{reporter.name}</p>
                            </div>
                            {avatarImage === reporter.image && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
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
                    <div className="flex-1 h-px bg-blue-500/20"></div>
                    <span className="text-blue-400 text-xs font-semibold">או</span>
                    <div className="flex-1 h-px bg-blue-500/20"></div>
                  </div>

                  {/* Custom Avatar Upload */}
                  <div>
                    <p className="text-blue-300 text-xs font-semibold mb-2">העלה תמונה משלך:</p>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="relative aspect-video rounded-lg border-2 border-dashed border-blue-500/30 hover:border-blue-500 bg-black/30 hover:bg-black/50 cursor-pointer transition-all flex items-center justify-center group"
                    >
                      {avatarImage && !reporters.some(r => r.image === avatarImage) ? (
                        <>
                          <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover rounded-lg" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Upload className="w-8 h-8 text-blue-400" />
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <Upload className="w-10 h-10 text-blue-400 mx-auto mb-2" />
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
              <div className="bg-black/40 backdrop-blur-lg rounded-xl border border-purple-500/20 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 px-4 py-2 border-b border-purple-500/20">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <h2 className="text-white font-semibold text-sm">בחר שדרן מקצועי (גוף מלא)</h2>
                  </div>
                </div>
                <div className="p-4">
                  {reporters.length === 0 ? (
                    <div className="text-center py-8">
                      <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-400" />
                      <p className="text-purple-300 text-sm">טוען כתבים...</p>
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
                              ? "border-purple-500 ring-2 ring-purple-500/50"
                              : "border-purple-500/20 hover:border-purple-500/50"
                          }`}
                          title={reporter.name}
                        >
                          <img src={reporter.image} alt={reporter.name} className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                            <p className="text-white text-[10px] font-bold line-clamp-1">{reporter.name}</p>
                          </div>
                          {selectedPresenter === reporter.id && (
                            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
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
              <div className="bg-black/40 backdrop-blur-lg rounded-xl border border-green-500/20 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600/20 to-green-800/20 px-4 py-2 border-b border-green-500/20">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-400" />
                    <h2 className="text-white font-semibold text-sm">בחר אווטר (גוף מלא)</h2>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {/* Existing Reporters */}
                  <div>
                    <p className="text-green-300 text-xs font-semibold mb-2">כתבים קיימים:</p>
                    {reporters.length === 0 ? (
                      <div className="text-center py-4">
                        <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-green-400" />
                        <p className="text-green-300 text-sm">טוען כתבים...</p>
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
                                ? "border-green-500 ring-2 ring-green-500/50"
                                : "border-green-500/20 hover:border-green-500/50"
                            }`}
                            title={reporter.name}
                          >
                            <img src={reporter.image} alt={reporter.name} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-0.5">
                              <p className="text-white text-[9px] font-bold line-clamp-1">{reporter.name}</p>
                            </div>
                            {customAvatarId === reporter.id && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
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
                    <div className="flex-1 h-px bg-green-500/20"></div>
                    <span className="text-green-400 text-xs font-semibold">או</span>
                    <div className="flex-1 h-px bg-green-500/20"></div>
                  </div>

                  {/* Custom Avatar Training */}
                  <div>
                    <p className="text-green-300 text-xs font-semibold mb-2">צור אווטר חדש:</p>
                    <div
                      onClick={() => trainingVideoRef.current?.click()}
                      className="relative aspect-video rounded-lg border-2 border-dashed border-green-500/30 hover:border-green-500 bg-black/30 hover:bg-black/50 cursor-pointer transition-all flex items-center justify-center group"
                    >
                      {trainingVideo ? (
                        <>
                          <video src={trainingVideo} className="w-full h-full object-cover rounded-lg" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Upload className="w-8 h-8 text-green-400" />
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <Video className="w-10 h-10 text-green-400 mx-auto mb-2" />
                          <p className="text-white text-sm font-medium">העלה וידאו אימון (1-2 דקות)</p>
                          <p className="text-green-300/50 text-xs mt-1">MP4 - דבר בצורה טבעית</p>
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
                        className="w-full bg-green-600 hover:bg-green-700 mt-2"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        צור אווטר מהווידאו
                      </Button>
                    )}
                  </div>

                  {customAvatarId && trainingVideo && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-green-300 text-xs">אווטר מותאם מוכן לשימוש</span>
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
          className="bg-black/40 backdrop-blur-lg rounded-xl border border-blue-500/20 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 px-4 py-2 border-b border-blue-500/20">
            <h2 className="text-white font-semibold text-sm">קלט</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setInputType("text")}
              className={`p-3 rounded-lg border-2 transition-all text-sm font-semibold ${
                inputType === "text"
                  ? "border-blue-500 bg-blue-500/20 text-blue-300"
                  : "border-blue-500/20 bg-black/20 text-white hover:bg-black/40"
              }`}
            >
              📝 טקסט
            </button>
            <button
              onClick={() => setInputType("audio")}
              className={`p-3 rounded-lg border-2 transition-all text-sm font-semibold ${
                inputType === "audio"
                  ? "border-blue-500 bg-blue-500/20 text-blue-300"
                  : "border-blue-500/20 bg-black/20 text-white hover:bg-black/40"
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
            className="bg-black/40 backdrop-blur-lg rounded-xl border border-blue-500/20 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 px-4 py-2 border-b border-blue-500/20">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-400" />
                <h2 className="text-white font-semibold text-sm">קול</h2>
              </div>
            </div>
            <div className="p-4">
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full bg-black/30 border border-blue-500/20 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
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
            className="bg-black/40 backdrop-blur-lg rounded-xl border border-blue-500/20 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 px-4 py-2 border-b border-blue-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-blue-400" />
                <h2 className="text-white font-semibold text-sm">טקסט</h2>
              </div>
              <span className="text-blue-300 text-xs">{articleText.length} תווים</span>
            </div>
            <div className="p-4">
              <textarea
                value={articleText}
                onChange={(e) => setArticleText(e.target.value)}
                placeholder="כתוב את הטקסט שהאווטר ידבר..."
                className="w-full h-32 bg-black/30 border border-blue-500/20 rounded-lg p-3 text-white text-sm placeholder-blue-300/30 focus:border-blue-500 focus:outline-none resize-none"
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
            className="bg-black/40 backdrop-blur-lg rounded-xl border border-blue-500/20 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 px-4 py-2 border-b border-blue-500/20">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-400" />
                <h2 className="text-white font-semibold text-sm">קובץ אודיו</h2>
              </div>
            </div>
            <div className="p-4">
              <div
                onClick={() => audioInputRef.current?.click()}
                className="relative rounded-lg border-2 border-dashed border-blue-500/30 hover:border-blue-500 bg-black/30 hover:bg-black/50 cursor-pointer transition-all flex items-center justify-center p-6 group"
              >
                {audioFile ? (
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                      <Volume2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-white text-sm font-medium">קובץ נבחר ✓</p>
                    <p className="text-blue-300/70 text-xs mt-1">{audioFile.split('/').pop()}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Volume2 className="w-10 h-10 text-blue-400 mx-auto mb-2" />
                    <p className="text-white text-sm font-medium">העלה אודיו</p>
                    <p className="text-blue-300/50 text-xs mt-1">MP3, WAV, M4A</p>
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
          className="bg-black/40 backdrop-blur-lg rounded-xl border border-blue-500/20 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 px-4 py-2 border-b border-blue-500/20">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-blue-400" />
              <h2 className="text-white font-semibold text-sm">רקע סצנה (אופציונלי)</h2>
            </div>
          </div>
          <div className="p-4">
            <div
              onClick={() => bgInputRef.current?.click()}
              className="relative rounded-lg border-2 border-dashed border-blue-500/30 hover:border-blue-500 bg-black/30 hover:bg-black/50 cursor-pointer transition-all flex items-center justify-center p-4 group"
            >
              {sceneBackground ? (
                <>
                  <img src={sceneBackground} alt="Background" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Upload className="w-6 h-6 text-blue-400" />
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <Image className="w-8 h-8 text-blue-400 mx-auto mb-1" />
                  <p className="text-white text-xs font-medium">בחר רקע</p>
                  <p className="text-blue-300/50 text-[10px] mt-1">PNG, JPG</p>
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
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-5 text-base disabled:opacity-50 rounded-xl"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin mr-2" />
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
          className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3"
        >
          <div className="text-xs text-blue-200 space-y-1">
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
            className="bg-black/40 backdrop-blur-lg rounded-xl border border-green-500/20 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-600/20 to-green-800/20 px-4 py-2 border-b border-green-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-400" />
                <h2 className="text-white font-semibold text-sm">תצוגה מקדימה</h2>
              </div>
              <span className="text-green-400 text-xs">✓ מוכן</span>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <video src={generatedVideo} controls autoPlay className="w-full aspect-video rounded-lg bg-black" />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleReset}
                    size="sm"
                    variant="outline"
                    className="bg-black/50 border-blue-500/30 text-white hover:bg-blue-600/20"
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
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    הורדה
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}