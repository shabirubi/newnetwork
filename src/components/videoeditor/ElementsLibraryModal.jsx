import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';

export default function ElementsLibraryModal({ onClose, onApply }) {
  const [activeTab, setActiveTab] = useState('professional');

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

  const professionalElements = [
    { id: 1, name: 'Lower Third', icon: '📝', category: 'Lower Third', desc: 'כיתובית תחתונה מקצועית' },
    { id: 2, name: 'News Ticker', icon: '📰', category: 'Ticker', desc: 'רצועת חדשות זורמת' },
    { id: 3, name: 'Subscribe CTA', icon: '🔔', category: 'CTA', desc: 'כפתור הרשמה מונפש' },
    { id: 4, name: 'Like & Share', icon: '👍', category: 'Social', desc: 'לייק ושיתוף מונפש' },
    { id: 5, name: 'Progress Bar', icon: '📊', category: 'Progress', desc: 'פס התקדמות' },
    { id: 6, name: 'Countdown Timer', icon: '⏰', category: 'Timer', desc: 'טיימר ספירה לאחור' },
    { id: 7, name: 'Light Leak', icon: '💡', category: 'Effect', desc: 'דליפת אור קולנועית' },
    { id: 8, name: 'Lens Flare', icon: '✨', category: 'Effect', desc: 'אפקט עדשה' },
    { id: 9, name: 'Confetti', icon: '🎉', category: 'Particle', desc: 'קונפטי מונפש' },
    { id: 10, name: 'Snow Fall', icon: '❄️', category: 'Particle', desc: 'שלג יורד' },
    { id: 11, name: 'Fire Effect', icon: '🔥', category: 'Particle', desc: 'אש מונפשת' },
    { id: 12, name: 'Audio Wave', icon: '🎵', category: 'Visualizer', desc: 'ויזואליזציית אודיו' },
    { id: 13, name: 'Split Screen', icon: '⬛', category: 'Layout', desc: 'מסך מפוצל' },
    { id: 14, name: 'PIP Frame', icon: '🖼️', category: 'Frame', desc: 'מסגרת תמונה-בתוך-תמונה' },
    { id: 15, name: '3D Text', icon: '🔤', category: 'Text', desc: 'טקסט תלת-ממדי' },
    { id: 16, name: 'Glitch Text', icon: '⚡', category: 'Text', desc: 'טקסט גליץ' },
    { id: 17, name: 'Neon Sign', icon: '💫', category: 'Text', desc: 'שלט ניאון' },
    { id: 18, name: 'Film Grain', icon: '📽️', category: 'Effect', desc: 'גרעיניות סרט' },
    { id: 19, name: 'Vignette', icon: '⭕', category: 'Effect', desc: 'אפקט וינייט' },
    { id: 20, name: 'Color Grading', icon: '🎨', category: 'Effect', desc: 'דירוג צבע מקצועי' },
    { id: 21, name: 'Green Screen', icon: '🟢', category: 'Background', desc: 'מסך ירוק/כרומה' },
    { id: 22, name: 'Blur Background', icon: '🌫️', category: 'Background', desc: 'רקע מטושטש' },
    { id: 23, name: 'Zoom Burst', icon: '💥', category: 'Transition', desc: 'מעבר זום פיצוץ' },
    { id: 24, name: 'Follow Button', icon: '➕', category: 'Social', desc: 'כפתור עקוב מונפש' }
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

  const handleAddProfessional = (element) => {
    const elementConfig = {
      id: Date.now(),
      type: 'professional',
      category: element.category,
      name: element.name,
      position: { x: 50, y: element.category === 'Lower Third' || element.category === 'Ticker' ? 90 : 50 },
      // Default configs per category
      ...(element.category === 'Lower Third' && {
        text: 'שם המשתמש',
        subtitle: 'תפקיד',
        style: 'modern',
        color: '#E31E24'
      }),
      ...(element.category === 'Ticker' && {
        text: 'חדשות אחרונות: ',
        speed: 2
      }),
      ...(element.category === 'CTA' && {
        text: 'לחץ להרשמה',
        buttonColor: '#FF0000',
        animated: true
      }),
      ...(element.category === 'Progress' && {
        value: 0,
        max: 100,
        color: '#00FF00'
      }),
      ...(element.category === 'Timer' && {
        startTime: 60,
        format: 'mm:ss'
      }),
      ...(element.category === 'Particle' && {
        density: 50,
        speed: 1
      })
    };
    
    onApply(elementConfig);
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          <Button
            onClick={() => setActiveTab('professional')}
            className={`${activeTab === 'professional' ? 'bg-yellow-600' : 'bg-white/10'}`}
          >
            🎬 מקצועי
          </Button>
          <Button
            onClick={() => setActiveTab('stickers')}
            className={`${activeTab === 'stickers' ? 'bg-yellow-600' : 'bg-white/10'}`}
          >
            🎭 סטיקרים
          </Button>
          <Button
            onClick={() => setActiveTab('shapes')}
            className={`${activeTab === 'shapes' ? 'bg-yellow-600' : 'bg-white/10'}`}
          >
            🔷 צורות
          </Button>
          <Button
            onClick={() => setActiveTab('animations')}
            className={`${activeTab === 'animations' ? 'bg-yellow-600' : 'bg-white/10'}`}
          >
            ✨ אנימציות
          </Button>
        </div>

        {/* Professional Elements Grid */}
        {activeTab === 'professional' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {professionalElements.map(element => (
                <button
                  key={element.id}
                  onClick={() => handleAddProfessional(element)}
                  className="bg-gradient-to-br from-white/10 to-white/5 hover:from-yellow-600/40 hover:to-yellow-600/20 border border-white/20 hover:border-yellow-500/50 rounded-xl p-4 transition-all group text-right"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div className="text-3xl group-hover:scale-110 transition-transform">{element.icon}</div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white mb-1">{element.name}</div>
                      <div className="text-[10px] text-gray-400 mb-1">{element.desc}</div>
                      <div className="text-[9px] px-2 py-0.5 bg-yellow-600/30 text-yellow-300 rounded-full inline-block">
                        {element.category}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-4">
              <div className="text-yellow-300 font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <span>אלמנטים מקצועיים מ-Premiere Pro & After Effects</span>
              </div>
              <div className="text-xs text-gray-300 space-y-1">
                <p>✅ Lower Thirds - כיתוביות מקצועיות לשמות ותפקידים</p>
                <p>✅ CTA & Social Media - כפתורים מונפשים להרשמה ולייק</p>
                <p>✅ Progress Bars & Timers - פסי התקדמות וטיימרים</p>
                <p>✅ Particles & Effects - קונפטי, שלג, אש, light leaks</p>
                <p>✅ Text Presets - טקסטים תלת-ממדיים, גליץ' וניאון</p>
                <p>✅ Backgrounds & Layouts - מסכים ירוקים ומסכים מפוצלים</p>
              </div>
            </div>
          </div>
        )}

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

        {activeTab !== 'professional' && (
          <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-xs text-yellow-300">
            💡 טיפ: לחץ על אלמנט כדי להוסיף אותו לסרטון. תוכל לגרור ולשנות גודל בתצוגה המקדימה
          </div>
        )}
      </div>
    </div>
  );
}