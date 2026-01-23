import React, { useState, useRef } from "react";
import { Upload, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function BackgroundOverlay({ onAdd, videoDuration = 30 }) {
  const [backgroundUrl, setBackgroundUrl] = useState(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(Math.min(10, videoDuration));
  const [opacity, setOpacity] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = response.file_url.includes('?') 
        ? response.file_url.split('?')[0] 
        : response.file_url;
      setBackgroundUrl(fileUrl);
      toast.success("רקע הועלה בהצלחה");
    } catch (error) {
      toast.error("שגיאה בהעלאת רקע");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (!backgroundUrl) {
      toast.error("אנא העלה רקע");
      return;
    }
    if (startTime >= endTime) {
      toast.error("זמן ההתחלה חייב להיות קטן מזמן הסיום");
      return;
    }

    onAdd({
      url: backgroundUrl,
      startTime,
      endTime,
      opacity
    });

    // Reset form
    setBackgroundUrl(null);
    setStartTime(0);
    setEndTime(Math.min(10, videoDuration));
    setOpacity(0.7);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="relative rounded-lg border-2 border-dashed border-[#E31E24]/30 hover:border-[#E31E24] bg-black/30 hover:bg-black/50 cursor-pointer transition-all p-6 group"
      >
        {backgroundUrl ? (
          <>
            <div className="w-full h-32 rounded-lg overflow-hidden">
              <img src={backgroundUrl} alt="Background" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Upload className="w-8 h-8 text-[#E31E24]" />
            </div>
          </>
        ) : (
          <div className="text-center">
            {loading ? (
              <>
                <Loader className="w-8 h-8 text-[#E31E24] mx-auto mb-2 animate-spin" />
                <p className="text-white text-sm font-medium">מעלה רקע...</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-[#E31E24] mx-auto mb-2" />
                <p className="text-white text-sm font-medium">בחר תמונה</p>
                <p className="text-white/50 text-xs mt-1">PNG, JPG, WebP</p>
              </>
            )}
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      {/* Timeline Controls */}
      <div className="space-y-3 bg-black/20 rounded-lg p-3">
        <div>
          <label className="text-white/70 text-xs font-semibold block mb-2">
            זמן התחלה: {startTime.toFixed(1)}s
          </label>
          <input
            type="range"
            min="0"
            max={videoDuration || 30}
            step="0.1"
            value={startTime}
            onChange={(e) => setStartTime(Math.min(parseFloat(e.target.value), endTime - 0.1))}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-white/70 text-xs font-semibold block mb-2">
            זמן סיום: {endTime.toFixed(1)}s
          </label>
          <input
            type="range"
            min="0"
            max={videoDuration || 30}
            step="0.1"
            value={endTime}
            onChange={(e) => setEndTime(Math.max(parseFloat(e.target.value), startTime + 0.1))}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-white/70 text-xs font-semibold block mb-2">
            שקיפות: {(opacity * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Add Button */}
      <Button
        onClick={handleAdd}
        disabled={!backgroundUrl}
        className="w-full bg-[#E31E24] hover:bg-red-800 disabled:opacity-50"
      >
        הוסף רקע
      </Button>
    </div>
  );
}