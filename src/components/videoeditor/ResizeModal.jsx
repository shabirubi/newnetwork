import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Film } from 'lucide-react';

export default function ResizeModal({ onClose, onApply }) {
  const [selected, setSelected] = useState('16:9');

  const ratios = [
    { id: '16:9', name: 'YouTube / רחב', icon: '🖥️', desc: '1920x1080' },
    { id: '9:16', name: 'TikTok / Stories', icon: '📱', desc: '1080x1920' },
    { id: '1:1', name: 'Instagram פוסט', icon: '⬛', desc: '1080x1080' },
    { id: '4:3', name: 'טלוויזיה קלאסית', icon: '📺', desc: '1440x1080' },
    { id: '21:9', name: 'קולנוע', icon: '🎬', desc: '2560x1080' },
    { id: '4:5', name: 'Instagram פורטרט', icon: '📄', desc: '1080x1350' }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Film className="text-green-500" />
          שינוי גודל סרטון
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {ratios.map(ratio => (
            <button
              key={ratio.id}
              onClick={() => setSelected(ratio.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selected === ratio.id 
                  ? 'bg-green-600/30 border-green-500' 
                  : 'bg-white/5 border-white/10 hover:border-green-500/50'
              }`}
            >
              <div className="text-3xl mb-2">{ratio.icon}</div>
              <div className="font-bold text-white mb-1">{ratio.id}</div>
              <div className="text-xs text-gray-400">{ratio.name}</div>
              <div className="text-xs text-gray-500 mt-1">{ratio.desc}</div>
            </button>
          ))}
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-xs text-green-300 mb-6">
          📐 כל הקליפים בפרויקט ישונו לגודל הנבחר
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-white/20 text-white hover:bg-white/10"
          >
            ביטול
          </Button>
          <Button
            onClick={() => {
              onApply(selected);
              onClose();
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            החל שינוי
          </Button>
        </div>
      </div>
    </div>
  );
}