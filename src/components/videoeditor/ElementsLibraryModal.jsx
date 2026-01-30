import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';

export default function ElementsLibraryModal({ onClose, onApply }) {
  const [activeTab, setActiveTab] = useState('stickers');

  const stickers = [
    { id: 1, emoji: '🔥', name: 'אש' },
    { id: 2, emoji: '⭐', name: 'כוכב' },
    { id: 3, emoji: '💡', name: 'נורה' },
    { id: 4, emoji: '🎯', name: 'מטרה' },
    { id: 5, emoji: '✨', name: 'נוצץ' },
    { id: 6, emoji: '🚀', name: 'רקטה' },
    { id: 7, emoji: '💥', name: 'פיצוץ' },
    { id: 8, emoji: '🎬', name: 'קולנוע' },
    { id: 9, emoji: '📱', name: 'טלפון' },
    { id: 10, emoji: '💰', name: 'כסף' },
    { id: 11, emoji: '👍', name: 'לייק' },
    { id: 12, emoji: '❤️', name: 'לב' },
    { id: 13, emoji: '🎉', name: 'חגיגה' },
    { id: 14, emoji: '🔔', name: 'פעמון' },
    { id: 15, emoji: '⚡', name: 'ברק' },
    { id: 16, emoji: '🌟', name: 'כוכב נוצץ' }
  ];

  const shapes = [
    { id: 1, type: 'circle', name: 'עיגול', color: '#FF0000' },
    { id: 2, type: 'square', name: 'ריבוע', color: '#00FF00' },
    { id: 3, type: 'triangle', name: 'משולש', color: '#0000FF' },
    { id: 4, type: 'arrow', name: 'חץ', color: '#FFFF00' },
    { id: 5, type: 'star', name: 'כוכב', color: '#FF00FF' },
    { id: 6, type: 'heart', name: 'לב', color: '#FF0066' }
  ];

  const animations = [
    { id: 1, name: 'Fade In', icon: '📥', type: 'fadeIn' },
    { id: 2, name: 'Slide In', icon: '➡️', type: 'slideIn' },
    { id: 3, name: 'Bounce', icon: '🏀', type: 'bounce' },
    { id: 4, name: 'Zoom In', icon: '🔍', type: 'zoomIn' },
    { id: 5, name: 'Rotate', icon: '🔄', type: 'rotate' },
    { id: 6, name: 'Shake', icon: '📳', type: 'shake' }
  ];

  const handleAddSticker = (sticker) => {
    onApply({
      id: Date.now(),
      type: 'sticker',
      content: sticker.emoji,
      position: { x: 50, y: 50 },
      size: 60
    });
    onClose();
  };

  const handleAddShape = (shape) => {
    onApply({
      id: Date.now(),
      type: 'shape',
      shapeType: shape.type,
      color: shape.color,
      position: { x: 50, y: 50 },
      size: 100
    });
    onClose();
  };

  const handleAddAnimation = (animation) => {
    onApply({
      id: Date.now(),
      type: 'animation',
      animationType: animation.type,
      position: { x: 50, y: 50 }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="text-yellow-500" />
            ספריית אלמנטים
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveTab('stickers')}
            className={`flex-1 ${activeTab === 'stickers' ? 'bg-yellow-600' : 'bg-white/10'}`}
          >
            🎭 סטיקרים
          </Button>
          <Button
            onClick={() => setActiveTab('shapes')}
            className={`flex-1 ${activeTab === 'shapes' ? 'bg-yellow-600' : 'bg-white/10'}`}
          >
            🔷 צורות
          </Button>
          <Button
            onClick={() => setActiveTab('animations')}
            className={`flex-1 ${activeTab === 'animations' ? 'bg-yellow-600' : 'bg-white/10'}`}
          >
            ✨ אנימציות
          </Button>
        </div>

        {/* Stickers Grid */}
        {activeTab === 'stickers' && (
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {stickers.map(sticker => (
              <button
                key={sticker.id}
                onClick={() => handleAddSticker(sticker)}
                className="aspect-square bg-white/5 hover:bg-yellow-600/30 border border-white/10 hover:border-yellow-500/50 rounded-xl flex items-center justify-center transition-all group"
              >
                <div className="text-4xl group-hover:scale-125 transition-transform">{sticker.emoji}</div>
              </button>
            ))}
          </div>
        )}

        {/* Shapes Grid */}
        {activeTab === 'shapes' && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {shapes.map(shape => (
              <button
                key={shape.id}
                onClick={() => handleAddShape(shape)}
                className="aspect-square bg-white/5 hover:bg-yellow-600/30 border border-white/10 hover:border-yellow-500/50 rounded-xl p-4 transition-all group flex flex-col items-center justify-center gap-2"
              >
                <div 
                  className="w-16 h-16 group-hover:scale-110 transition-transform"
                  style={{ 
                    backgroundColor: shape.color,
                    clipPath: shape.type === 'circle' ? 'circle(50%)' :
                              shape.type === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                              shape.type === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' :
                              shape.type === 'arrow' ? 'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)' :
                              shape.type === 'heart' ? 'polygon(50% 100%, 83% 70%, 100% 45%, 100% 25%, 85% 5%, 65% 5%, 50% 20%, 35% 5%, 15% 5%, 0% 25%, 0% 45%, 17% 70%)' :
                              'none'
                  }}
                />
                <div className="text-xs text-white">{shape.name}</div>
              </button>
            ))}
          </div>
        )}

        {/* Animations Grid */}
        {activeTab === 'animations' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {animations.map(animation => (
              <button
                key={animation.id}
                onClick={() => handleAddAnimation(animation)}
                className="bg-white/5 hover:bg-yellow-600/30 border border-white/10 hover:border-yellow-500/50 rounded-xl p-6 transition-all group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{animation.icon}</div>
                <div className="text-sm font-medium text-white">{animation.name}</div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-xs text-yellow-300">
          💡 טיפ: לחץ על אלמנט כדי להוסיף אותו לסרטון. תוכל לגרור ולשנות גודל בתצוגה המקדימה
        </div>
      </div>
    </div>
  );
}