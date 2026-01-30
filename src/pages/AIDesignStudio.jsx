import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Upload, Loader, Download, Copy, Share2, Trash2, X, Sparkles, Play, Bookmark, Send, Grid3X3, Mic, Newspaper, Zap, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import AnimatedCharacter from "../components/avatar/AnimatedCharacter";
import { SaveDesignModal, AddToVideoModal, AddToArticleModal, AddToBroadcastModal } from "../components/designstudio/DesignUsageModals";
import { VoiceOverModal } from "../components/designstudio/VoiceOverModal";
import { UploadDesignModal } from "../components/designstudio/UploadDesignModal";
import { ArticlePresenterModal } from "../components/designstudio/ArticlePresenterModal";
import { MotionCharacterModal } from "../components/designstudio/MotionCharacterModal";
import { ScriptGeneratorModal } from "../components/designstudio/ScriptGeneratorModal";
import { LumaVideoModal } from "../components/designstudio/LumaVideoModal";
import { TextOverlayEditor, FiltersPanel, ExportOptions, ShareDesign } from "../components/designstudio/DesignEditor";

export default function AIDesignStudio() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [designTitle, setDesignTitle] = useState("");
  const [animationScript, setAnimationScript] = useState("");
  const [showAnimator, setShowAnimator] = useState(false);
  const [showUsageOptions, setShowUsageOptions] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showVoiceOverModal, setShowVoiceOverModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showArticlePresentationModal, setShowArticlePresentationModal] = useState(false);
  const [showMotionCharacterModal, setShowMotionCharacterModal] = useState(false);
  const [showScriptGeneratorModal, setShowScriptGeneratorModal] = useState(false);
  const [showLumaVideoModal, setShowLumaVideoModal] = useState(false);

  const generateDesign = async () => {
    if (!prompt.trim()) {
      toast.error("אנא הזן תיאור");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke("generateAIDesign", {
        prompt: prompt
      });

      const imageUrl = response.data?.image_url;
      if (imageUrl) {
        const newDesign = {
          id: Date.now(),
          imageUrl,
          prompt,
          createdAt: new Date().toISOString()
        };
        setGeneratedImage(imageUrl);
        setEditedImage(imageUrl);
        setHistory([newDesign, ...history]);
        toast.success("🎨 דיזיין נוצר בהצלחה!");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("שגיאה ביצירת הדיזיין");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await base44.functions.invoke("uploadDesignFile", {
        file: file
      });

      setUploadedImage(response.data?.file_url);
      toast.success("✅ תמונה הועלתה בהצלחה");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("שגיאה בהעלאת התמונה");
    }
  };

  const downloadImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `design-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) {
          document.body.removeChild(a);
        }
        window.URL.revokeObjectURL(url);
      }, 100);
      toast.success("✅ הדיזיין הורד בהצלחה");
    } catch (error) {
      toast.error("שגיאה בהורדה");
    }
  };

  const copyPrompt = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("📋 הטקסט הועתק");
  };

  const deleteDesign = (id) => {
    setHistory(history.filter(d => d.id !== id));
    if (selectedDesign?.id === id) setSelectedDesign(null);
    toast.success("🗑️ הדיזיין נמחק");
  };

  const usageOptions = [
    { id: "video", icon: Play, label: "הכנס לוידאו", desc: "overlay על וידאו", color: "bg-blue-600", action: () => setShowVideoModal(true) },
    { id: "article", icon: Send, label: "הכנס לכתבה", desc: "צמוד בתוך המאמר", color: "bg-cyan-600", action: () => setShowArticleModal(true) },
    { id: "broadcast", icon: Grid3X3, label: "שדר בשידור", desc: "הוסף לשידור חי", color: "bg-red-600", action: () => setShowBroadcastModal(true) },
    { id: "save", icon: Bookmark, label: "שמור דיזיין", desc: "לספריית התכנים שלי", color: "bg-purple-600", action: () => setShowSaveModal(true) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wand2 className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              סטודיו עיצוב
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            תאר את הדיזיין שלך ותן ל-AI ליצור אותו בשניות
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Creator Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-4"
          >
            <div className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 rounded-2xl p-6">
              {/* Input Area */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-white">
                  📝 תיאור הדיזיין
                </label>
                <Textarea
                  id="design-prompt"
                  name="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="לדוגמה: כרזה עם אריה זהוב, טקסט לבן, רקע סיום..."
                  className="bg-black/60 border-purple-500/30 text-white placeholder-white/40 resize-none"
                  rows={5}
                />

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">
                    📸 העלה תמונת התייחסות (אופציונלי)
                  </label>
                  <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-purple-500/50 rounded-xl bg-black/40 hover:bg-purple-500/10 transition-colors cursor-pointer">
                    <Upload className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-gray-400">בחר תמונה</span>
                    <input
                      id="image-upload"
                      name="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadedImage && (
                  <div className="relative rounded-lg overflow-hidden border border-purple-500/30">
                    <img
                      src={uploadedImage}
                      alt="Reference"
                      className="w-full h-32 object-cover"
                    />
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-2 right-2 bg-black/80 p-1 rounded-full hover:bg-black transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}

                <Button
                  onClick={generateDesign}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold py-3 rounded-xl transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      יוצר דיזיין...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      צור דיזיין
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Design Tools */}
            {generatedImage && (
              <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-4 space-y-4">
                <TextOverlayEditor
                  imageUrl={editedImage || generatedImage}
                  onImageUpdate={setEditedImage}
                />
                <FiltersPanel
                  imageUrl={editedImage || generatedImage}
                  onImageUpdate={setEditedImage}
                />
                <ExportOptions imageUrl={editedImage || generatedImage} designTitle={prompt} />
                <ShareDesign imageUrl={editedImage || generatedImage} designTitle={prompt} />
              </div>
            )}

            {/* Suggested Prompts */}
            <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-4">
              <p className="text-xs font-semibold text-purple-300 mb-3">
                💡 הצעות
              </p>
              <div className="space-y-2">
                {[
                  "כרזה עם טקסט מודרני וגרדיאנט צבעוני",
                  "עיצוב עטיפה למוצר יוקרתי",
                  "תמונת כותרת לבלוג חדשות"
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(suggestion)}
                    className="w-full text-left p-2 text-xs text-gray-300 bg-black/60 rounded-lg hover:bg-purple-600/20 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Preview Area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Main Preview */}
            <div className="bg-gradient-to-br from-black to-purple-900/30 border border-purple-500/30 rounded-2xl p-6 min-h-[400px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {generatedImage ? (
                  <motion.div
                    key="image"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full space-y-4"
                  >
                    <div className="relative bg-black rounded-xl overflow-hidden border border-purple-500/30">
                      <img
                        src={editedImage || generatedImage}
                        alt="Generated Design"
                        className="w-full h-auto"
                      />
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() => setShowLumaVideoModal(true)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-xs sm:text-sm"
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        הנפש
                      </Button>
                      <Button
                        onClick={() => setShowUploadModal(true)}
                        variant="outline"
                        className="flex-1 border-purple-500/50 text-purple-400 hover:bg-purple-500/20 text-xs sm:text-sm"
                      >
                        <Grid3X3 className="w-4 h-4 mr-1" />
                        הוסף
                      </Button>
                      <Button
                        onClick={() => setShowScriptGeneratorModal(true)}
                        variant="outline"
                        className="flex-1 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 text-xs sm:text-sm"
                      >
                        <Lightbulb className="w-4 h-4 mr-1" />
                        AI סרטון
                      </Button>
                      <Button
                        onClick={() => setShowMotionCharacterModal(true)}
                        variant="outline"
                        className="flex-1 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 text-xs sm:text-sm"
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        תנועה
                      </Button>
                      <Button
                        onClick={() => setShowArticlePresentationModal(true)}
                        variant="outline"
                        className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/20 text-xs sm:text-sm"
                      >
                        <Newspaper className="w-4 h-4 mr-1" />
                        כתבה
                      </Button>
                      <Button
                        onClick={() => setShowVoiceOverModal(true)}
                        variant="outline"
                        className="flex-1 border-orange-500/50 text-orange-400 hover:bg-orange-500/20 text-xs sm:text-sm"
                      >
                        <Mic className="w-4 h-4 mr-1" />
                        דיבוב
                      </Button>
                      <Button
                        onClick={() => downloadImage(editedImage || generatedImage)}
                        variant="outline"
                        className="flex-1 border-purple-500/50 text-purple-400 hover:bg-purple-500/20 text-xs sm:text-sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        הורד
                      </Button>
                    </div>
                  </motion.div>
                ) : isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <Loader className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
                    <p className="text-white font-semibold">
                      יוצר את הדיזיין שלך...
                    </p>
                    <p className="text-gray-400 text-sm">
                      זה עשוי לקחת עד 30 שניות
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <Wand2 className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
                    <p className="text-white font-semibold">
                      המתן לתיאור הדיזיין
                    </p>
                    <p className="text-gray-400 text-sm">
                      הזן תיאור והקלק על כפתור יצירה
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* History */}
            {history.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 border border-purple-500/20 rounded-2xl p-4"
              >
                <h3 className="text-white font-semibold mb-4">
                  📚 ההיסטוריה שלך
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[200px] overflow-y-auto">
                  {history.map((design) => (
                    <motion.button
                      key={design.id}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setSelectedDesign(design)}
                      className="relative group"
                    >
                      <img
                        src={design.imageUrl}
                        alt="Design"
                        className="w-full h-20 object-cover rounded-lg border-2 border-purple-500/30 group-hover:border-purple-500 transition-colors"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDesign(design.id);
                        }}
                        className="absolute -top-2 -right-2 bg-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Usage Modals */}
      <SaveDesignModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        imageUrl={editedImage || generatedImage}
        prompt={prompt}
      />
      <AddToVideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        imageUrl={editedImage || generatedImage}
      />
      <AddToArticleModal
        isOpen={showArticleModal}
        onClose={() => setShowArticleModal(false)}
        imageUrl={editedImage || generatedImage}
      />
      <AddToBroadcastModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        imageUrl={editedImage || generatedImage}
      />
      <VoiceOverModal
        isOpen={showVoiceOverModal}
        onClose={() => setShowVoiceOverModal(false)}
        imageUrl={editedImage || generatedImage}
        designTitle={prompt}
      />
      <UploadDesignModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        imageUrl={editedImage || generatedImage}
        designTitle={prompt}
      />
      <ArticlePresenterModal
        isOpen={showArticlePresentationModal}
        onClose={() => setShowArticlePresentationModal(false)}
        imageUrl={editedImage || generatedImage}
      />
      <MotionCharacterModal
        isOpen={showMotionCharacterModal}
        onClose={() => setShowMotionCharacterModal(false)}
        imageUrl={editedImage || generatedImage}
      />
      <ScriptGeneratorModal
        isOpen={showScriptGeneratorModal}
        onClose={() => setShowScriptGeneratorModal(false)}
        imageUrl={editedImage || generatedImage}
      />
      <LumaVideoModal
        isOpen={showLumaVideoModal}
        onClose={() => setShowLumaVideoModal(false)}
        imageUrl={editedImage || generatedImage}
      />

      {/* Character Animation Modal */}
      <AnimatePresence>
        {showAnimator && generatedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAnimator(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  הנפשת דמות
                </h3>
                <button
                  onClick={() => setShowAnimator(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    🎤 טקסט לדיבור
                  </label>
                  <Textarea
                    id="animation-script"
                    name="animation-script"
                    value={animationScript}
                    onChange={(e) => setAnimationScript(e.target.value)}
                    placeholder="כתוב את הטקסט שהדמות תדבר..."
                    className="bg-black/60 border-purple-500/30 text-white placeholder-white/40 resize-none"
                    rows={3}
                  />
                </div>

                {animationScript && (
                  <AnimatedCharacter
                    imageUrl={generatedImage}
                    script={animationScript}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Usage Options Modal */}
      <AnimatePresence>
        {showUsageOptions && generatedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUsageOptions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 rounded-2xl p-8 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Grid3X3 className="w-6 h-6 text-purple-400" />
                  איך להשתמש בדיזיין?
                </h3>
                <button
                  onClick={() => setShowUsageOptions(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {usageOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        option.action();
                        setShowUsageOptions(false);
                      }}
                      className={`${option.color} p-6 rounded-xl text-white hover:shadow-lg transition-all text-center group`}
                    >
                      <Icon className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <h4 className="font-bold mb-1">{option.label}</h4>
                      <p className="text-sm text-white/80">{option.desc}</p>
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-8 p-4 bg-purple-600/20 border border-purple-500/30 rounded-xl">
                <p className="text-sm text-purple-200 text-center">
                  💡 בחר אפשרות כדי להשתמש בדיזיין שיצרת בדרכים שונות
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Design Details Modal */}
      <AnimatePresence>
        {selectedDesign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDesign(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white">פרטי הדיזיין</h3>
                <button
                  onClick={() => setSelectedDesign(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <img
                  src={selectedDesign.imageUrl}
                  alt="Design"
                  className="w-full rounded-lg border border-purple-500/30"
                />

                <div>
                  <p className="text-sm text-gray-400 mb-2">Prompt:</p>
                  <p className="text-white bg-black/60 p-4 rounded-lg">
                    {selectedDesign.prompt}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => downloadImage(selectedDesign.imageUrl)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    הורד
                  </Button>
                  <Button
                    onClick={() => copyPrompt(selectedDesign.prompt)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    העתק
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}