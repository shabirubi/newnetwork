import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wand2, Trash2, Maximize2, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function AdvancedTools({ imageUrl, onImageUpdate }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [upscaleScale, setUpscaleScale] = useState(2);

  const handleRemoveBackground = async () => {
    if (!imageUrl) return;
    
    setIsRemoving(true);
    try {
      const response = await base44.functions.invoke('removeBackground', {
        image_url: imageUrl
      });

      if (response.data?.image_url) {
        onImageUpdate(response.data.image_url);
        toast.success('רקע הוסר בהצלחה! ✨');
      }
    } catch (error) {
      console.error('Background removal error:', error);
      toast.error('שגיאה בהסרת הרקע');
    } finally {
      setIsRemoving(false);
    }
  };

  const handleUpscale = async () => {
    if (!imageUrl) return;
    
    setIsUpscaling(true);
    try {
      const response = await base44.functions.invoke('upscaleImage', {
        image_url: imageUrl,
        scale: upscaleScale
      });

      if (response.data?.image_url) {
        onImageUpdate(response.data.image_url);
        toast.success(`הוגדל פי ${upscaleScale} בהצלחה! 🔍`);
      }
    } catch (error) {
      console.error('Upscale error:', error);
      toast.error('שגיאה בהגדלת התמונה');
    } finally {
      setIsUpscaling(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-white flex items-center gap-2">
        <Sparkles size={16} className="text-purple-400" />
        כלים מתקדמים
      </label>

      <div className="grid grid-cols-1 gap-3">
        {/* Background Removal */}
        <Button
          onClick={handleRemoveBackground}
          disabled={!imageUrl || isRemoving}
          variant="outline"
          className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
        >
          {isRemoving ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              מסיר רקע...
            </>
          ) : (
            <>
              <Trash2 size={16} className="mr-2" />
              הסר רקע
            </>
          )}
        </Button>

        {/* Upscaling */}
        <div className="flex gap-2">
          <Input
            type="number"
            min="2"
            max="4"
            value={upscaleScale}
            onChange={(e) => setUpscaleScale(Math.min(4, Math.max(2, parseInt(e.target.value) || 2)))}
            className="w-20 bg-black/60 border-purple-500/30 text-white"
            disabled={!imageUrl || isUpscaling}
          />
          <Button
            onClick={handleUpscale}
            disabled={!imageUrl || isUpscaling}
            variant="outline"
            className="flex-1 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
          >
            {isUpscaling ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                מגדיל...
              </>
            ) : (
              <>
                <Maximize2 size={16} className="mr-2" />
                הגדל פי {upscaleScale}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="text-xs text-gray-400 space-y-1">
        <p>• הסרת רקע - מושלם ללוגואים ותמונות מוצר</p>
        <p>• הגדלה - שפר איכות עד פי 4 ברזולוציה גבוהה</p>
      </div>
    </div>
  );
}