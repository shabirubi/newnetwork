import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Scissors, Clock, GripVertical, Trash2, Copy, ImageIcon, Volume2, Eye, RotateCcw, Lock, Unlock, Layers } from 'lucide-react';
import { toast } from 'sonner';

export default function TimelineEditor({ 
  clips, 
  selectedClipIndex, 
  onSelectClip, 
  onUpdateClip,
  onRemoveClip,
  totalDuration 
}) {
  const [cuttingMode, setCuttingMode] = useState(false);
  const [cutStart, setCutStart] = useState(0);
  const [cutEnd, setCutEnd] = useState(0);

  const selectedClip = selectedClipIndex !== null ? clips[selectedClipIndex] : null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDurationChange = (newDuration) => {
    if (selectedClip && selectedClipIndex !== null) {
      onUpdateClip(selectedClipIndex, { ...selectedClip, duration: Math.max(0.5, newDuration) });
    }
  };

  const handleApplyCut = () => {
    if (!selectedClip || selectedClipIndex === null) return;
    if (cutStart >= cutEnd) {
      toast.error('זמן התחלה חייב להיות קטן מזמן הסיום');
      return;
    }
    const newDuration = cutEnd - cutStart;
    onUpdateClip(selectedClipIndex, { 
      ...selectedClip, 
      duration: newDuration,
      startTime: cutStart || 0
    });
    setCuttingMode(false);
    toast.success('הקליפ חותך בהצלחה! ✂️');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Clip Duration Control */}
      {selectedClip && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock size={16} className="text-[#E31E24]" />
              משך זמן הקליפ
            </label>
            <span className="text-xs text-gray-400">
              {formatTime(selectedClip.duration || 0)}
            </span>
          </div>

          <Slider
            value={[selectedClip.duration || 0]}
            onValueChange={(val) => handleDurationChange(val[0])}
            min={0.5}
            max={selectedClip.type === 'video' ? selectedClip.originalDuration || 120 : 60}
            step={0.1}
            className="w-full"
          />

          <div className="flex gap-2 mt-3 text-[10px] text-gray-500">
            <span>דקיקה אחת = 60 שניות</span>
            <span>•</span>
            <span>{selectedClip.type === 'image' ? 'תמונה' : 'סרטון'}</span>
          </div>
        </div>
      )}

      {/* Trim/Cut Controls */}
      {selectedClip && selectedClip.type === 'video' && (
        <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
          <button
            onClick={() => {
              setCuttingMode(!cuttingMode);
              if (!cuttingMode) {
                setCutStart(0);
                setCutEnd(selectedClip.duration || 10);
              }
            }}
            className="flex items-center gap-2 text-sm font-semibold text-white mb-3 hover:text-blue-300 transition-colors"
          >
            <Scissors size={16} />
            {cuttingMode ? 'ביטול חיתוך' : 'חתוך סרטון'}
          </button>

          {cuttingMode && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">זמן התחלה</label>
                <div className="flex gap-2 items-center">
                  <Slider
                    value={[cutStart]}
                    onValueChange={(val) => setCutStart(Math.min(val[0], cutEnd - 0.1))}
                    min={0}
                    max={selectedClip.originalDuration || selectedClip.duration || 10}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-xs text-white w-12 text-right">
                    {formatTime(cutStart)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">זמן סיום</label>
                <div className="flex gap-2 items-center">
                  <Slider
                    value={[cutEnd]}
                    onValueChange={(val) => setCutEnd(Math.max(val[0], cutStart + 0.1))}
                    min={0}
                    max={selectedClip.originalDuration || selectedClip.duration || 10}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-xs text-white w-12 text-right">
                    {formatTime(cutEnd)}
                  </span>
                </div>
              </div>

              <div className="text-xs text-blue-300 bg-blue-600/20 p-2 rounded">
                משך סופי: {formatTime(cutEnd - cutStart)}
              </div>

              <Button
                onClick={handleApplyCut}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                <Scissors size={14} className="mr-2" />
                הפעל חיתוך
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Clips List with Timing */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Clock size={16} className="text-[#E31E24]" />
          פירוט הקליפים ({clips.length})
        </h4>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {clips.length === 0 ? (
            <p className="text-xs text-gray-500">אין קליפים בעורך</p>
          ) : (
            clips.map((clip, index) => {
              const cumulativeTime = clips.slice(0, index).reduce((acc, c) => acc + (c.duration || 0), 0);
              const nextTime = cumulativeTime + (clip.duration || 0);

              return (
                <div
                  key={clip.id}
                  onClick={() => onSelectClip(index)}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all ${
                    selectedClipIndex === index
                      ? 'bg-[#E31E24]/30 border border-[#E31E24]/50'
                      : 'bg-black/40 border border-white/10 hover:border-white/20'
                  }`}
                >
                  <GripVertical size={14} className="text-gray-500 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate">
                        {index + 1}. {clip.name}
                      </span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                        {clip.type === 'image' ? '🖼️' : '🎬'}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {formatTime(cumulativeTime)} → {formatTime(nextTime)}
                      <span className="mx-1">•</span>
                      <span className="font-semibold text-gray-300">
                        {formatTime(clip.duration || 0)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveClip(index);
                    }}
                    className="p-1 hover:bg-red-600/30 rounded transition-colors flex-shrink-0"
                  >
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {clips.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>סה"כ משך הסרטון:</span>
              <span className="font-semibold text-white">{formatTime(totalDuration)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}