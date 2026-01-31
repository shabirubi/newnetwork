import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Sparkles, Film, Volume2, X, Loader2, Zap, 
  Wand2, Clock, Settings, Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';

export default function LumaGeneratorModal({ 
  onClose, 
  onApply, 
  selectedClip, 
  loading,
  setLoading
}) {
  const [prompt, setPrompt] = useState('');
  const [voiceScript, setVoiceScript] = useState('');
  const [addVoice, setAddVoice] = useState(true);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [step, setStep] = useState('prompt'); // prompt, voice, confirm

  const handleCreate = async () => {
    if (!prompt.trim()) {
      toast.error('אנא הזן תיאור לסרטון');
      return;
    }

    setLoading(true);
    try {
      const finalVoiceScript = voiceScript.trim() || prompt;
      
      if (selectedClip && selectedClip.type === 'video') {
        toast.info('מאריך סרטון עם דיבוב... עד דקה');
      } else {
        toast.info('יוצר סרטון עם דיבוב... עד דקה');
      }

      const { data } = await base44.functions.invoke('createLumaVideo', { 
        prompt: prompt,
        aspectRatio: aspectRatio,
        imageUrl: selectedClip?.type === 'video' ? selectedClip.url : undefined,
        voice_script: addVoice ? finalVoiceScript : null
      });

      if (data?.video_url) {
        const newClip = {
          id: Date.now(),
          url: data.video_url,
          duration: 5,
          name: prompt.substring(0, 30),
          thumbnail: data.thumbnail_url || data.video_url,
          filters: { brightness: 100, contrast: 100, saturation: 100 },
          volume: 100,
          type: 'video'
        };

        if (data.audio_url && addVoice) {
          onApply({
            clip: newClip,
            audio: { url: data.audio_url, name: 'דיבוב - Luma', volume: 100, loop: false }
          });
          toast.success('סרטון + דיבוב נוספו! 🎬🎤');
        } else {
          onApply({ clip: newClip });
          if (!data.audio_url && addVoice) {
            toast.warning('סרטון נוצר אבל בעיה בדיבוב');
          } else {
            toast.success('סרטון נוצר בהצלחה! 🎬');
          }
        }
        onClose();
      } else if (data?.still_processing) {
        toast.info('הסרטון בתהליך... נסה שוב בעוד רגע');
      } else {
        toast.error('לא התקבל סרטון מהשרת');
      }
    } catch (error) {
      toast.error('שגיאה: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" 
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-purple-950 via-black to-purple-950/50 border border-purple-500/50 rounded-3xl max-w-3xl w-full shadow-2xl shadow-purple-500/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-pink-600/20" />
          <div className="relative p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Sparkles size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {selectedClip?.type === 'video' ? '🎞️ המשך סרטון' : '✨ יצירת סרטון AI'}
                </h2>
                <p className="text-purple-300 text-sm">עם Luma AI + דיבוג חכם</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Step 1: Prompt */}
          <div>
            <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Film size={18} className="text-purple-400" />
              תאר את הסרטון שלך
            </label>
            <Textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="לדוגמה: דרקון זהוב עף מעל הרים מושלגים בשקיעה דרמטית, בתנועה איטית, עם אור קסום..." 
              className="bg-black/80 border-2 border-purple-500/30 text-white placeholder-white/30 resize-none rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all text-base" 
              rows={5} 
            />
            <p className="text-xs text-purple-300 mt-3 flex items-center gap-2">
              <Lightbulb size={14} />
              ככל שתיאור יותר מפורט וחוזק תנועות ספציפיות, התוצאה תהיה יותר טובה
            </p>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Settings size={18} className="text-purple-400" />
              יחס תצוגה
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: '16:9', label: '📺 רחב (16:9)', desc: 'לסרטונים ויוטיוב' },
                { value: '9:16', label: '📱 אנכי (9:16)', desc: 'לTikTok וInsta' },
                { value: '1:1', label: '⬜ מרובע (1:1)', desc: 'לרשתות חברתיות' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAspectRatio(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    aspectRatio === option.value
                      ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/30'
                      : 'border-purple-500/30 bg-black/40 text-gray-300 hover:border-purple-500/50'
                  }`}
                >
                  <div className="font-bold text-lg mb-1">{option.label}</div>
                  <div className="text-xs opacity-75">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Settings */}
          <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={addVoice} 
                  onChange={(e) => setAddVoice(e.target.checked)}
                  className="w-5 h-5 rounded cursor-pointer accent-purple-500"
                />
                <div>
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <Volume2 size={16} className="text-purple-400" />
                    הוסף דיבוג אוטומטי
                  </span>
                  <span className="text-xs text-gray-400">ElevenLabs - דיבור טבעי וברור</span>
                </div>
              </label>
              <Zap size={18} className="text-yellow-400" />
            </div>
            
            {addVoice && (
              <Textarea
                value={voiceScript}
                onChange={(e) => setVoiceScript(e.target.value)}
                placeholder="הטקסט שיוקרא בסרטון... (אם ריק - יוקרא התיאור)"
                className="bg-black/60 border border-purple-500/30 text-white placeholder-white/30 rounded-lg text-sm"
                rows={3}
              />
            )}
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-5">
            <p className="text-sm font-bold text-blue-200 mb-3 flex items-center gap-2">
              <Wand2 size={16} className="text-blue-300" />
              💡 טיפים לסרטון מושלם:
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs text-blue-300">
              <div className="flex gap-2">
                <span className="text-blue-400">→</span>
                <span><strong>תנועות:</strong> "סיבוב, טיפול למטה לעלייה"</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-400">→</span>
                <span><strong>סגנון:</strong> "סינמטי, כרטוני, ריאליסטי"</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-400">→</span>
                <span><strong>תאורה:</strong> "זהוב, כחול בהיר, אפל"</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-400">→</span>
                <span><strong>טמפו:</strong> "איטי ודרוך, דינמי, מהיר"</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black/40 border-t border-purple-500/30 p-6 flex gap-3">
          <Button 
            onClick={onClose}
            disabled={loading}
            variant="outline" 
            className="flex-1 border-white/20 text-white hover:bg-white/10 py-6 rounded-xl font-semibold text-base"
          >
            ביטול
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={loading || !prompt.trim()}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-6 rounded-xl font-semibold text-base shadow-lg shadow-purple-500/30"
          >
            {loading ? (
              <><Loader2 size={20} className="ml-2 animate-spin" />יוצר מופלא...</>
            ) : (
              <><Sparkles size={20} className="ml-2" />צור סרטון עכשיו</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}