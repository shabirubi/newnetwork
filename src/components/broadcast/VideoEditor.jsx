import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Type, Image, Zap, Settings, X, Play, Pause, Plus, Trash2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import BackgroundOverlay from "./editor/BackgroundOverlay";
import TextOverlay from "./editor/TextOverlay";
import NewsStripOverlay from "./editor/NewsStripOverlay";
import PreviewPlayer from "./editor/PreviewPlayer";

export default function VideoEditor({ videoUrl, onSave, onClose }) {
  const [videoMetadata, setVideoMetadata] = useState(null);
  const [overlays, setOverlays] = useState({
    backgrounds: [],
    texts: [],
    newsStrips: []
  });
  const [selectedTab, setSelectedTab] = useState("background"); // background | text | newsstrip
  const [preview, setPreview] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = () => {
        setVideoMetadata({
          duration: videoRef.current.duration,
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight
        });
      };
    }
  }, [videoUrl]);

  const addBackground = (bgData) => {
    setOverlays(prev => ({
      ...prev,
      backgrounds: [...prev.backgrounds, bgData]
    }));
    toast.success("רקע נוסף בהצלחה");
  };

  const addTextOverlay = (textData) => {
    setOverlays(prev => ({
      ...prev,
      texts: [...prev.texts, textData]
    }));
    toast.success("מלל נוסף בהצלחה");
  };

  const addNewsStrip = (stripData) => {
    setOverlays(prev => ({
      ...prev,
      newsStrips: [...prev.newsStrips, stripData]
    }));
    toast.success("סטריפ ידיעות נוסף בהצלחה");
  };

  const removeOverlay = (type, index) => {
    setOverlays(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (overlays.backgrounds.length === 0 && overlays.texts.length === 0 && overlays.newsStrips.length === 0) {
      toast.error("אנא הוסף לפחות אוברלייי אחד");
      return;
    }
    onSave({ videoUrl, overlays });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-[10000] flex flex-col"
    >
      {/* Header */}
      <div className="bg-black/80 border-b border-[#E31E24]/30 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#E31E24]/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-[#E31E24]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">עורך וידאו מקצועי</h1>
            <p className="text-xs text-white/70">הוסף רקעים, מלל וסטריפים</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Left Panel - Preview */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="rounded-xl overflow-hidden bg-black border border-[#E31E24]/30 flex-1 mb-4">
            <PreviewPlayer 
              videoUrl={videoUrl} 
              overlays={overlays}
              videoMetadata={videoMetadata}
            />
          </div>

          {/* Preview Controls */}
          <div className="flex gap-2">
            <Button
              onClick={() => setPreview(!preview)}
              className="flex-1 bg-[#E31E24]/30 hover:bg-[#E31E24]/50 text-white"
            >
              {preview ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {preview ? "הפסק" : "הפעל"} תצוגה
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-[#E31E24] to-red-800"
            >
              <Zap className="w-4 h-4 mr-2" />
              שמור עריכה
            </Button>
          </div>
        </div>

        {/* Right Panel - Tools */}
        <div className="w-80 bg-black/40 backdrop-blur-lg rounded-xl border border-[#E31E24]/30 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[#E31E24]/30">
            <button
              onClick={() => setSelectedTab("background")}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                selectedTab === "background"
                  ? "bg-[#E31E24]/20 text-[#E31E24] border-b-2 border-[#E31E24]"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Image className="w-4 h-4" />
              רקע
            </button>
            <button
              onClick={() => setSelectedTab("text")}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                selectedTab === "text"
                  ? "bg-[#E31E24]/20 text-[#E31E24] border-b-2 border-[#E31E24]"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Type className="w-4 h-4" />
              מלל
            </button>
            <button
              onClick={() => setSelectedTab("newsstrip")}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                selectedTab === "newsstrip"
                  ? "bg-[#E31E24]/20 text-[#E31E24] border-b-2 border-[#E31E24]"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Zap className="w-4 h-4" />
              סטריפ
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedTab === "background" && (
              <BackgroundOverlay 
                onAdd={addBackground}
                videoDuration={videoMetadata?.duration}
              />
            )}
            {selectedTab === "text" && (
              <TextOverlay 
                onAdd={addTextOverlay}
                videoDuration={videoMetadata?.duration}
              />
            )}
            {selectedTab === "newsstrip" && (
              <NewsStripOverlay 
                onAdd={addNewsStrip}
                videoDuration={videoMetadata?.duration}
              />
            )}

            {/* Overlays List */}
            <div className="border-t border-[#E31E24]/30 pt-4">
              <p className="text-white/70 text-xs font-semibold mb-3">אוברלייים פעילים</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {overlays.backgrounds.map((bg, idx) => (
                  <div key={`bg-${idx}`} className="flex items-center justify-between bg-black/30 p-2 rounded border border-[#E31E24]/20">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs truncate">רקע {idx + 1}</p>
                      <p className="text-white/50 text-[10px]">{bg.startTime.toFixed(1)}s - {bg.endTime.toFixed(1)}s</p>
                    </div>
                    <button
                      onClick={() => removeOverlay("backgrounds", idx)}
                      className="p-1 hover:bg-red-600/30 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                ))}
                {overlays.texts.map((text, idx) => (
                  <div key={`text-${idx}`} className="flex items-center justify-between bg-black/30 p-2 rounded border border-[#E31E24]/20">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs truncate">{text.content.substring(0, 15)}...</p>
                      <p className="text-white/50 text-[10px]">{text.startTime.toFixed(1)}s - {text.endTime.toFixed(1)}s</p>
                    </div>
                    <button
                      onClick={() => removeOverlay("texts", idx)}
                      className="p-1 hover:bg-red-600/30 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                ))}
                {overlays.newsStrips.map((strip, idx) => (
                  <div key={`strip-${idx}`} className="flex items-center justify-between bg-black/30 p-2 rounded border border-[#E31E24]/20">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs truncate">סטריפ ידיעות {idx + 1}</p>
                      <p className="text-white/50 text-[10px]">{strip.startTime.toFixed(1)}s - {strip.endTime.toFixed(1)}s</p>
                    </div>
                    <button
                      onClick={() => removeOverlay("newsStrips", idx)}
                      className="p-1 hover:bg-red-600/30 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video reference for metadata */}
      <video ref={videoRef} className="hidden" src={videoUrl} />
    </motion.div>
  );
}