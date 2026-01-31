import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Loader2, Sparkles, Film, X, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function AIVideoFromImagesModal({ onClose, onApply }) {
  const [prompt, setPrompt] = useState('');
  const [numFrames, setNumFrames] = useState(4);
  const [fps, setFps] = useState(2);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('אנא הזן תיאור לסרטון');
      return;
    }

    setLoading(true);
    try {
      toast.info(`יוצר ${numFrames} פריימים...`);
      
      const { data } = await base44.functions.invoke('createAIVideoFromImages', {
        prompt: prompt,
        num_frames: numFrames,
        fps: fps
      });

      if (data.frames && data.frames.length > 0) {
        // Create clips from frames
        const clips = data.frames.map((frame, index) => ({
          id: Date.now() + index,
          url: frame.url,
          duration: 1 / fps,
          name: `AI Frame ${index + 1}`,
          thumbnail: frame.url,
          filters: { brightness: 100, contrast: 100, saturation: 100 },
          volume: 0,
          type: 'image'
        }));

        // Apply all frames
        onApply(clips);
        toast.success(`${data.frames.length} פריימים נוצרו! 🎬`);
        onClose();
      } else {
        toast.error('לא הצליח ליצור פריימים');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('שגיאה: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gradient-to-br from-purple-900/90 to-black border border-purple-500/30 rounded-2xl p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap size={24} className="text-yellow-400" />
            מחולל סרטונים AI מתמונות
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
          <p className="text-sm text-yellow-200 font-semibold mb-2 flex items-center gap-2">
            <Sparkles size={16} />
            כיצד זה עובד?
          </p>
          <p className="text-xs text-yellow-300">
            המערכת מייצרת מספר תמונות AI עם וריאציות קלות ומחברת אותן לסרטון עם מעברים חלקים. 
            זו חלופה חינמית ליצירת סרטונים AI!
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              תיאור הסרטון
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="לדוגמה: דרקון זהוב עף מעל הרים מושלגים בשקיעה, תנועה איטית, קינמטי..."
              className="bg-black/60 border-purple-500/30 text-white placeholder-white/40 resize-none"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              מספר פריימים: {numFrames}
            </label>
            <Slider
              value={[numFrames]}
              onValueChange={(val) => setNumFrames(val[0])}
              min={2}
              max={8}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-gray-400 mt-1">
              יותר פריימים = סרטון חלק יותר (אך לוקח יותר זמן)
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              מהירות הצגה (FPS): {fps}
            </label>
            <Slider
              value={[fps]}
              onValueChange={(val) => setFps(val[0])}
              min={1}
              max={4}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-gray-400 mt-1">
              משך הסרטון: ~{(numFrames / fps).toFixed(1)} שניות
            </p>
          </div>

          <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-sm text-purple-200 font-semibold mb-2 flex items-center gap-2">
              <Film size={16} />
              טיפים ליצירת סרטון מושלם:
            </p>
            <ul className="text-xs text-purple-300 space-y-1">
              <li>• תאר תנועה: "הדמות מסתובבת", "המצלמה מתקרבת"</li>
              <li>• הוסף סגנון: "קינמטי", "דרמטי", "חלומי"</li>
              <li>• ציין תאורה: "אור זהוב", "בשקיעה", "אור ירח"</li>
              <li>• 4-6 פריימים מספיקים לרוב המקרים</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
              disabled={loading}
            >
              ביטול
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  יוצר פריימים...
                </>
              ) : (
                <>
                  <Zap size={18} className="mr-2" />
                  צור סרטון ({numFrames} פריימים)
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}