import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const positions = ["top", "center", "bottom"];
const alignments = ["right", "center", "left"];

export default function TextOverlay({ onAdd, videoDuration = 30 }) {
  const [content, setContent] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(Math.min(10, videoDuration));
  const [fontSize, setFontSize] = useState(24);
  const [position, setPosition] = useState("bottom");
  const [alignment, setAlignment] = useState("right");
  const [color, setColor] = useState("#FFFFFF");
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [bgOpacity, setBgOpacity] = useState(0.6);

  const handleAdd = () => {
    if (!content.trim()) {
      toast.error("אנא כתוב טקסט");
      return;
    }
    if (startTime >= endTime) {
      toast.error("זמן ההתחלה חייב להיות קטן מזמן הסיום");
      return;
    }

    onAdd({
      content,
      startTime,
      endTime,
      fontSize,
      position,
      alignment,
      color,
      backgroundColor,
      bgOpacity
    });

    // Reset
    setContent("");
    setStartTime(0);
    setEndTime(Math.min(10, videoDuration));
    setFontSize(24);
  };

  return (
    <div className="space-y-4">
      {/* Text Input */}
      <div>
        <label className="text-white/70 text-xs font-semibold block mb-2">טקסט</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="הזן טקסט לתצוגה..."
          className="w-full bg-black/30 border border-[#E31E24]/30 rounded-lg p-2 text-white text-sm placeholder-white/30 focus:border-[#E31E24] focus:outline-none resize-none h-20"
          dir="rtl"
        />
      </div>

      {/* Timeline */}
      <div className="space-y-2 bg-black/20 rounded-lg p-3">
        <div>
          <label className="text-white/70 text-xs font-semibold block mb-1">
            התחלה: {startTime.toFixed(1)}s
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
          <label className="text-white/70 text-xs font-semibold block mb-1">
            סיום: {endTime.toFixed(1)}s
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
      </div>

      {/* Style Settings */}
      <div className="space-y-2 bg-black/20 rounded-lg p-3">
        <div>
          <label className="text-white/70 text-xs font-semibold block mb-1">
            גודל גופן: {fontSize}px
          </label>
          <input
            type="range"
            min="12"
            max="48"
            step="2"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-white/70 text-xs font-semibold block mb-1">מיקום</label>
          <div className="grid grid-cols-3 gap-1">
            {positions.map(pos => (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                className={`py-2 rounded text-xs font-semibold transition-all ${
                  position === pos
                    ? "bg-[#E31E24] text-white"
                    : "bg-black/30 border border-[#E31E24]/20 text-white/70 hover:text-white"
                }`}
              >
                {pos === "top" ? "למעלה" : pos === "center" ? "מרכז" : "למטה"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-white/70 text-xs font-semibold block mb-1">יישור</label>
          <div className="grid grid-cols-3 gap-1">
            {alignments.map(align => (
              <button
                key={align}
                onClick={() => setAlignment(align)}
                className={`py-2 rounded text-xs font-semibold transition-all ${
                  alignment === align
                    ? "bg-[#E31E24] text-white"
                    : "bg-black/30 border border-[#E31E24]/20 text-white/70 hover:text-white"
                }`}
              >
                {align === "right" ? "ימין" : align === "center" ? "מרכז" : "שמאל"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-white/70 text-xs font-semibold block mb-1">צבע טקסט</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="text-white/70 text-xs font-semibold block mb-1">צבע רקע</label>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="text-white/70 text-xs font-semibold block mb-1">
            שקיפות רקע: {(bgOpacity * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={bgOpacity}
            onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <Button
        onClick={handleAdd}
        disabled={!content.trim()}
        className="w-full bg-[#E31E24] hover:bg-red-800 disabled:opacity-50"
      >
        <Plus className="w-4 h-4 mr-2" />
        הוסף מלל
      </Button>
    </div>
  );
}