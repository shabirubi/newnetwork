import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, Sparkles, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function KlingCharacterModal({ onClose, onApply }) {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!imageFile) {
      toast.error('העלה תמונה של דמות');
      return;
    }

    if (!prompt.trim()) {
      toast.error('הזן תיאור תנועה');
      return;
    }

    setLoading(true);
    try {
      toast.info('מעלה תמונה...');
      const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });

      toast.info('יוצר דמות מדברת וזזה... עד דקה ⏳');
      const { data } = await base44.functions.invoke('generateDIDCharacter', {
        image_url: file_url,
        text_script: prompt,
        voice_id: 'en-US-GuyNeural'
      });

      if (data.video_url) {
        const newClip = {
          id: Date.now(),
          url: data.video_url,
          duration: data.duration || 5,
          name: 'דמות - ' + prompt.substring(0, 30),
          thumbnail: data.thumbnail_url || file_url,
          filters: { brightness: 100, contrast: 100, saturation: 100 },
          volume: 100,
          type: 'video'
        };
        onApply(newClip);
        onClose();
        toast.success('דמות מונפשת נוספה! 🎭');
      } else if (data.still_processing) {
        toast.info(data.message || 'עדיין מעבד... נסה שוב בעוד דקה');
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
              דמות מונפשת
            </h3>
            <p className="text-sm text-gray-400 mt-1">העלה תמונה ותאר תנועה</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={24} className="text-white" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">תמונת דמות</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="kling-image-upload"
            />
            <div
              onClick={() => document.getElementById('kling-image-upload').click()}
              className="border-2 border-dashed border-white/20 rounded-xl p-6 cursor-pointer hover:border-purple-500/50 transition-all"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-64 object-contain rounded-lg" />
              ) : (
                <div className="text-center text-gray-400">
                  <Upload size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">לחץ להעלאת תמונה</p>
                </div>
              )}
            </div>
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">תיאור תנועה</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="לדוגמה: הדמות מהלכת קדימה, מניפה יד, מדברת ומחייכת"
              className="bg-black/60 border-white/20 text-white placeholder-white/40 resize-none"
              rows={3}
            />
          </div>

          {/* Tips */}
          <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-sm text-purple-200 font-semibold mb-2 flex items-center gap-2">
              <Sparkles size={16} />
              טיפים:
            </p>
            <ul className="text-xs text-purple-300 space-y-1">
              <li>• השתמש בתמונה ברורה של אדם או דמות</li>
              <li>• תאר תנועות ספציפיות: "הולך", "מנופף", "מדבר"</li>
              <li>• הוסף פרטי סביבה: "ביער", "ברחוב"</li>
              <li>• התהליך לוקח עד 2 דקות</li>
            </ul>
          </div>

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
              disabled={loading || !imageFile || !prompt.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  יוצר...
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