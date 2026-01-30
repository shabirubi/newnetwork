import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, MoveHorizontal } from 'lucide-react';

export default function EffectsLibraryModal({ onClose, onApplyEffect, onApplyTransition }) {
  const [activeTab, setActiveTab] = useState('effects');

  const effects = [
    { id: 'blur', name: 'טשטוש', icon: '🌫️' },
    { id: 'glitch', name: 'גליץ', icon: '⚡' },
    { id: 'vhs', name: 'VHS רטרו', icon: '📼' },
    { id: 'cinematic', name: 'קולנועי', icon: '🎬' },
    { id: 'sketch', name: 'סקיצה', icon: '✏️' },
    { id: 'neon', name: 'ניאון', icon: '💡' },
    { id: 'vintage', name: 'וינטג', icon: '📷' },
    { id: 'comic', name: 'קומיקס', icon: '💥' }
  ];

  const transitions = [
    { id: 'fade', name: 'דהייה', icon: '🌅' },
    { id: 'dissolve', name: 'המסה', icon: '💧' },
    { id: 'slide', name: 'החלקה', icon: '➡️' },
    { id: 'zoom', name: 'זום', icon: '🔍' },
    { id: 'wipe', name: 'ניגוב', icon: '🧹' },
    { id: 'spin', name: 'סיבוב', icon: '🌀' },
    { id: 'glitch', name: 'גליץ', icon: '⚡' },
    { id: 'morph', name: 'מורפינג', icon: '🔄' }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="text-pink-500" />
          ספריית אפקטים ומעברים
        </h3>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveTab('effects')}
            className={`flex-1 ${activeTab === 'effects' ? 'bg-pink-600' : 'bg-white/10'}`}
          >
            אפקטים
          </Button>
          <Button
            onClick={() => setActiveTab('transitions')}
            className={`flex-1 ${activeTab === 'transitions' ? 'bg-pink-600' : 'bg-white/10'}`}
          >
            מעברים
          </Button>
        </div>

        {/* Effects Grid */}
        {activeTab === 'effects' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {effects.map(effect => (
              <button
                key={effect.id}
                onClick={() => {
                  onApplyEffect(effect.id);
                  onClose();
                }}
                className="bg-white/5 hover:bg-pink-600/30 border border-white/10 hover:border-pink-500/50 rounded-xl p-4 transition-all group"
              >
                <div className="text-3xl mb-2">{effect.icon}</div>
                <div className="text-sm font-medium text-white group-hover:text-pink-300">{effect.name}</div>
              </button>
            ))}
          </div>
        )}

        {/* Transitions Grid */}
        {activeTab === 'transitions' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {transitions.map(transition => (
              <button
                key={transition.id}
                onClick={() => {
                  onApplyTransition(transition.id);
                  onClose();
                }}
                className="bg-white/5 hover:bg-pink-600/30 border border-white/10 hover:border-pink-500/50 rounded-xl p-4 transition-all group"
              >
                <div className="text-3xl mb-2">{transition.icon}</div>
                <div className="text-sm font-medium text-white group-hover:text-pink-300">{transition.name}</div>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            סגור
          </Button>
        </div>
      </div>
    </div>
  );
}