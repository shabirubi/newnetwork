import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Volume2, Globe } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const languages = [
  { code: 'en', label: '🇺🇸 English', nativeName: 'English' },
  { code: 'he', label: '🇮🇱 Hebrew', nativeName: 'עברית' },
  { code: 'ar', label: '🇸🇦 Arabic', nativeName: 'العربية' },
  { code: 'es', label: '🇪🇸 Spanish', nativeName: 'Español' },
  { code: 'fr', label: '🇫🇷 French', nativeName: 'Français' },
  { code: 'de', label: '🇩🇪 German', nativeName: 'Deutsch' },
  { code: 'it', label: '🇮🇹 Italian', nativeName: 'Italiano' },
  { code: 'pt', label: '🇵🇹 Portuguese', nativeName: 'Português' },
  { code: 'ja', label: '🇯🇵 Japanese', nativeName: '日本語' },
  { code: 'zh', label: '🇨🇳 Chinese', nativeName: '中文' },
  { code: 'ru', label: '🇷🇺 Russian', nativeName: 'Русский' },
  { code: 'ko', label: '🇰🇷 Korean', nativeName: '한국어' },
];

export default function AdvancedTTSModal({ onClose, onApply }) {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en');
  const [voices, setVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(null);
  const [generatingAudio, setGeneratingAudio] = useState(false);

  // Load voices from ElevenLabs
  useEffect(() => {
    const loadVoices = async () => {
      setLoading(true);
      try {
        const { data } = await base44.functions.invoke('listElevenLabsVoices', {});
        setVoices(data.voices || []);
        if (data.voices?.length > 0) {
          setSelectedVoiceId(data.voices[0].id);
        }
      } catch (error) {
        toast.error('שגיאה בטעינת הקולות: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    loadVoices();
  }, []);

  // Filter voices by language
  const filteredVoices = voices.filter(voice => {
    const voiceLanguage = voice.language?.toLowerCase() || 'multilingual';
    return voiceLanguage === language || voiceLanguage === 'multilingual';
  });

  const maleVoices = filteredVoices.filter(v => v.gender === 'male' || v.gender?.toLowerCase().includes('male'));
  const femaleVoices = filteredVoices.filter(v => v.gender === 'female' || v.gender?.toLowerCase().includes('female'));
  const otherVoices = filteredVoices.filter(v => !v.gender || (v.gender !== 'male' && v.gender !== 'female'));

  const generateAudio = async () => {
    if (!text.trim()) {
      toast.error('אנא הזן טקסט');
      return;
    }
    if (!selectedVoiceId) {
      toast.error('אנא בחר קול');
      return;
    }

    setGeneratingAudio(true);
    try {
      await onApply(text, selectedVoiceId);
      onClose();
    } catch (error) {
      toast.error('שגיאה: ' + error.message);
    } finally {
      setGeneratingAudio(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gradient-to-br from-purple-900/90 to-black border border-purple-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Volume2 size={24} className="text-purple-400" />
          דיבוב מתקדם - ElevenLabs
        </h3>

        <div className="space-y-4">
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Globe size={16} className="text-purple-400" />
              שפה
            </label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-black/60 border-purple-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-purple-500/30">
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code} className="text-white hover:bg-purple-600/30">
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              הטקסט לדיבוב
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="הזן את הטקסט שתרצה להשמיע..."
              className="bg-black/60 border-purple-500/30 text-white placeholder-white/40 resize-none min-h-[120px]"
            />
            <div className="text-xs text-gray-400 mt-1">
              {text.length} תווים (מקסימום 10,000)
            </div>
          </div>

          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              בחר קול
            </label>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={32} className="animate-spin text-purple-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Male Voices */}
                {maleVoices.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-purple-300 mb-2 uppercase">🔵 קולות זכר</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {maleVoices.map(voice => (
                        <button
                          key={voice.id}
                          onClick={() => setSelectedVoiceId(voice.id)}
                          className={`p-3 rounded-lg text-left transition-all border ${
                            selectedVoiceId === voice.id
                              ? 'bg-purple-600/40 border-purple-400'
                              : 'bg-white/5 border-purple-500/20 hover:bg-white/10'
                          }`}
                        >
                          <div className="font-semibold text-white text-sm">{voice.name}</div>
                          <div className="text-xs text-gray-400">{voice.accent}</div>
                          {voice.preview_url && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const audio = new Audio(voice.preview_url);
                                audio.play();
                                setPreviewPlaying(voice.id);
                                audio.onended = () => setPreviewPlaying(null);
                              }}
                              className="text-xs text-purple-300 hover:text-purple-200 mt-1"
                            >
                              {previewPlaying === voice.id ? '⏸️ מתנגן...' : '▶️ ת听דוגמה'}
                            </button>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Female Voices */}
                {femaleVoices.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-pink-300 mb-2 uppercase">🔴 קולות נקבה</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {femaleVoices.map(voice => (
                        <button
                          key={voice.id}
                          onClick={() => setSelectedVoiceId(voice.id)}
                          className={`p-3 rounded-lg text-left transition-all border ${
                            selectedVoiceId === voice.id
                              ? 'bg-pink-600/40 border-pink-400'
                              : 'bg-white/5 border-purple-500/20 hover:bg-white/10'
                          }`}
                        >
                          <div className="font-semibold text-white text-sm">{voice.name}</div>
                          <div className="text-xs text-gray-400">{voice.accent}</div>
                          {voice.preview_url && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const audio = new Audio(voice.preview_url);
                                audio.play();
                                setPreviewPlaying(voice.id);
                                audio.onended = () => setPreviewPlaying(null);
                              }}
                              className="text-xs text-pink-300 hover:text-pink-200 mt-1"
                            >
                              {previewPlaying === voice.id ? '⏸️ מתנגן...' : '▶️ תקליט דוגמה'}
                            </button>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Voices */}
                {otherVoices.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-300 mb-2 uppercase">⚪ קולות אחרים</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {otherVoices.map(voice => (
                        <button
                          key={voice.id}
                          onClick={() => setSelectedVoiceId(voice.id)}
                          className={`p-3 rounded-lg text-left transition-all border ${
                            selectedVoiceId === voice.id
                              ? 'bg-gray-600/40 border-gray-400'
                              : 'bg-white/5 border-purple-500/20 hover:bg-white/10'
                          }`}
                        >
                          <div className="font-semibold text-white text-sm">{voice.name}</div>
                          <div className="text-xs text-gray-400">{voice.accent}</div>
                          {voice.preview_url && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const audio = new Audio(voice.preview_url);
                                audio.play();
                                setPreviewPlaying(voice.id);
                                audio.onended = () => setPreviewPlaying(null);
                              }}
                              className="text-xs text-gray-400 hover:text-gray-300 mt-1"
                            >
                              {previewPlaying === voice.id ? '⏸️ מתנגן...' : '▶️ תקליט דוגמה'}
                            </button>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-white/20 text-white hover:bg-white/10"
          >
            ביטול
          </Button>
          <Button
            onClick={generateAudio}
            disabled={generatingAudio || !selectedVoiceId || !text.trim()}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
          >
            {generatingAudio ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                יוצר דיבוב...
              </>
            ) : (
              <>
                <Volume2 size={18} className="mr-2" />
                צור דיבוב
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}