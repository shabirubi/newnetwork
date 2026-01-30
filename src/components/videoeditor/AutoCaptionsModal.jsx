import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Type } from 'lucide-react';
import { toast } from 'sonner';

export default function AutoCaptionsModal({ onClose, selectedClip, onApply }) {
  const [generating, setGenerating] = useState(false);
  const [language, setLanguage] = useState('he');
  const [style, setStyle] = useState('modern');

  const captionStyles = {
    modern: { fontSize: 28, color: '#ffffff', bg: '#000000', fontWeight: 'bold' },
    minimal: { fontSize: 24, color: '#ffffff', bg: 'transparent', fontWeight: 'normal' },
    bold: { fontSize: 32, color: '#FFD700', bg: '#000000', fontWeight: 'bold' },
    neon: { fontSize: 30, color: '#00FF00', bg: '#000000', fontWeight: 'bold' }
  };

  const handleGenerate = async () => {
    if (!selectedClip) {
      toast.error('בחר קליפ תחילה');
      return;
    }

    setGenerating(true);
    try {
      // Simulate caption generation (would be real API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockCaptions = [
        { id: Date.now(), type: 'caption', content: 'ברוכים הבאים לסרטון', position: { x: 50, y: 80 }, time: 0, duration: 2, style: captionStyles[style] },
        { id: Date.now() + 1, type: 'caption', content: 'זהו עורך הווידאו המתקדם שלנו', position: { x: 50, y: 80 }, time: 2, duration: 3, style: captionStyles[style] }
      ];

      onApply(mockCaptions);
      onClose();
    } catch (error) {
      toast.error('שגיאה ביצירת כיתובים');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Type className="text-blue-500" />
          כיתובים אוטומטיים
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">שפה</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="he">עברית</SelectItem>
                <SelectItem value="en">אנגלית</SelectItem>
                <SelectItem value="ar">ערבית</SelectItem>
                <SelectItem value="ru">רוסית</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">סגנון כיתוב</label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">מודרני</SelectItem>
                <SelectItem value="minimal">מינימליסטי</SelectItem>
                <SelectItem value="bold">בולט</SelectItem>
                <SelectItem value="neon">ניאון</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-300">
            💡 הכיתובים יתווספו אוטומטית על בסיס הדיבור בסרטון
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
            onClick={handleGenerate}
            disabled={generating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {generating ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                מייצר...
              </>
            ) : (
              'צור כיתובים'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}