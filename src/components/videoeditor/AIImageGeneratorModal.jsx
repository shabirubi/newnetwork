import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { X, Sparkles, Loader2, Zap, Image as ImageIcon, Plus, FileText, Cpu, Maximize, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AIImageGeneratorModal({ onClose, onApply }) {
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [model, setModel] = useState('flux-pro');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [numImages, setNumImages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);

  const models = [
    { id: 'flux-pro', name: 'Flux Pro', speed: 'איכות מקסימלית' },
    { id: 'flux-dev', name: 'Flux Dev', speed: 'מהיר ואיכותי' },
    { id: 'flux-schnell', name: 'Flux Schnell', speed: 'סופר מהיר' },
    { id: 'sdxl', name: 'SDXL', speed: 'איכות גבוהה' }
  ];

  const aspectRatios = [
    { id: '16:9', name: 'רחב (16:9)' },
    { id: '9:16', name: 'אנכי (9:16)' },
    { id: '1:1', name: 'מרובע (1:1)' },
    { id: '4:3', name: 'קלאסי (4:3)' }
  ];

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      toast.error('אנא הזן פרומפט');
      return;
    }

    setEnhancing(true);
    try {
      const { data } = await base44.functions.invoke('enhancePrompt', { prompt });
      setEnhancedPrompt(data.enhanced_prompt);
      toast.success('הפרומפט שופר! ✨');
    } catch (error) {
      toast.error('שגיאה בשיפור הפרומפט');
    } finally {
      setEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    const finalPrompt = enhancedPrompt || prompt;
    if (!finalPrompt.trim()) {
      toast.error('אנא הזן פרומפט');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateAIImage', {
        prompt: finalPrompt,
        model,
        aspect_ratio: aspectRatio,
        num_images: numImages
      });

      setGeneratedImages(data.images);
      toast.success(`${data.images.length} תמונות נוצרו! 🎨`);
    } catch (error) {
      toast.error('שגיאה ביצירת תמונה');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToTimeline = (imageUrl) => {
    onApply({
      url: imageUrl,
      duration: 5,
      name: 'AI Generated Image',
      thumbnail: imageUrl,
      type: 'image'
    });
    toast.success('התמונה נוספה לטיימליין! 🎬');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gradient-to-br from-gray-900 to-black border border-pink-500/30 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles size={24} className="text-pink-400" />
            יוצר תמונות AI
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Prompt */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <FileText size={16} className="text-pink-400" />
              תיאור התמונה
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="תאר את התמונה שאתה רוצה ליצור..."
              className="bg-black/60 border-pink-500/30 text-white placeholder-white/40 resize-none min-h-[100px]"
            />
            <div className="flex gap-2 mt-2">
              <Button
                onClick={handleEnhancePrompt}
                disabled={enhancing || !prompt.trim()}
                variant="outline"
                className="border-pink-500/30 text-pink-400 hover:bg-pink-600/20"
                size="sm"
              >
                {enhancing ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Zap size={16} className="mr-2" />}
                שפר פרומפט
              </Button>
            </div>
            {enhancedPrompt && (
              <div className="mt-2 p-3 bg-pink-600/10 border border-pink-500/30 rounded-lg">
                <p className="text-xs text-pink-200 mb-1 font-semibold">פרומפט משופר:</p>
                <p className="text-xs text-pink-300">{enhancedPrompt}</p>
              </div>
            )}
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Cpu size={16} className="text-pink-400" />
              מנוע AI
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    model === m.id
                      ? 'bg-pink-600 text-white'
                      : 'bg-black/40 text-gray-400 hover:bg-black/60'
                  }`}
                >
                  <div className="text-xs font-semibold">{m.name}</div>
                  <div className="text-[10px] mt-1">{m.speed}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Maximize size={16} className="text-pink-400" />
              יחס תצוגה
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {aspectRatios.map((ar) => (
                <button
                  key={ar.id}
                  onClick={() => setAspectRatio(ar.id)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    aspectRatio === ar.id
                      ? 'bg-pink-600 text-white'
                      : 'bg-black/40 text-gray-400 hover:bg-black/60'
                  }`}
                >
                  <div className="text-xs font-semibold">{ar.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Number of Images */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Palette size={16} className="text-pink-400" />
              מספר תמונות ({numImages})
            </label>
            <Slider
              value={[numImages]}
              onValueChange={(val) => setNumImages(val[0])}
              min={1}
              max={4}
              step={1}
              className="w-full"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading || (!prompt.trim() && !enhancedPrompt)}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white h-12"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="mr-2 animate-spin" />
                יוצר תמונות...
              </>
            ) : (
              <>
                <Sparkles size={20} className="mr-2" />
                צור תמונות
              </>
            )}
          </Button>

          {/* Generated Images */}
          {generatedImages.length > 0 && (
            <div className="border-t border-pink-500/30 pt-6">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ImageIcon size={20} className="text-pink-400" />
                תמונות שנוצרו
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {generatedImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Generated ${index + 1}`}
                      className="w-full rounded-xl border border-pink-500/30"
                    />
                    <Button
                      onClick={() => handleAddToTimeline(img)}
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500"
                      size="sm"
                    >
                      <Plus size={16} className="mr-1" />
                      הוסף לטיימליין
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}