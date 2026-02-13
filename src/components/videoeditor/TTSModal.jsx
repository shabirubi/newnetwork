import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Volume2 } from 'lucide-react';

export default function TTSModal({ onClose, onApply }) {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('Rachel');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    
    setGenerating(true);
    await onApply(text, voice);
    setGenerating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Volume2 className="text-purple-500" />
          דיבוב קולי (TTS)
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">טקסט לדיבוב</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="הכנס את הטקסט שברצונך להמיר לדיבוב..."
              className="bg-white/5 border-white/20 text-white min-h-[120px]"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">קול</label>
            <Select value={voice} onValueChange={setVoice}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="he-IL-AvriNeural">עברית - אברי (זכר)</SelectItem>
                <SelectItem value="he-IL-HilaNeural">עברית - הילה (נקבה)</SelectItem>
                <SelectItem value="Rachel">רחל (אנגלית)</SelectItem>
                <SelectItem value="Adam">אדם (אנגלית)</SelectItem>
                <SelectItem value="Antoni">אנטוני (אנגלית)</SelectItem>
                <SelectItem value="Bella">בלה (אנגלית)</SelectItem>
              </SelectContent>
            </Select>
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
            disabled={generating || !text.trim()}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            {generating ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                מייצר...
              </>
            ) : (
              'צור דיבוב'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}