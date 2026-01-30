import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { X, Move, Maximize2, Circle, Square, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function PIPOverlay({ onClose, onApply }) {
  const [pipVideo, setPipVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    position: 'bottom-right', // top-left, top-right, bottom-left, bottom-right, custom
    size: 25, // percentage of main video
    shape: 'square', // square, circle
    borderWidth: 3,
    borderColor: '#ffffff',
    shadow: true,
    offsetX: 20,
    offsetY: 20,
    startTime: 0,
    endTime: 0,
    opacity: 100
  });

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      
      const video = document.createElement('video');
      const localUrl = URL.createObjectURL(file);
      video.src = localUrl;
      
      video.onloadedmetadata = () => {
        setPipVideo({
          url: uploadResult.file_url,
          localUrl: localUrl,
          duration: video.duration,
          name: file.name
        });
        setConfig(prev => ({ ...prev, endTime: video.duration }));
        toast.success('וידאו הועלה בהצלחה! 🎬');
        setLoading(false);
      };
      
      video.onerror = () => {
        toast.error('שגיאה בטעינת הסרטון');
        setLoading(false);
      };
    } catch (error) {
      toast.error('שגיאה בהעלאה');
      setLoading(false);
    }
  };

  const positions = [
    { id: 'top-left', name: 'שמאל למעלה', icon: '↖️' },
    { id: 'top-right', name: 'ימין למעלה', icon: '↗️' },
    { id: 'bottom-left', name: 'שמאל למטה', icon: '↙️' },
    { id: 'bottom-right', name: 'ימין למטה', icon: '↘️' }
  ];

  const handleApply = () => {
    if (!pipVideo) {
      toast.error('אנא העלה וידאו');
      return;
    }

    onApply({
      video: pipVideo,
      config: config
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Move size={24} className="text-purple-400" />
            וידאו בתוך וידאו (PIP)
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Video Upload */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              📹 העלה וידאו שני
            </label>
            {!pipVideo ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-500/50 rounded-xl bg-black/40 hover:bg-purple-500/10 transition-colors cursor-pointer">
                {loading ? (
                  <>
                    <Loader2 size={32} className="animate-spin text-purple-400 mb-2" />
                    <span className="text-sm text-gray-400">מעלה...</span>
                  </>
                ) : (
                  <>
                    <Maximize2 size={32} className="text-purple-400 mb-2" />
                    <span className="text-sm text-gray-400">לחץ להעלאת וידאו</span>
                    <span className="text-xs text-gray-500 mt-1">MP4, WebM, MOV</span>
                  </>
                )}
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={handleVideoUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>
            ) : (
              <div className="relative">
                <video
                  src={pipVideo.localUrl || pipVideo.url}
                  className="w-full rounded-lg"
                  controls
                />
                <button
                  onClick={() => setPipVideo(null)}
                  className="absolute top-2 right-2 bg-red-600/90 backdrop-blur-sm p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
                <div className="mt-2 text-xs text-gray-400">
                  {pipVideo.name} • {pipVideo.duration?.toFixed(1)}s
                </div>
              </div>
            )}
          </div>

          {pipVideo && (
            <>
              {/* Position */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  📍 מיקום
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {positions.map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => setConfig(prev => ({ ...prev, position: pos.id }))}
                      className={`p-4 rounded-xl text-center transition-all ${
                        config.position === pos.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-black/40 text-gray-400 hover:bg-black/60'
                      }`}
                    >
                      <div className="text-2xl mb-1">{pos.icon}</div>
                      <div className="text-xs font-semibold">{pos.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  📏 גודל ({config.size}% מהמסך)
                </label>
                <Slider
                  value={[config.size]}
                  onValueChange={(val) => setConfig(prev => ({ ...prev, size: val[0] }))}
                  min={10}
                  max={50}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Shape */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  🎭 צורה
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, shape: 'square' }))}
                    className={`p-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                      config.shape === 'square'
                        ? 'bg-purple-600 text-white'
                        : 'bg-black/40 text-gray-400 hover:bg-black/60'
                    }`}
                  >
                    <Square size={20} />
                    <span className="text-sm font-semibold">מרובע</span>
                  </button>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, shape: 'circle' }))}
                    className={`p-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                      config.shape === 'circle'
                        ? 'bg-purple-600 text-white'
                        : 'bg-black/40 text-gray-400 hover:bg-black/60'
                    }`}
                  >
                    <Circle size={20} />
                    <span className="text-sm font-semibold">עגול</span>
                  </button>
                </div>
              </div>

              {/* Border */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">עובי מסגרת</label>
                  <Slider
                    value={[config.borderWidth]}
                    onValueChange={(val) => setConfig(prev => ({ ...prev, borderWidth: val[0] }))}
                    min={0}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">צבע מסגרת</label>
                  <Input
                    type="color"
                    value={config.borderColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, borderColor: e.target.value }))}
                    className="h-10 w-full"
                  />
                </div>
              </div>

              {/* Shadow */}
              <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl">
                <span className="text-sm text-gray-300">צל</span>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, shadow: !prev.shadow }))}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    config.shadow
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {config.shadow ? 'פעיל' : 'כבוי'}
                </button>
              </div>

              {/* Timing */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  ⏱️ זמן הצגה
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">התחלה (שניות)</label>
                    <Input
                      type="number"
                      min="0"
                      max={config.endTime}
                      value={config.startTime}
                      onChange={(e) => setConfig(prev => ({ ...prev, startTime: parseFloat(e.target.value) }))}
                      className="bg-black/60 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">סיום (שניות)</label>
                    <Input
                      type="number"
                      min={config.startTime}
                      max={pipVideo.duration}
                      value={config.endTime}
                      onChange={(e) => setConfig(prev => ({ ...prev, endTime: parseFloat(e.target.value) }))}
                      className="bg-black/60 border-white/20 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Opacity */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  🌫️ שקיפות ({config.opacity}%)
                </label>
                <Slider
                  value={[config.opacity]}
                  onValueChange={(val) => setConfig(prev => ({ ...prev, opacity: val[0] }))}
                  min={10}
                  max={100}
                  step={10}
                  className="w-full"
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              ביטול
            </Button>
            <Button
              onClick={handleApply}
              disabled={!pipVideo}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
            >
              <Move size={18} className="mr-2" />
              החל PIP
            </Button>
          </div>

          {/* Info */}
          <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-xs text-purple-200 mb-2 font-semibold">💡 טיפים:</p>
            <ul className="text-xs text-purple-300 space-y-1">
              <li>• השתמש ב-PIP לריאקשנס, קומנטרים ופרזנטציות</li>
              <li>• מסגרת עגולה מתאימה לדמויות, מרובעת לתוכן</li>
              <li>• צל מוסיף עומק ויוצר הפרדה ויזואלית</li>
              <li>• כוונן את הזמן לסנכרון מושלם</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}