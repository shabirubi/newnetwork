import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, Newspaper, Image as ImageIcon, Video, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const categories = [
  { value: 'breaking', label: 'חדשות עכשיו' },
  { value: 'security', label: 'ביטחון ומדיניות' },
  { value: 'economy', label: 'כלכלה ועסקים' },
  { value: 'politics', label: 'פוליטיקה' },
  { value: 'technology', label: 'טכנולוגיה' },
  { value: 'sports', label: 'ספורט' },
  { value: 'entertainment', label: 'בידור ודרמה' },
  { value: 'world', label: 'חדשות עולם' },
  { value: 'health', label: 'בריאות' },
  { value: 'music', label: 'מוזיקה' },
  { value: 'horoscope', label: 'הורוסקופ' },
  { value: 'finance', label: 'פיננסים' }
];

export default function ArticleCreatorModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('breaking');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('אנא בחר קובץ תמונה');
      return;
    }

    setUploading(true);
    toast.loading('מעלה תמונה...', { id: 'upload-image' });

    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      const url = result?.file_url || result?.url;
      
      if (!url) {
        throw new Error('לא התקבל URL');
      }
      
      setImageUrl(url);
      toast.success('התמונה הועלתה!', { id: 'upload-image' });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('שגיאה בהעלאה: ' + error.message, { id: 'upload-image' });
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('אנא בחר קובץ וידאו');
      return;
    }

    setUploading(true);
    toast.loading('מעלה וידאו...', { id: 'upload-video' });

    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      const url = result?.file_url || result?.url;
      
      if (!url) {
        throw new Error('לא התקבל URL');
      }
      
      setVideoUrl(url);
      toast.success('הווידאו הועלה!', { id: 'upload-video' });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('שגיאה בהעלאה: ' + error.message, { id: 'upload-video' });
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error('נא להזין כותרת');
      return;
    }

    if (!content.trim()) {
      toast.error('נא להזין תוכן');
      return;
    }

    if (!imageUrl && !videoUrl) {
      toast.error('נא להעלות תמונה או וידאו');
      return;
    }

    setPublishing(true);
    toast.loading('מפרסם כתבה...', { id: 'publish' });

    try {
      const user = await base44.auth.me();

      const articleData = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        content: content.trim(),
        category,
        image_url: imageUrl || undefined,
        video_url: videoUrl || undefined,
        is_breaking: isBreaking,
        is_featured: isFeatured,
        source: user.full_name || user.email,
      };

      await base44.entities.NewsArticle.create(articleData);

      toast.success('הכתבה פורסמה בהצלחה! 🎉', { id: 'publish' });
      
      // Reset form
      setTitle('');
      setSubtitle('');
      setContent('');
      setCategory('breaking');
      setImageUrl('');
      setVideoUrl('');
      setIsBreaking(false);
      setIsFeatured(false);

      // Close modal
      onClose();

      // Refresh page to show new article
      window.location.reload();
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('שגיאה בפרסום: ' + error.message, { id: 'publish' });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl border border-[#E31E24]/30 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] p-4 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Newspaper className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">יצירת כתבה חדשה</h2>
                    <p className="text-red-100 text-sm">העלה תמונה/וידאו וכתוב את הכתבה</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={publishing}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Media Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image Upload */}
                <div>
                  <label className="text-white text-sm font-bold mb-2 block">תמונה ראשית</label>
                  <div 
                    onClick={() => !uploading && document.getElementById('article-image-upload').click()}
                    className="relative border-2 border-dashed border-[#E31E24]/50 rounded-xl p-6 cursor-pointer hover:border-[#E31E24] hover:bg-[#E31E24]/5 transition-all"
                  >
                    {imageUrl ? (
                      <div className="space-y-2">
                        <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                        <p className="text-green-400 text-xs text-center">✓ תמונה נבחרה - לחץ להחלפה</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 text-[#E31E24]/50" />
                        <p className="text-white font-bold text-sm">העלה תמונה</p>
                        <p className="text-gray-400 text-xs mt-1">JPG, PNG</p>
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#E31E24]" />
                      </div>
                    )}
                  </div>
                  <input
                    id="article-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </div>

                {/* Video Upload */}
                <div>
                  <label className="text-white text-sm font-bold mb-2 block">וידאו (אופציונלי)</label>
                  <div 
                    onClick={() => !uploading && document.getElementById('article-video-upload').click()}
                    className="relative border-2 border-dashed border-purple-500/50 rounded-xl p-6 cursor-pointer hover:border-purple-500 hover:bg-purple-500/5 transition-all"
                  >
                    {videoUrl ? (
                      <div className="space-y-2">
                        <video src={videoUrl} className="w-full h-40 object-cover rounded-lg" controls />
                        <p className="text-green-400 text-xs text-center">✓ וידאו נבחר - לחץ להחלפה</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Video className="w-12 h-12 mx-auto mb-2 text-purple-500/50" />
                        <p className="text-white font-bold text-sm">העלה וידאו</p>
                        <p className="text-gray-400 text-xs mt-1">MP4, MOV</p>
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                      </div>
                    )}
                  </div>
                  <input
                    id="article-video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </div>
              </div>

              {/* Article Details */}
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm font-bold mb-2 block">כותרת *</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="כותרת הכתבה..."
                    className="bg-black/50 border-white/20 text-white text-lg"
                    disabled={publishing}
                  />
                </div>

                <div>
                  <label className="text-white text-sm font-bold mb-2 block">כותרת משנה</label>
                  <Input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="כותרת משנה (אופציונלי)..."
                    className="bg-black/50 border-white/20 text-white"
                    disabled={publishing}
                  />
                </div>

                <div>
                  <label className="text-white text-sm font-bold mb-2 block">תוכן הכתבה *</label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="כתוב את תוכן הכתבה כאן..."
                    className="bg-black/50 border-white/20 text-white min-h-[200px] resize-none"
                    disabled={publishing}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-bold mb-2 block">קטגוריה *</label>
                    <Select value={category} onValueChange={setCategory} disabled={publishing}>
                      <SelectTrigger className="bg-black/50 border-white/20 text-white">
                        <SelectValue placeholder="בחר קטגוריה" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/20 text-white max-h-[300px]">
                        {categories.map((cat) => (
                          <SelectItem 
                            key={cat.value} 
                            value={cat.value} 
                            className="text-white hover:bg-[#E31E24]/30 focus:bg-[#E31E24]/30 cursor-pointer"
                          >
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white text-sm font-bold block">סטטוס</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isBreaking}
                          onChange={(e) => setIsBreaking(e.target.checked)}
                          disabled={publishing}
                          className="w-4 h-4 rounded bg-black/50 border-white/20"
                        />
                        <span className="text-red-400 text-sm font-bold">חדשה חמה 🔥</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                          disabled={publishing}
                          className="w-4 h-4 rounded bg-black/50 border-white/20"
                        />
                        <span className="text-yellow-400 text-sm font-bold">מובלטת ⭐</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-gray-900 to-black p-4 border-t border-white/10 flex gap-3 shrink-0">
              <Button
                onClick={onClose}
                disabled={publishing}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                ביטול
              </Button>
              <Button
                onClick={handlePublish}
                disabled={publishing || !title.trim() || !content.trim() || (!imageUrl && !videoUrl)}
                className="flex-1 bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991818] text-white"
              >
                {publishing ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    מפרסם...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 ml-2" />
                    פרסם כתבה
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}