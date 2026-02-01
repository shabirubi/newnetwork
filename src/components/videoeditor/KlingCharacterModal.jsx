import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, Sparkles, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function KlingCharacterModal({ onClose, onApply }) {
  const [prompt, setPrompt] = useState('');
  const [videoId, setVideoId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('הזן תיאור תנועה');
      return;
    }

    setLoading(true);
    try {
      toast.info('יוצר דמות מדברת עם HeyGen... עד דקה ⏳');
      const { data } = await base44.functions.invoke('generateHeyGenCharacter', {
        script: prompt
      });

      if (data.video_url) {
        const newClip = {
          id: Date.now(),
          url: data.video_url,
          duration: data.duration || 5,
          name: 'דמות - ' + prompt.substring(0, 30),
          filters: { brightness: 100, contrast: 100, saturation: 100 },
          volume: 100,
          type: 'video'
        };
        onApply(newClip);
        onClose();
        toast.success('דמות מונפשת נוספה! 🎭');
      } else if (data.still_processing) {
        setVideoId(data.video_id);
        toast.info('הוידאו בעיבוד - בדוק הודעה במייל שלך כשהוא מוכן');
      } else {
        toast.error('לא התקבל סרטון');
      }
    } catch (error) {
      toast.error('שגיאה: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!videoId) {
      toast.error('אין ID של וידאו');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('checkHeyGenVideo', {
        video_id: videoId
      });

      if (data.video_url) {
        const newClip = {
          id: Date.now(),
          url: data.video_url,
          duration: data.duration || 5,
          name: 'דמות - ' + prompt.substring(0, 30),
          filters: { brightness: 100, contrast: 100, saturation: 100 },
          volume: 100,
          type: 'video'
        };
        onApply(newClip);
        onClose();
        toast.success('דמות מונפשת נוספה! 🎭');
      } else if (data.still_processing) {
        toast.info('עדיין בעיבוד... נסה שוב בעוד דקה');
      } else {
        toast.error('לא התקבל סרטון');
      }
    } catch (error) {
      toast.error('שגיאה: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <User size={24} className="text-purple-400" />
              דמות מדברת HeyGen
            </h3>
            <p className="text-sm text-gray-400 mt-1">תאר מה הדמות תעשה ויוצר אותה AI</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={24} className="text-white" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Script */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">📝 הטקסט שהדמות תדבר</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="לדוגמה: שלום, אני דמות מדברת. אני יכולה להניף יד ולחייך בזמן שאני מדברת."
              className="bg-black/60 border-white/20 text-white placeholder-white/40 resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-400 mt-1">💡 כתוב את הטקסט בדיוק כפי שתרצה שהדמות תדבר אותו</p>
          </div>

          {/* Tips */}
          <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-sm text-purple-200 font-semibold mb-2 flex items-center gap-2">
              <Sparkles size={16} />
              איך זה עובד:
            </p>
            <ul className="text-xs text-purple-300 space-y-1">
              <li>✨ HeyGen יוצר דמות מדברת עם אבטار מובנה</li>
              <li>🎤 הטקסט שלך יוקרא בקול טבעי (Chill Brian voice)</li>
              <li>🎬 הדמות תזוז ותדבר בהתאם לטקסט</li>
              <li>⏱️ התהליך לוקח בדרך כלל עד דקה</li>
              <li>💾 הסרטון מוסף ישירות לעורך</li>
            </ul>
          </div>

          {videoId && (
            <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-200 mb-2">✉️ קיבלת מייל? הסרטון כנראה מוכן!</p>
              <Button
                onClick={handleCheckStatus}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    בודק...
                  </>
                ) : (
                  'בדוק סטטוס'
                )}
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
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
                  יוצר דמות...
                </>
              ) : (
                <>
                  <Sparkles size={18} className="mr-2" />
                  צור דמות
                </>
              )}
            </Button>
          </div>
          </div>
          </div>
          </div>
          );
          }