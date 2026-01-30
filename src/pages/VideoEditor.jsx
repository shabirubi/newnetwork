import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Play, Pause, Plus, Trash2, Upload, Download, 
  Volume2, VolumeX, Scissors, Sparkles, Music, 
  MoveHorizontal, Film, Loader2, Save, Eye, Type, Image as ImageIcon, FolderOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

// Projects Modal Component
function ProjectsModal({ onClose, onLoad }) {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['video-projects'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.VideoProject.filter({ creator_email: user.email }, '-created_date', 50);
    }
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FolderOpen size={24} className="text-[#E31E24]" />
          הפרויקטים שלי
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-[#E31E24]" />
          </div>
        ) : projects?.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Film size={48} className="mx-auto mb-4 opacity-30" />
            <p>אין פרויקטים שמורים עדיין</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects?.map(project => (
              <div 
                key={project.id}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer group"
                onClick={() => onLoad(project)}
              >
                <div className="aspect-video bg-black/50 rounded-lg mb-3 overflow-hidden">
                  {project.thumbnail && (
                    <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <h4 className="font-bold text-white mb-1 group-hover:text-[#E31E24] transition-colors">{project.title}</h4>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{project.clips?.length || 0} קליפים</span>
                  <span>{project.duration?.toFixed(1)}s</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(project.created_date).toLocaleDateString('he-IL')}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            סגור
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function VideoEditor() {
  const [clips, setClips] = useState([]);
  const [selectedClipIndex, setSelectedClipIndex] = useState(null);
  const [audioTrack, setAudioTrack] = useState(null);
  const [transitions, setTransitions] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [overlays, setOverlays] = useState([]);
  const [showOverlayModal, setShowOverlayModal] = useState(false);
  const [playingAll, setPlayingAll] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // Calculate total duration
  useEffect(() => {
    const duration = clips.reduce((acc, clip) => acc + (clip.duration || 10), 0);
    setTotalDuration(duration);
  }, [clips]);

  // Add clip from file upload
  const handleAddClip = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const video = document.createElement('video');
      const localUrl = URL.createObjectURL(file);
      video.src = localUrl;
      
      video.onloadedmetadata = async () => {
        try {
          // Upload file to server
          const uploadResult = await base44.integrations.Core.UploadFile({ file });
          
          setClips(prev => [...prev, {
            id: Date.now(),
            url: uploadResult.file_url,
            localUrl: localUrl,
            duration: video.duration,
            name: file.name,
            thumbnail: uploadResult.file_url,
            filters: { brightness: 100, contrast: 100, saturation: 100 },
            volume: 100
          }]);
          toast.success('קליפ נוסף בהצלחה');
        } catch (error) {
          toast.error('שגיאה בהעלאה: ' + error.message);
        } finally {
          setLoading(false);
        }
      };
      
      video.onerror = () => {
        toast.error('שגיאה בטעינת הסרטון');
        setLoading(false);
      };
    } catch (error) {
      toast.error('שגיאה: ' + error.message);
      setLoading(false);
    }
  };

  // Add clip from Luma generation
  const handleAddLumaClip = async () => {
    const prompt = window.prompt('תאר את הסרטון שברצונך ליצור:');
    if (!prompt) return;

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('createLumaVideo', { 
        prompt,
        aspect_ratio: '16:9'
      });

      if (data.video_url) {
        setClips(prev => [...prev, {
          id: Date.now(),
          url: data.video_url,
          duration: 10,
          name: prompt.substring(0, 30),
          thumbnail: data.thumbnail_url,
          filters: { brightness: 100, contrast: 100, saturation: 100 },
          volume: 100
        }]);
        toast.success('קליפ AI נוסף בהצלחה');
      } else {
        toast.info('הסרטון בתהליך יצירה...');
      }
    } catch (error) {
      toast.error('שגיאה ביצירת קליפ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Remove clip
  const removeClip = (index) => {
    setClips(prev => prev.filter((_, i) => i !== index));
    if (selectedClipIndex === index) setSelectedClipIndex(null);
    toast.success('קליפ הוסר');
  };

  // Update transition
  const updateTransition = (afterClipIndex, transitionType) => {
    setTransitions(prev => ({
      ...prev,
      [afterClipIndex]: transitionType
    }));
  };

  // Update clip filters
  const updateClipFilter = (clipIndex, filterName, value) => {
    setClips(prev => prev.map((clip, i) => 
      i === clipIndex 
        ? { ...clip, filters: { ...clip.filters, [filterName]: value } }
        : clip
    ));
  };

  // Add audio track
  const handleAddAudio = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { data } = await base44.integrations.Core.UploadFile({ file });
      setAudioTrack({
        url: data.file_url,
        name: file.name,
        volume: 100
      });
      toast.success('מוזיקת רקע נוספה');
    } catch (error) {
      toast.error('שגיאה בהעלאת אודיו');
    }
  };

  // Play all clips in sequence
  const handlePlayAll = () => {
    if (clips.length === 0) {
      toast.error('אין קליפים להפעלה');
      return;
    }
    setPlayingAll(true);
    setSelectedClipIndex(0);
    
    // Auto-play first clip
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play();
      }
    }, 100);
  };

  // Handle clip ended - move to next
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (playingAll && selectedClipIndex !== null && selectedClipIndex < clips.length - 1) {
        // Move to next clip
        setSelectedClipIndex(prev => prev + 1);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play();
          }
        }, 100);
      } else if (playingAll && selectedClipIndex === clips.length - 1) {
        // Finished all clips
        setPlayingAll(false);
        toast.success('הסרטון הושלם! 🎬');
      }
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [playingAll, selectedClipIndex, clips.length]);

  // Preview video
  const handlePreview = () => {
    if (clips.length === 0) {
      toast.error('אין קליפים לתצוגה מקדימה');
      return;
    }
    setPlayingAll(false);
    setSelectedClipIndex(0);
    toast.success('בחר קליפ מהטיימליין להצגה');
  };

  // Save project
  const handleSaveProject = async () => {
    if (clips.length === 0) {
      toast.error('אין מה לשמור');
      return;
    }

    try {
      const user = await base44.auth.me();
      const title = projectTitle || window.prompt('שם הפרויקט:', 'פרויקט חדש');
      if (!title) return;

      await base44.entities.VideoProject.create({
        title,
        clips,
        audioTrack,
        transitions,
        overlays,
        thumbnail: clips[0]?.thumbnail || clips[0]?.url,
        duration: totalDuration,
        creator_email: user.email
      });

      setProjectTitle(title);
      toast.success('הפרויקט נשמר! 💾');
    } catch (error) {
      toast.error('שגיאה בשמירה: ' + error.message);
    }
  };

  // Load project
  const handleLoadProject = async (project) => {
    setClips(project.clips || []);
    setAudioTrack(project.audioTrack || null);
    setTransitions(project.transitions || {});
    setOverlays(project.overlays || []);
    setProjectTitle(project.title);
    setShowProjectsModal(false);
    toast.success('הפרויקט נטען! 📂');
  };

  // Export final video
  const handleExport = async () => {
    if (clips.length === 0) {
      toast.error('אין קליפים לייצוא');
      return;
    }

    setExporting(true);
    try {
      const user = await base44.auth.me();
      
      // For now, upload the first clip as the main video
      // In a real implementation, you'd merge all clips with ffmpeg on the backend
      const mainClip = clips[0];
      
      const title = window.prompt('כותרת הסרטון:', 'סרטון ערוך - ' + new Date().toLocaleDateString());
      if (!title) {
        setExporting(false);
        return;
      }

      const category = window.prompt('קטגוריה (breaking/security/economy/politics/technology/sports/entertainment/world/health):', 'breaking');
      const feed = window.prompt('פיד (all/live-player/tiktok/user-videos/all-videos):', 'all-videos');

      await base44.entities.UserVideo.create({
        title: title,
        description: `סרטון ערוך עם ${clips.length} קליפים`,
        video_url: mainClip.url,
        thumbnail_url: mainClip.thumbnail,
        category: category || 'breaking',
        feed: feed || 'all-videos',
        status: 'ready',
        uploader_email: user.email,
        duration: totalDuration
      });

      toast.success('הסרטון הועלה בהצלחה לפידים! 🎬');
    } catch (error) {
      toast.error('שגיאה בהעלאה: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const selectedClip = selectedClipIndex !== null ? clips[selectedClipIndex] : null;

  // Add overlay (text or logo)
  const handleAddOverlay = async (type, content, file = null) => {
    if (type === 'text') {
      setOverlays(prev => [...prev, {
        id: Date.now(),
        type: 'text',
        content: content.text,
        position: { x: 50, y: 50 },
        style: { fontSize: content.fontSize || 24, color: content.color || '#ffffff' }
      }]);
    } else if (type === 'logo' && file) {
      try {
        const uploadResult = await base44.integrations.Core.UploadFile({ file });
        setOverlays(prev => [...prev, {
          id: Date.now(),
          type: 'logo',
          url: uploadResult.file_url,
          position: { x: 10, y: 10 },
          size: { width: 100, height: 100 }
        }]);
      } catch (error) {
        toast.error('שגיאה בהעלאת לוגו');
      }
    }
    setShowOverlayModal(false);
    toast.success('אלמנט נוסף!');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E31E24]/20 to-black border-b border-[#E31E24]/30 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">עורך סרטונים מתקדם</h1>
            <p className="text-sm text-gray-400">ערוך, חבר והוסף אפקטים לסרטונים שלך</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowProjectsModal(true)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <FolderOpen size={18} className="mr-2" />
              הפרויקטים שלי
            </Button>
            <Button
              onClick={handleSaveProject}
              disabled={clips.length === 0}
              variant="outline"
              className="border-green-500/30 text-green-400 hover:bg-green-600/20"
            >
              <Save size={18} className="mr-2" />
              שמור פרויקט
            </Button>
            <Button
              onClick={handlePlayAll}
              disabled={clips.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              {playingAll ? (
                <>
                  <Pause size={20} className="mr-2" />
                  מפעיל...
                </>
              ) : (
                <>
                  <Play size={20} className="mr-2" />
                  הפעל הכל
                </>
              )}
            </Button>
            <Button
              onClick={handlePreview}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Eye size={18} className="mr-2" />
              תצוגה מקדימה
            </Button>
            <Button
              onClick={handleExport}
              disabled={exporting || clips.length === 0}
              className="bg-[#E31E24] hover:bg-[#B91C1C] text-white"
            >
              {exporting ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  מייצא...
                </>
              ) : (
                <>
                  <Download size={18} className="mr-2" />
                  ייצוא סרטון
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Tools */}
        <div className="w-80 bg-black/50 border-l border-white/10 p-4 overflow-y-auto">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Plus size={18} className="text-[#E31E24]" />
            הוסף תוכן
          </h3>

          <div className="space-y-3">
            <input
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska"
              onChange={handleAddClip}
              className="hidden"
              id="video-upload"
            />
            <Button 
              onClick={() => document.getElementById('video-upload').click()}
              className="w-full bg-white/10 hover:bg-white/20 text-white" 
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Upload size={18} className="mr-2" />}
              העלה סרטון
            </Button>
            <p className="text-[10px] text-gray-500 text-center">MP4, WebM, MOV, AVI, MKV</p>

            <Button
              onClick={handleAddLumaClip}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              disabled={loading}
            >
              <Sparkles size={18} className="mr-2" />
              צור עם AI
            </Button>

            <input
              type="file"
              accept="audio/*"
              onChange={handleAddAudio}
              className="hidden"
              id="audio-upload"
            />
            <Button 
              onClick={() => document.getElementById('audio-upload').click()}
              className="w-full bg-white/10 hover:bg-white/20 text-white"
            >
              <Music size={18} className="mr-2" />
              הוסף מוזיקה
            </Button>

            <Button
              onClick={() => setShowOverlayModal(true)}
              className="w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-white"
            >
              <Type size={18} className="mr-2" />
              הוסף טקסט/לוגו
            </Button>

            <div className="border-t border-white/10 pt-3 mt-3">
              <p className="text-xs text-gray-400 mb-2 font-bold">כלים מתקדמים</p>
              <Button
                onClick={() => toast.info("פיצ'ר בקרוב: חיתוך וקיצוץ מדויק")}
                className="w-full bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-500/30 text-white mb-2"
              >
                <Scissors size={18} className="mr-2" />
                חתוך וקצץ
              </Button>
              
              <Button
                onClick={() => toast.info("פיצ'ר בקרוב: הוספת אנימציות")}
                className="w-full bg-pink-600/20 hover:bg-pink-600/40 border border-pink-500/30 text-white mb-2"
              >
                <Sparkles size={18} className="mr-2" />
                אנימציות
              </Button>

              <Button
                onClick={() => toast.info("פיצ'ר בקרוב: שינוי מהירות סרטון")}
                className="w-full bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-white mb-2"
              >
                <MoveHorizontal size={18} className="mr-2" />
                מהירות סרטון
              </Button>

              <Button
                onClick={() => toast.info("פיצ'ר בקרוב: הסרת רקע")}
                className="w-full bg-teal-600/20 hover:bg-teal-600/40 border border-teal-500/30 text-white"
              >
                <Film size={18} className="mr-2" />
                הסרת רקע
              </Button>
            </div>
          </div>

          {audioTrack && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-green-400">🎵 {audioTrack.name}</span>
                <button
                  onClick={() => setAudioTrack(null)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <Slider
                value={[audioTrack.volume]}
                onValueChange={(val) => setAudioTrack(prev => ({ ...prev, volume: val[0] }))}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          )}

          {/* Clip Editor */}
          {selectedClip && (
            <div className="mt-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Scissors size={18} className="text-[#E31E24]" />
                עריכת קליפ
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">בהירות</label>
                  <Slider
                    value={[selectedClip.filters.brightness]}
                    onValueChange={(val) => updateClipFilter(selectedClipIndex, 'brightness', val[0])}
                    max={200}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">ניגודיות</label>
                  <Slider
                    value={[selectedClip.filters.contrast]}
                    onValueChange={(val) => updateClipFilter(selectedClipIndex, 'contrast', val[0])}
                    max={200}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">רוויה</label>
                  <Slider
                    value={[selectedClip.filters.saturation]}
                    onValueChange={(val) => updateClipFilter(selectedClipIndex, 'saturation', val[0])}
                    max={200}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">עוצמת שמע</label>
                  <Slider
                    value={[selectedClip.volume]}
                    onValueChange={(val) => setClips(prev => prev.map((clip, i) => 
                      i === selectedClipIndex ? { ...clip, volume: val[0] } : clip
                    ))}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Preview Area */}
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-8">
            {selectedClip ? (
              <div className="relative max-w-4xl w-full">
                <div className="relative">
                  <video
                    ref={videoRef}
                    src={selectedClip.localUrl || selectedClip.url}
                    className="w-full rounded-2xl shadow-2xl"
                    style={{
                      filter: `brightness(${selectedClip.filters.brightness}%) contrast(${selectedClip.filters.contrast}%) saturate(${selectedClip.filters.saturation}%)`
                    }}
                    controls
                  />
                  {playingAll && (
                    <div className="absolute top-4 left-4 bg-green-600/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                      <Play size={16} className="text-white" />
                      <span className="text-white font-bold text-sm">מפעיל {selectedClipIndex + 1}/{clips.length}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-center text-sm text-gray-400">
                  קליפ {selectedClipIndex + 1} מתוך {clips.length} | {selectedClip.name}
                </div>
              </div>
            ) : clips.length > 0 ? (
              <div className="text-center text-gray-400">
                <Film size={64} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg mb-2">בחר קליפ מהטיימליין כדי לראות אותו</p>
                <p className="text-sm">{clips.length} קליפים בטיימליין</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Film size={64} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">הוסף קליפים כדי להתחיל לערוך</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="h-64 bg-black/80 border-t border-white/10 p-4 overflow-x-auto">
            <div className="flex items-center gap-2 mb-4">
              <Film size={18} className="text-[#E31E24]" />
              <h3 className="font-bold">ציר זמן</h3>
              <span className="text-xs text-gray-400">({clips.length} קליפים, {totalDuration.toFixed(1)}s)</span>
            </div>

            {clips.length === 0 ? (
              <div className="flex items-center justify-center h-32 border-2 border-dashed border-white/20 rounded-xl">
                <p className="text-gray-500">אין קליפים עדיין</p>
              </div>
            ) : (
              <div className="flex gap-2 items-stretch">
                {clips.map((clip, index) => (
                  <React.Fragment key={clip.id}>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`relative flex-shrink-0 w-40 rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedClipIndex === index 
                          ? 'ring-2 ring-[#E31E24] shadow-lg shadow-[#E31E24]/30' 
                          : 'hover:ring-2 hover:ring-white/30'
                      }`}
                      onClick={() => setSelectedClipIndex(index)}
                    >
                      <div 
                        className="h-24 bg-cover bg-center"
                        style={{ backgroundImage: `url(${clip.thumbnail || clip.url})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-xs">
                        <div className="font-bold truncate">{clip.name}</div>
                        <div className="text-gray-400">{clip.duration?.toFixed(1)}s</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeClip(index);
                        }}
                        className="absolute top-1 left-1 p-1 bg-red-600/80 rounded hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>

                    {/* Transition selector */}
                    {index < clips.length - 1 && (
                      <div className="flex flex-col items-center justify-center gap-2 px-2">
                        <MoveHorizontal size={20} className="text-[#E31E24]" />
                        <Select
                          value={transitions[index] || 'cut'}
                          onValueChange={(val) => updateTransition(index, val)}
                        >
                          <SelectTrigger className="w-24 h-8 text-xs bg-black/40 border-white/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cut">חיתוך</SelectItem>
                            <SelectItem value="fade">דהייה</SelectItem>
                            <SelectItem value="dissolve">המסה</SelectItem>
                            <SelectItem value="slide">החלקה</SelectItem>
                            <SelectItem value="zoom">זום</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projects Modal */}
      {showProjectsModal && (
        <ProjectsModal 
          onClose={() => setShowProjectsModal(false)}
          onLoad={handleLoadProject}
        />
      )}

      {/* Overlay Modal */}
      {showOverlayModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">הוסף טקסט או לוגו</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">טקסט</label>
                <Input
                  id="overlay-text"
                  placeholder="הכנס טקסט..."
                  className="bg-white/5 border-white/20 text-white"
                />
                <div className="flex gap-2 mt-2">
                  <Input
                    id="text-color"
                    type="color"
                    defaultValue="#ffffff"
                    className="w-20 h-10"
                  />
                  <Input
                    id="text-size"
                    type="number"
                    placeholder="גודל"
                    defaultValue="24"
                    className="flex-1 bg-white/5 border-white/20 text-white"
                  />
                </div>
                <Button
                  onClick={() => {
                    const text = document.getElementById('overlay-text').value;
                    const color = document.getElementById('text-color').value;
                    const fontSize = parseInt(document.getElementById('text-size').value);
                    if (text) handleAddOverlay('text', { text, color, fontSize });
                  }}
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Type size={18} className="mr-2" />
                  הוסף טקסט
                </Button>
              </div>

              <div className="border-t border-white/20 pt-4">
                <label className="text-sm text-gray-400 mb-2 block">לוגו / תמונה</label>
                <input
                  type="file"
                  accept="image/*"
                  id="logo-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleAddOverlay('logo', null, file);
                  }}
                />
                <Button
                  onClick={() => document.getElementById('logo-upload').click()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <ImageIcon size={18} className="mr-2" />
                  העלה לוגו
                </Button>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => setShowOverlayModal(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                סגור
              </Button>
            </div>

            {overlays.length > 0 && (
              <div className="mt-4 border-t border-white/20 pt-4">
                <p className="text-xs text-gray-400 mb-2">אלמנטים קיימים:</p>
                <div className="space-y-1">
                  {overlays.map(overlay => (
                    <div key={overlay.id} className="flex items-center justify-between text-xs bg-white/5 p-2 rounded">
                      <span>{overlay.type === 'text' ? overlay.content : 'לוגו'}</span>
                      <button
                        onClick={() => setOverlays(prev => prev.filter(o => o.id !== overlay.id))}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}