import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VideoUploadModal({ isOpen, onClose, onVideoUploaded }) {
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError("");
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      setError("אנא בחר קובץ וכותרה");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", title.trim());

      const response = await base44.functions.invoke('uploadUserVideo', formData);

      if (response.data.success) {
        onVideoUploaded?.(response.data.video);
        setTitle("");
        setSelectedFile(null);
        onClose();
      } else {
        setError(response.data.error || "שגיאה בהעלאת הסרטון");
      }
    } catch (err) {
      setError(err.message || "שגיאה בהעלאת הסרטון");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-black/95 via-[#0a0000]/90 to-black/95 rounded-3xl border-2 border-[#E31E24]/50 p-8 max-w-md w-full backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">העלה סרטון</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#E31E24]/20 rounded-full transition-all"
              >
                <X className="w-6 h-6 text-[#E31E24]" />
              </button>
            </div>

            <div className="space-y-4">
              {/* File Input */}
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full border-2 border-dashed border-[#E31E24]/40 rounded-xl p-6 hover:border-[#E31E24] transition-all disabled:opacity-50 flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-[#E31E24]" />
                  <span className="text-white font-bold text-sm">
                    {selectedFile ? selectedFile.name : "לחץ כדי לבחור סרטון"}
                  </span>
                  <span className="text-gray-400 text-xs">בחר סרטון כלשהו</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-white font-bold mb-2 text-sm">
                  כותרה
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={uploading}
                  placeholder="הכנס כותרה לסרטון"
                  className="w-full bg-white/10 border border-[#E31E24]/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 disabled:opacity-50"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !title.trim() || uploading}
                className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:shadow-lg disabled:opacity-50 py-2 font-bold flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    בהעלאה...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    העלה סרטון
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