import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { MoveHorizontal } from 'lucide-react';

export default function SpeedControlModal({ onClose, currentSpeed, onApply }) {
  const [speed, setSpeed] = useState(currentSpeed);

  const presets = [
    { label: '0.25x', value: 0.25 },
    { label: '0.5x', value: 0.5 },
    { label: '1x', value: 1 },
    { label: '1.5x', value: 1.5 },
    { label: '2x', value: 2 },
    { label: '3x', value: 3 }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <MoveHorizontal className="text-indigo-500" />
          שינוי מהירות סרטון
        </h3>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-400">מהירות נוכחית</span>
              <span className="text-2xl font-bold text-indigo-400">{speed}x</span>
            </div>
            <Slider
              value={[speed]}
              onValueChange={(val) => setSpeed(val[0])}
              min={0.25}
              max={3}
              step={0.25}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">מהירויות מוגדרות</label>
            <div className="grid grid-cols-3 gap-2">
              {presets.map(preset => (
                <Button
                  key={preset.value}
                  onClick={() => setSpeed(preset.value)}
                  className={`${speed === preset.value ? 'bg-indigo-600' : 'bg-white/10'}`}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 text-xs text-indigo-300">
            💡 מהירות נמוכה מ-1x היא Slow Motion, מהירות גבוהה יותר היא Time-lapse
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-white/20 text-white hover:bg-white/10"
          >
            ביטול
          </Button>
          <Button
            onClick={() => {
              onApply(speed);
              onClose();
            }}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            החל שינוי
          </Button>
        </div>
      </div>
    </div>
  );
}