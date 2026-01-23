import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function NewsStripOverlay({ onAdd, videoDuration = 30 }) {
  const [headlines, setHeadlines] = useState(["חדשה חמה 1", "חדשה חמה 2", "חדשה חמה 3"]);
  const [headlineInput, setHeadlineInput] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(Math.min(15, videoDuration));
  const [speed, setSpeed] = useState(1);
  const [backgroundColor, setBackgroundColor] = useState("#E31E24");
  const [textColor, setTextColor] = useState("#FFFFFF");

  const addHeadline = () => {
    if (!headlineInput.trim()) {
      toast.error("אנא הזן חדשה");
      return;
    }
    setHeadlines([...headlines, headlineInput]);
    setHeadlineInput("");
  };

  const removeHeadline = (index) => {
    setHeadlines(headlines.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    if (headlines.length === 0) {
      toast.error("אנא הוסף לפחות חדשה אחת");
      return;
    }
    if (startTime >= endTime) {
      toast.error("זמן ההתחלה חייב להיות קטן מזמן הסיום");
      return;
    }

    onAdd({
      headlines,
      startTime,
      endTime,
      speed,
      backgroundColor,
      textColor
    });

    // Reset
    setHeadlines(["חדשה חמה 1", "חדשה חמה 2", "חדשה חמה 3"]);
    setHeadlineInput("");
    setStartTime(0);
    setEndTime(Math.min(15, videoDuration));
  };

  return (
    <div className="space-y-4">
      {/* Headlines Input */}
      <div className="space-y-2">
        <label className="text-white/70 text-xs font-semibold block">הוסף חדשות</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={headlineInput}
            onChange={(e) => setHeadlineInput(e.target.value)}
            placeholder="הזן חדשה..."
            className="flex-1 bg-black/30 border border-[#E31E24]/30 rounded-lg px-2 py-1.5 text-white text-xs placeholder-white/30 focus:border-[#E31E24] focus:outline-none"
            dir="rtl"
            onKeyPress={(e) => e.key === "Enter" && addHeadline()}
          />
          <Button
            onClick={addHeadline}
            size="sm"
            className="bg-[#E31E24] hover:bg-red-800 px-3"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Headlines List */}
      <div className="bg-black/20 rounded-lg p-3 max-h-32 overflow-y-auto space-y-1">
        {headlines.length === 0 ? (
          <p className="text-white/50 text-xs text-center py-4">אין חדשות עדיין</p>
        ) : (
          headlines.map((headline, idx) => (
            <div key={idx} className="flex items-center justify-between bg-black/30 p-2 rounded border border-[#E31E24]/20 group">
              <p className="text-white text-xs truncate flex-1">{headline}</p>
              <button
                onClick={() => removeHeadline(idx)}
                className="ml-2 text-red-400 hover:text-red-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))
        )}
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
            מהירות סקרול: {speed.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-white/70 text-xs font-semibold block mb-1">צבע רקע</label>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="text-white/70 text-xs font-semibold block mb-1">צבע טקסט</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={handleAdd}
        disabled={headlines.length === 0}
        className="w-full bg-[#E31E24] hover:bg-red-800 disabled:opacity-50"
      >
        <Plus className="w-4 h-4 mr-2" />
        הוסף סטריפ ידיעות
      </Button>
    </div>
  );
}