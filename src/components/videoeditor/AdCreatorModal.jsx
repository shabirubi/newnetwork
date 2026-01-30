import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const adTemplates = [
  {
    id: 'product',
    name: '🛍️ פרסומת מוצר',
    description: 'פרסומת למוצר או שירות',
    duration: 15,
    format: 'תן לי: שם המוצר, תיאור קצר, מחיר (אופציונלי)'
  },
  {
    id: 'corporate',
    name: '🏢 פרסומת חברה',
    description: 'פרסומת למסגרת עסקית',
    duration: 20,
    format: 'תן לי: שם החברה, תחום פעילות, הודעה'
  },
  {
    id: 'social',
    name: '📱 פרסומת לרשתות חברתיות',
    description: 'פרסומת קטנה ומהירה',
    duration: 10,
    format: 'תן לי: מה לפרסם, ציל קהל'
  },
  {
    id: 'event',
    name: '🎪 הזמנה לאירוע',
    description: 'פרסומת לאירוע או הרצאה',
    duration: 15,
    format: 'תן לי: שם האירוע, תאריך, מקום'
  },
  {
    id: 'public',
    name: '📢 מודעת ציבור',
    description: 'מודעה חברתית או ממשלתית',
    duration: 20,
    format: 'תן לי: הנושא, המסר, מטרה'
  },
];

export default function AdCreatorModal({ onClose, onApply }) {
  const [step, setStep] = useState(1); // 1: template, 2: details, 3: preview
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [adDetails, setAdDetails] = useState({
    headline: '',
    description: '',
    cta: 'צפה עכשיו',
    voice: 'male',
  });
  const [generating, setGenerating] = useState(false);
  const [generatedAd, setGeneratedAd] = useState(null);

  const handleGenerateAd = async () => {
    if (!adDetails.headline.trim()) {
      toast.error('אנא הזן כותרת');
      return;
    }

    setGenerating(true);
    try {
      const prompt = `צור תסריט קצר לפרסומת ${selectedTemplate.name}:
כותרת: ${adDetails.headline}
תיאור: ${adDetails.description}
קריאה לפעולה: ${adDetails.cta}

התסריט צריך להיות:
- מושך תשומת דעת
- קצר ותמציתי (${selectedTemplate.duration} שניות בערך)
- כתוב בעברית טובה
- עם תנועות וקוליות מומלצות

עיצב את התשובה ככה:
[תסריט]:
[תיאור ויזואלי]:
[קוליות]:`;

      const { data } = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
      });

      setGeneratedAd({
        script: data,
        template: selectedTemplate,
        ...adDetails,
      });
      setStep(3);
      toast.success('פרסומת נוצרה בהצלחה! 🎬');
    } catch (error) {
      toast.error('שגיאה: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleApplyAd = async () => {
    if (!generatedAd) return;

    // Create a video clip with the ad
    const adClip = {
      id: Date.now(),
      name: `פרסומת - ${adDetails.headline}`,
      type: 'generated',
      content: generatedAd.script,
      duration: selectedTemplate.duration,
      thumbnail: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='112'%3E%3Crect fill='%23E31E24' width='200' height='112'/%3E%3Ctext x='50%25' y='50%25' font-size='14' fill='white' text-anchor='middle' dominant-baseline='middle'%3EAD%3C/text%3E%3C/svg%3E`,
      filters: { brightness: 100, contrast: 100, saturation: 100 },
      volume: 100,
    };

    onApply(adClip);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gradient-to-br from-red-900/90 to-black border border-red-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles size={24} className="text-red-400" />
            יוצר פרסומות AI
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Step 1: Template Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-white text-lg">בחר סוג פרסומת</h4>
            <div className="grid gap-3">
              {adTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setStep(2);
                  }}
                  className="p-4 rounded-lg border border-red-500/30 bg-white/5 hover:bg-red-600/20 hover:border-red-400 transition-all text-left"
                >
                  <div className="font-bold text-white mb-1">{template.name}</div>
                  <div className="text-sm text-gray-300 mb-2">{template.description}</div>
                  <div className="text-xs text-gray-400">⏱️ {template.duration} שניות</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && selectedTemplate && (
          <div className="space-y-4">
            <h4 className="font-semibold text-white text-lg">פרטי הפרסומה</h4>
            <p className="text-sm text-gray-300">{selectedTemplate.format}</p>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">כותרת</label>
              <Input
                value={adDetails.headline}
                onChange={(e) => setAdDetails({ ...adDetails, headline: e.target.value })}
                placeholder="כותרת הפרסומה..."
                className="bg-black/60 border-red-500/30 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">תיאור / פרטים</label>
              <Textarea
                value={adDetails.description}
                onChange={(e) => setAdDetails({ ...adDetails, description: e.target.value })}
                placeholder="תיאור מפורט של הפרסומה..."
                className="bg-black/60 border-red-500/30 text-white resize-none"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">קריאה לפעולה</label>
                <Input
                  value={adDetails.cta}
                  onChange={(e) => setAdDetails({ ...adDetails, cta: e.target.value })}
                  placeholder="לדוגמה: צפה עכשיו"
                  className="bg-black/60 border-red-500/30 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">קול</label>
                <Select value={adDetails.voice} onValueChange={(v) => setAdDetails({ ...adDetails, voice: v })}>
                  <SelectTrigger className="bg-black/60 border-red-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-red-500/30">
                    <SelectItem value="male" className="text-white">🔵 זכר</SelectItem>
                    <SelectItem value="female" className="text-white">🔴 נקבה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                חזור
              </Button>
              <Button
                onClick={handleGenerateAd}
                disabled={generating || !adDetails.headline}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white"
              >
                {generating ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    יוצר...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="mr-2" />
                    צור תסריט
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && generatedAd && (
          <div className="space-y-4">
            <h4 className="font-semibold text-white text-lg">תצוגה מקדימה</h4>

            <div className="bg-black/40 border border-red-500/20 rounded-lg p-4 space-y-3">
              <div>
                <h5 className="text-sm font-bold text-red-300 mb-1">תסריט</h5>
                <p className="text-white text-sm whitespace-pre-wrap">{generatedAd.script}</p>
              </div>

              <div className="bg-red-900/20 border border-red-500/20 rounded p-3">
                <h5 className="text-xs font-bold text-yellow-300 mb-2">💡 עצה:</h5>
                <p className="text-xs text-gray-300">
                  הפרסומה תתווסף כקליפ לעורך. אתה יכול להוסיף תמונות, ווידאו ודיבוב כדי להשלים את הפרסומה.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                ערוך
              </Button>
              <Button
                onClick={handleApplyAd}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white"
              >
                <Sparkles size={18} className="mr-2" />
                הוסף לעורך
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}