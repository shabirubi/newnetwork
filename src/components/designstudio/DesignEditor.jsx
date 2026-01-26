import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Type, Palette, Music, Share2, Copy, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function TextOverlayEditor({ imageUrl, onImageUpdate }) {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState("32");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [position, setPosition] = useState("center");

  const canvasRef = React.useRef(null);

  const applyText = async () => {
    if (!text.trim()) {
      toast.error("אנא הזן טקסט");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";

      let y = canvas.height / 2;
      if (position === "top") y = parseInt(fontSize) + 20;
      if (position === "bottom") y = canvas.height - 20;

      ctx.fillText(text, canvas.width / 2, y);

      const newImageUrl = canvas.toDataURL("image/png");
      onImageUpdate(newImageUrl);
      toast.success("✅ טקסט נוסף בהצלחה");
    };

    img.src = imageUrl;
  };

  return (
    <div className="space-y-4 p-4 bg-black/40 rounded-lg border border-purple-500/20">
      <div className="flex items-center gap-2 mb-4">
        <Type className="w-5 h-5 text-purple-400" />
        <h4 className="font-semibold text-white">הוסף טקסט</h4>
      </div>

      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="כתוב טקסט..."
        className="bg-black/60 border-purple-500/30"
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">גודל</label>
          <Input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            min="12"
            max="120"
            className="bg-black/60 border-purple-500/30"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">צבע</label>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-2 block">מיקום</label>
        <div className="flex gap-2">
          {["top", "center", "bottom"].map((pos) => (
            <button
              key={pos}
              onClick={() => setPosition(pos)}
              className={`flex-1 py-2 rounded text-xs font-semibold transition-all ${
                position === pos
                  ? "bg-purple-600 text-white"
                  : "bg-black/60 text-gray-400 border border-purple-500/20"
              }`}
            >
              {pos === "top" ? "👆" : pos === "center" ? "⏺️" : "👇"}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={applyText} className="w-full bg-purple-600 hover:bg-purple-700">
        <Type className="w-4 h-4 mr-2" />
        הוסף טקסט
      </Button>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export function FiltersPanel({ imageUrl, onImageUpdate }) {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);

  const applyFilters = () => {
    const filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.filter = filter;
      ctx.drawImage(img, 0, 0);
      const newImageUrl = canvas.toDataURL("image/png");
      onImageUpdate(newImageUrl);
      toast.success("✅ סינן החל בהצלחה");
    };

    img.src = imageUrl;
  };

  const filters = [
    { label: "🌞 בהירות", value: brightness, setValue: setBrightness },
    { label: "🎨 ניגודיות", value: contrast, setValue: setContrast },
    { label: "📸 רוויה", value: saturation, setValue: setSaturation },
    { label: "💫 ערפול", value: blur, setValue: setBlur, max: 20 },
  ];

  return (
    <div className="space-y-4 p-4 bg-black/40 rounded-lg border border-purple-500/20">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-purple-400" />
        <h4 className="font-semibold text-white">סיננים</h4>
      </div>

      {filters.map((filter) => (
        <div key={filter.label}>
          <label className="text-xs text-gray-400 block mb-2">{filter.label}</label>
          <input
            type="range"
            value={filter.value}
            onChange={(e) => filter.setValue(Number(e.target.value))}
            min="0"
            max={filter.max || 200}
            className="w-full"
          />
          <span className="text-xs text-gray-500">{filter.value}%</span>
        </div>
      ))}

      <Button onClick={applyFilters} className="w-full bg-purple-600 hover:bg-purple-700">
        <Palette className="w-4 h-4 mr-2" />
        החל סינן
      </Button>
    </div>
  );
}

export function ExportOptions({ imageUrl, designTitle }) {
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    { format: "PNG", type: "image/png", ext: "png" },
    { format: "JPG", type: "image/jpeg", ext: "jpg" },
    { format: "WebP", type: "image/webp", ext: "webp" },
  ];

  const handleExport = async (format, type, ext) => {
    setIsExporting(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Convert to desired format
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${designTitle || "design"}.${ext}`;
          a.click();
          window.URL.revokeObjectURL(url);
          toast.success(`✅ הדיזיין הורד כ-${format}`);
          setIsExporting(false);
        }, type);
      };

      img.src = imageUrl;
    } catch {
      toast.error("שגיאה בייצוא");
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-black/40 rounded-lg border border-purple-500/20">
      <h4 className="font-semibold text-white text-sm mb-3">📥 ייצוא בפורמט</h4>
      <div className="grid grid-cols-3 gap-2">
        {exportFormats.map(({ format, type, ext }) => (
          <Button
            key={ext}
            onClick={() => handleExport(format, type, ext)}
            disabled={isExporting}
            variant="outline"
            className="text-xs border-purple-500/30"
          >
            {format}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function ShareDesign({ imageUrl, designTitle }) {
  const [showShare, setShowShare] = useState(false);

  const generateQR = async () => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(imageUrl)}`;
      const a = document.createElement("a");
      a.href = qrUrl;
      a.download = "design-qr.png";
      a.click();
      toast.success("✅ קוד QR הורד");
    } catch {
      toast.error("שגיאה ביצירת QR");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(imageUrl);
    toast.success("✅ קישור הועתק");
  };

  return (
    <div className="space-y-3 p-4 bg-black/40 rounded-lg border border-purple-500/20">
      <h4 className="font-semibold text-white text-sm mb-3">🔗 שתף דיזיין</h4>
      <div className="flex gap-2">
        <Button
          onClick={copyLink}
          variant="outline"
          className="flex-1 border-purple-500/30 text-xs"
        >
          <Copy className="w-3 h-3 mr-1" />
          קישור
        </Button>
        <Button
          onClick={generateQR}
          variant="outline"
          className="flex-1 border-purple-500/30 text-xs"
        >
          QR קוד
        </Button>
      </div>
    </div>
  );
}