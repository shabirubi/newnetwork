import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Save, X, Loader2, Film, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ExportVideoModal({ 
  onClose, 
  clips,
  totalDuration,
  userEmail,
  loading,
  setLoading
}) {
  const [videoTitle, setVideoTitle] = useState(`סרטון - ${new Date().toLocaleDateString('he-IL')}`);
  const [category, setCategory] = useState('breaking');
  const [feed, setFeed] = useState('all-videos');
  const [saveMode, setSaveMode] = useState('project'); // 'download', 'project', 'both'

  const categories = [
    { value: 'breaking', label: '⚡ חדשות עכשיו' },
    { value: 'security', label: '🛡️ ביטחון' },
    { value: 'economy', label: '💰 כלכלה' },
    { value: 'politics', label: '🏛️ פוליטיקה' },
    { value: 'technology', label: '💻 טכנולוגיה' },
    { value: 'sports', label: '⚽ ספורט' },
    { value: 'entertainment', label: '🎬 בידור' },
    { value: 'world', label: '🌍 עולם' },
    { value: 'health', label: '⚕️ בריאות' }
  ];

  const feeds = [
    { value: 'all-videos', label: 'כל הסרטונים' },
    { value: 'user-videos', label: 'סרטוני משתמשים' },
    { value: 'live-player', label: 'שידור חי' }
  ];

  const handleExport = async () => {
    if (!videoTitle.trim()) {
      toast.error('אנא הזן כותרת לסרטון');
      return;
    }

    setLoading(true);
    try {
      const mainClip = clips[0];

      // שמירה לפרויקטים
      if (saveMode === 'project' || saveMode === 'both') {
        await base44.entities.UserVideo.create({
          title: videoTitle,
          description: `סרטון עם ${clips.length} קליפים`,
          video_url: mainClip.url,
          thumbnail_url: mainClip.thumbnail || mainClip.url,
          category: category,
          feed: feed,
          status: 'ready',
          uploader_email: userEmail,
          duration: totalDuration
        });
        toast.success('הסרטון שמור לפרויקטים! 📂');
      }

      // הורדה
      if (saveMode === 'download' || saveMode === 'both') {
        try {
          const response = await fetch(mainClip.url);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${videoTitle}.mp4`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success('הסרטון הורד בהצלחה! ⬇️');
        } catch (err) {
          toast.error('שגיאה בהורדה');
        }
      }

      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('שגיאה בייצוא: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-red-950 via-black to-red-950/50 border border-red-500/50 rounded-3xl max-w-2xl w-full shadow-2xl shadow-red-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative overflow-hidden border-b border-red-500/30">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-transparent to-orange-600/20" />
          <div className="relative p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/50">
                <Download size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">ייצוא סרטון</h2>
                <p className="text-red-300 text-sm">שמור, הורד וקבל קישור</p>
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
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">כותרת הסרטון</label>
            <Input
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="לדוגמה: סרטון חדשות - הערב"
              className="bg-black/80 border-2 border-red-500/30 text-white text-base py-3 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Save Mode */}
          <div className="bg-gradient-to-r from-red-600/10 to-orange-600/10 border border-red-500/30 rounded-2xl p-6">
            <label className="block text-sm font-bold text-white mb-4">בחר מה לעשות:</label>
            <div className="space-y-3">
              <button
                onClick={() => setSaveMode('project')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  saveMode === 'project'
                    ? 'bg-red-600 border-red-400'
                    : 'bg-black/40 border-red-500/30 hover:border-red-500/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Save size={20} className={saveMode === 'project' ? 'text-white' : 'text-red-400'} />
                  <div>
                    <div className="font-bold text-white">💾 שמור לפרויקטים שלי</div>
                    <div className={`text-sm ${saveMode === 'project' ? 'text-white/80' : 'text-gray-400'}`}>
                      הסרטון יישמר בחשבונך ותוכל לגשת אליו בכל עת
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSaveMode('download')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  saveMode === 'download'
                    ? 'bg-red-600 border-red-400'
                    : 'bg-black/40 border-red-500/30 hover:border-red-500/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Download size={20} className={saveMode === 'download' ? 'text-white' : 'text-red-400'} />
                  <div>
                    <div className="font-bold text-white">⬇️ הורד למחשב</div>
                    <div className={`text-sm ${saveMode === 'download' ? 'text-white/80' : 'text-gray-400'}`}>
                      הורד את הסרטון ישירות למקום הזה
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSaveMode('both')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  saveMode === 'both'
                    ? 'bg-red-600 border-red-400'
                    : 'bg-black/40 border-red-500/30 hover:border-red-500/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles size={20} className={saveMode === 'both' ? 'text-white' : 'text-red-400'} />
                  <div>
                    <div className="font-bold text-white">🚀 שניהם</div>
                    <div className={`text-sm ${saveMode === 'both' ? 'text-white/80' : 'text-gray-400'}`}>
                      שמור בחשבון וגם הורד כל הכל
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Category & Feed - Only if saving to project */}
          {(saveMode === 'project' || saveMode === 'both') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">קטגוריה</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-black/80 border-red-500/30 text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-red-500/30">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">פיד</label>
                <Select value={feed} onValueChange={setFeed}>
                  <SelectTrigger className="bg-black/80 border-red-500/30 text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-red-500/30">
                    {feeds.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-xs text-blue-300">
              📊 <strong>סטטיסטיקות:</strong> {clips.length} קליפים • {totalDuration.toFixed(1)} שניות
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black/40 border-t border-red-500/30 p-6 flex gap-3">
          <Button 
            onClick={onClose}
            disabled={loading}
            variant="outline" 
            className="flex-1 border-white/20 text-white hover:bg-white/10 py-6 rounded-xl font-semibold"
          >
            ביטול
          </Button>
          <Button 
            onClick={handleExport}
            disabled={loading || !videoTitle.trim()}
            className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-50 text-white py-6 rounded-xl font-semibold shadow-lg shadow-red-500/30"
          >
            {loading ? (
              <><Loader2 size={20} className="ml-2 animate-spin" />מייצא...</>
            ) : (
              <><Download size={20} className="ml-2" />ייצא עכשיו</>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}