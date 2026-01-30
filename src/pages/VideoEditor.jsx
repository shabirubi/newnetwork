import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
        Play, Pause, Plus, Trash2, Upload, Download, 
        Volume2, VolumeX, Scissors, Sparkles, Music, 
        MoveHorizontal, Film, Loader2, Save, Eye, Type, Image as ImageIcon, FolderOpen, X, Clock
      } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import AutoCaptionsModal from '../components/videoeditor/AutoCaptionsModal';
import TTSModal from '../components/videoeditor/TTSModal';
import AdvancedTTSModal from '../components/videoeditor/AdvancedTTSModal';
import EffectsLibraryModal from '../components/videoeditor/EffectsLibraryModal';
import SpeedControlModal from '../components/videoeditor/SpeedControlModal';
import ResizeModal from '../components/videoeditor/ResizeModal';
import ElementsLibraryModal from '../components/videoeditor/ElementsLibraryModal';
import MusicLibraryModal from '../components/videoeditor/MusicLibraryModal';
import PIPOverlay from '../components/videoeditor/PIPOverlay';
import AIImageGeneratorModal from '../components/videoeditor/AIImageGeneratorModal';
import AdCreatorModal from '../components/videoeditor/AdCreatorModal';
      import StockVideoLibraryModal from '../components/videoeditor/StockVideoLibraryModal';

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
  const [showCaptionsModal, setShowCaptionsModal] = useState(false);
  const [showTTSModal, setShowTTSModal] = useState(false);
  const [showEffectsModal, setShowEffectsModal] = useState(false);
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [showResizeModal, setShowResizeModal] = useState(false);
  const [showElementsModal, setShowElementsModal] = useState(false);
  const [showMusicLibraryModal, setShowMusicLibraryModal] = useState(false);
  const [showPIPModal, setShowPIPModal] = useState(false);
  const [pipLayers, setPipLayers] = useState([]);
  const [showAIImageModal, setShowAIImageModal] = useState(false);
  const [showAdvancedTTSModal, setShowAdvancedTTSModal] = useState(false);
  const [showAdCreatorModal, setShowAdCreatorModal] = useState(false);
  const [showStockVideoModal, setShowStockVideoModal] = useState(false);
  const [videoLoop, setVideoLoop] = useState(false);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // Calculate total duration
  useEffect(() => {
    const duration = clips.reduce((acc, clip) => acc + (clip.duration || 10), 0);
    setTotalDuration(duration);
  }, [clips]);

  // Add clip from file upload (video or image)
  const handleAddClip = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const isImage = file.type.startsWith('image/');
      const uploadResult = await base44.integrations.Core.UploadFile({ file });

      if (isImage) {
        // Handle image
        setClips(prev => [...prev, {
          id: Date.now(),
          url: uploadResult.file_url,
          duration: 5, // Default 5 seconds for images
          name: file.name,
          thumbnail: uploadResult.file_url,
          filters: { brightness: 100, contrast: 100, saturation: 100 },
          volume: 0,
          type: 'image'
        }]);
        toast.success('תמונה נוספה בהצלחה');
        setLoading(false);
      } else {
         // Handle video
         const video = document.createElement('video');
         video.src = URL.createObjectURL(file);
         video.crossOrigin = 'anonymous';

         const handleMetadata = () => {
           const duration = video.duration;
           // Create thumbnail from video
           video.currentTime = Math.min(1, duration * 0.1); // Get frame at 1 second or 10% of video

           const handleSeeked = () => {
             try {
               const canvas = document.createElement('canvas');
               canvas.width = video.videoWidth;
               canvas.height = video.videoHeight;
               const ctx = canvas.getContext('2d');
               ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
               const thumbnail = canvas.toDataURL('image/jpeg', 0.7);

               setClips(prev => [...prev, {
                 id: Date.now(),
                 url: uploadResult.file_url,
                 localUrl: video.src,
                 duration: duration,
                 name: file.name,
                 thumbnail: thumbnail,
                 filters: { brightness: 100, contrast: 100, saturation: 100 },
                 volume: 100,
                 type: 'video'
               }]);
               toast.success('קליפ נוסף בהצלחה');
             } catch (e) {
               console.error('Error creating thumbnail:', e);
               // Fallback - add without thumbnail
               setClips(prev => [...prev, {
                 id: Date.now(),
                 url: uploadResult.file_url,
                 localUrl: video.src,
                 duration: duration,
                 name: file.name,
                 thumbnail: uploadResult.file_url,
                 filters: { brightness: 100, contrast: 100, saturation: 100 },
                 volume: 100,
                 type: 'video'
               }]);
               toast.success('קליפ נוסף בהצלחה');
             }
             video.removeEventListener('seeked', handleSeeked);
             setLoading(false);
           };

           video.addEventListener('seeked', handleSeeked);
         };

         video.addEventListener('loadedmetadata', handleMetadata);
         video.addEventListener('error', () => {
           toast.error('שגיאה בטעינת הסרטון');
           setLoading(false);
         });
       }
    } catch (error) {
      toast.error('שגיאה: ' + error.message);
      setLoading(false);
    }
  };

  // Add clip from Luma generation
  const [showLumaGeneratorModal, setShowLumaGeneratorModal] = useState(false);
  
  const handleAddLumaClip = async (lumaPrompt, aspectRatio) => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('createLumaVideo', { 
        prompt: lumaPrompt,
        aspect_ratio: aspectRatio || '16:9'
      });

      if (data.video_url) {
        setClips(prev => [...prev, {
          id: Date.now(),
          url: data.video_url,
          duration: 10,
          name: lumaPrompt.substring(0, 30),
          thumbnail: data.thumbnail_url,
          filters: { brightness: 100, contrast: 100, saturation: 100 },
          volume: 100,
          type: 'video'
        }]);
        toast.success('קליפ AI נוסף בהצלחה');
        setShowLumaGeneratorModal(false);
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
        volume: 100,
        loop: true // Loop audio to match video duration
      });
      toast.success('מוזיקת רקע נוספה - תחזור בלולאה');
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
    
    // Auto-play first clip with proper timing
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(err => {
          console.error('Play error:', err);
          toast.error('לא ניתן להפעיל את הסרטון');
        });
      }
    }, 200);
  };

  // Handle clip ended - move to next with transition
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (playingAll && selectedClipIndex !== null && selectedClipIndex < clips.length - 1) {
        const transition = transitions[selectedClipIndex] || 'cut';
        const transitionDuration = transition === 'cut' ? 0 : 500; // 500ms for transitions
        
        // Apply transition effect
        if (transition !== 'cut') {
          video.style.transition = `opacity ${transitionDuration}ms`;
          video.style.opacity = '0';
        }
        
        setTimeout(() => {
          setSelectedClipIndex(prev => prev + 1);
          setTimeout(() => {
            if (videoRef.current) {
              if (transition !== 'cut') {
                videoRef.current.style.opacity = '1';
              }
              videoRef.current.play();
            }
          }, 50);
        }, transitionDuration);
      } else if (playingAll && selectedClipIndex === clips.length - 1) {
        setPlayingAll(false);
        toast.success('הסרטון הושלם! 🎬');
      }
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [playingAll, selectedClipIndex, clips.length, transitions]);

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
        description: `סרטון ערוך עם ${clips.length} קליפים${videoLoop ? ' - חוזר בלופ' : ''}`,
        video_url: mainClip.url,
        thumbnail_url: mainClip.thumbnail,
        category: category || 'breaking',
        feed: feed || 'all-videos',
        status: 'ready',
        uploader_email: user.email,
        duration: totalDuration,
        loop: videoLoop
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVideoLoop(!videoLoop)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  videoLoop
                    ? 'bg-cyan-600/40 text-cyan-300 border border-cyan-500'
                    : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20'
                }`}
              >
                {videoLoop ? '🔄 לופ פעיל' : '🔄 לופ'}
              </button>
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
              accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska,image/png,image/jpeg,image/jpg,image/gif"
              onChange={handleAddClip}
              className="hidden"
              id="video-upload"
            />
            <div className="flex gap-2">
              <Button 
                onClick={() => document.getElementById('video-upload').click()}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white" 
                disabled={loading}
              >
                {loading ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Upload size={18} className="mr-2" />}
                העלה
              </Button>
              <Button
                onClick={() => setShowStockVideoModal(true)}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
              >
                <Play size={18} className="mr-2" />
                ספריה
              </Button>
            </div>
            <p className="text-[10px] text-gray-500 text-center">MP4, WebM, MOV, AVI, MKV, PNG, JPG, GIF</p>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowLumaGeneratorModal(true)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                disabled={loading}
              >
                <Sparkles size={18} className="mr-2" />
                סרטון AI
              </Button>
              <Button
                onClick={() => setShowAIImageModal(true)}
                className="flex-1 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white"
              >
                <ImageIcon size={18} className="mr-2" />
                תמונה AI
              </Button>
            </div>

            <div className="flex gap-2">
              <input
                type="file"
                accept="audio/*"
                onChange={handleAddAudio}
                className="hidden"
                id="audio-upload"
              />
              <Button 
                onClick={() => document.getElementById('audio-upload').click()}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white"
              >
                <Upload size={18} className="mr-2" />
                העלה
              </Button>
              <Button 
                onClick={() => setShowMusicLibraryModal(true)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Music size={18} className="mr-2" />
                ספרייה
              </Button>
            </div>

            <Button
              onClick={() => setShowOverlayModal(true)}
              className="w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-white"
            >
              <Type size={18} className="mr-2" />
              הוסף טקסט/לוגו
            </Button>

            <Button
              onClick={() => setShowElementsModal(true)}
              className="w-full bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-500/30 text-white"
            >
              <Sparkles size={18} className="mr-2" />
              ספריית אלמנטים
            </Button>

            <div className="border-t border-white/10 pt-3 mt-3">
              <p className="text-xs text-gray-400 mb-2 font-bold">🎬 כלים מתקדמים</p>
              
              <Button
                onClick={() => setShowCaptionsModal(true)}
                className="w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-white mb-2"
              >
                <Type size={18} className="mr-2" />
                כיתובים אוטומטיים
              </Button>

              <Button
                onClick={() => setShowAdvancedTTSModal(true)}
                className="w-full bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-white mb-2"
              >
                <Volume2 size={18} className="mr-2" />
                דיבוב מתקדם (11labs)
              </Button>
              
              <Button
                onClick={() => setShowEffectsModal(true)}
                className="w-full bg-pink-600/20 hover:bg-pink-600/40 border border-pink-500/30 text-white mb-2"
              >
                <Sparkles size={18} className="mr-2" />
                אפקטים ומעברים
              </Button>

              <Button
                onClick={() => setShowSpeedModal(true)}
                disabled={!selectedClip}
                className="w-full bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-white mb-2"
              >
                <MoveHorizontal size={18} className="mr-2" />
                שינוי מהירות
              </Button>

              <Button
                onClick={() => setShowResizeModal(true)}
                className="w-full bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 text-white mb-2"
              >
                <Film size={18} className="mr-2" />
                שינוי גודל
              </Button>

              <Button
                onClick={() => toast.info("פיצ'ר בקרוב: הסרת רעש מאודיו")}
                className="w-full bg-teal-600/20 hover:bg-teal-600/40 border border-teal-500/30 text-white mb-2"
              >
                <Volume2 size={18} className="mr-2" />
                הסרת רעש
              </Button>

              <Button
                onClick={() => setShowPIPModal(true)}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white mb-2"
              >
                <Film size={18} className="mr-2" />
                וידאו בתוך וידאו (PIP)
              </Button>

              <Button
                onClick={() => setShowAdCreatorModal(true)}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white"
              >
                <Sparkles size={18} className="mr-2" />
                יוצר פרסומות AI
              </Button>
            </div>
          </div>

          {audioTrack && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <div className="text-xs text-green-400 mb-1 flex items-center gap-2">
                    <Music size={12} />
                    {audioTrack.name}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {audioTrack.loop ? 'חוזר בלולאה למשך הסרטון' : 'מתנגן פעם אחת'}
                  </div>
                </div>
                <button
                  onClick={() => setAudioTrack(null)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">עוצמת שמע</label>
                  <Slider
                    value={[audioTrack.volume]}
                    onValueChange={(val) => setAudioTrack(prev => ({ ...prev, volume: val[0] }))}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <button
                  onClick={() => setAudioTrack(prev => ({ ...prev, loop: !prev.loop }))}
                  className={`w-full text-xs py-1 px-2 rounded ${audioTrack.loop ? 'bg-green-600/30 text-green-300' : 'bg-white/10 text-gray-400'}`}
                >
                  {audioTrack.loop ? 'לולאה פעילה' : 'לחץ להפעיל לולאה'}
                </button>
              </div>
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
                  {selectedClip.type === 'image' ? (
                    <img
                      src={selectedClip.url}
                      className="w-full rounded-2xl shadow-2xl"
                      style={{
                        filter: `brightness(${selectedClip.filters.brightness}%) contrast(${selectedClip.filters.contrast}%) saturate(${selectedClip.filters.saturation}%)`
                      }}
                      alt={selectedClip.name}
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      src={selectedClip.localUrl || selectedClip.url}
                      className="w-full rounded-2xl shadow-2xl"
                      style={{
                        filter: `brightness(${selectedClip.filters.brightness}%) contrast(${selectedClip.filters.contrast}%) saturate(${selectedClip.filters.saturation}%)`
                      }}
                      controls
                    />
                  )}

                  {/* PIP Layers */}
                  {pipLayers.map((pip, index) => {
                    const positionStyles = {
                      'top-left': { top: `${pip.config.offsetY}px`, left: `${pip.config.offsetX}px` },
                      'top-right': { top: `${pip.config.offsetY}px`, right: `${pip.config.offsetX}px` },
                      'bottom-left': { bottom: `${pip.config.offsetY}px`, left: `${pip.config.offsetX}px` },
                      'bottom-right': { bottom: `${pip.config.offsetY}px`, right: `${pip.config.offsetX}px` }
                    };

                    return (
                      <div
                        key={index}
                        className="absolute"
                        style={{
                          ...positionStyles[pip.config.position],
                          width: `${pip.config.size}%`,
                          opacity: pip.config.opacity / 100,
                          zIndex: 10 + index
                        }}
                      >
                        <video
                          src={pip.video.localUrl || pip.video.url}
                          className={`w-full ${pip.config.shape === 'circle' ? 'rounded-full' : 'rounded-xl'}`}
                          style={{
                            border: `${pip.config.borderWidth}px solid ${pip.config.borderColor}`,
                            boxShadow: pip.config.shadow ? '0 10px 40px rgba(0,0,0,0.5)' : 'none'
                          }}
                          autoPlay
                          loop
                          muted
                        />
                        <button
                          onClick={() => setPipLayers(prev => prev.filter((_, i) => i !== index))}
                          className="absolute -top-2 -right-2 bg-red-600 p-1 rounded-full hover:bg-red-700 transition-colors"
                        >
                          <X size={14} className="text-white" />
                        </button>
                      </div>
                    );
                  })}

                  {playingAll && (
                    <div className="absolute top-4 left-4 bg-green-600/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                      <Play size={16} className="text-white" />
                      <span className="text-white font-bold text-sm">מפעיל {selectedClipIndex + 1}/{clips.length}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-center text-sm text-gray-400">
                  קליפ {selectedClipIndex + 1} מתוך {clips.length} | {selectedClip.name}
                  {pipLayers.length > 0 && <span className="text-cyan-400"> • {pipLayers.length} PIP</span>}
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

      {/* Auto Captions Modal */}
      {showCaptionsModal && (
        <AutoCaptionsModal 
          onClose={() => setShowCaptionsModal(false)}
          selectedClip={selectedClip}
          onApply={(captions) => {
            setOverlays(prev => [...prev, ...captions]);
            toast.success('כיתובים נוספו! 🎤');
          }}
        />
      )}

      {/* Text-to-Speech Modal */}
      {showTTSModal && (
        <TTSModal 
          onClose={() => setShowTTSModal(false)}
          onApply={async (text, voice) => {
            setLoading(true);
            try {
              const { data } = await base44.functions.invoke('generateElevenLabsSpeech', { 
                text, 
                voice_id: voice 
              });
              if (data.audio_url) {
                setAudioTrack({ url: data.audio_url, name: 'דיבוב - ' + voice, volume: 100 });
                toast.success('דיבוב ElevenLabs נוסף! 🎙️');
              } else {
                toast.error('לא הצליח ליצור דיבוב');
              }
            } catch (error) {
              toast.error('שגיאה: ' + error.message);
            } finally {
              setLoading(false);
            }
          }}
        />
      )}

      {/* Effects Library Modal */}
      {showEffectsModal && (
        <EffectsLibraryModal 
          onClose={() => setShowEffectsModal(false)}
          onApplyEffect={(effect) => {
            if (selectedClipIndex !== null) {
              updateClipFilter(selectedClipIndex, 'effect', effect);
              toast.success(`אפקט ${effect} הוחל! ✨`);
            }
          }}
          onApplyTransition={(transition) => {
            if (selectedClipIndex !== null && selectedClipIndex < clips.length - 1) {
              updateTransition(selectedClipIndex, transition);
              toast.success(`מעבר ${transition} הוחל! 🎬`);
            }
          }}
        />
      )}

      {/* Speed Control Modal */}
      {showSpeedModal && selectedClip && (
        <SpeedControlModal 
          onClose={() => setShowSpeedModal(false)}
          currentSpeed={selectedClip.speed || 1}
          onApply={(speed) => {
            setClips(prev => prev.map((clip, i) => 
              i === selectedClipIndex ? { ...clip, speed } : clip
            ));
            toast.success(`מהירות שונתה ל-${speed}x! ⚡`);
          }}
        />
      )}

      {/* Resize Modal */}
      {showResizeModal && (
        <ResizeModal 
          onClose={() => setShowResizeModal(false)}
          onApply={(aspectRatio) => {
            setClips(prev => prev.map(clip => ({ ...clip, aspectRatio })));
            toast.success(`שונה ל-${aspectRatio}! 📐`);
          }}
        />
      )}

      {/* Elements Library Modal */}
      {showElementsModal && (
        <ElementsLibraryModal 
          onClose={() => setShowElementsModal(false)}
          onApply={(element) => {
            setOverlays(prev => [...prev, element]);
            toast.success('אלמנט נוסף! ✨');
          }}
        />
      )}

      {/* Music Library Modal */}
      {showMusicLibraryModal && (
        <MusicLibraryModal 
          onClose={() => setShowMusicLibraryModal(false)}
          onApply={(music) => {
            setAudioTrack({ url: music.url, name: music.name, volume: 100, loop: true });
            toast.success(`${music.name} נוסף! 🎵`);
          }}
        />
      )}

      {/* PIP Modal */}
      {showPIPModal && (
        <PIPOverlay 
          onClose={() => setShowPIPModal(false)}
          onApply={(pipData) => {
            setPipLayers(prev => [...prev, pipData]);
            toast.success('PIP נוסף בהצלחה! 📹');
          }}
        />
      )}

      {/* AI Image Generator Modal */}
      {showAIImageModal && (
        <AIImageGeneratorModal 
          onClose={() => setShowAIImageModal(false)}
          onApply={(imageData) => {
            setClips(prev => [...prev, {
              id: Date.now(),
              ...imageData,
              filters: { brightness: 100, contrast: 100, saturation: 100 },
              volume: 0
            }]);
            setShowAIImageModal(false);
          }}
        />
      )}

      {/* Advanced TTS Modal */}
      {showAdvancedTTSModal && (
        <AdvancedTTSModal 
          onClose={() => setShowAdvancedTTSModal(false)}
          onApply={async (text, voice) => {
            setLoading(true);
            try {
              const { data } = await base44.functions.invoke('generateElevenLabsSpeech', { 
                text, 
                voice_id: voice 
              });
              if (data.audio_url) {
                setAudioTrack({ url: data.audio_url, name: 'דיבוב - ' + voice, volume: 100 });
                toast.success('דיבוב ElevenLabs נוסף! 🎙️');
                setShowAdvancedTTSModal(false);
              } else {
                toast.error('לא הצליח ליצור דיבוב');
              }
            } catch (error) {
              toast.error('שגיאה: ' + error.message);
            } finally {
              setLoading(false);
            }
          }}
        />
      )}

      {/* Ad Creator Modal */}
      {showAdCreatorModal && (
        <AdCreatorModal 
          onClose={() => setShowAdCreatorModal(false)}
          onApply={(adClip) => {
            setClips(prev => [...prev, adClip]);
            setShowAdCreatorModal(false);
            toast.success('פרסומה נוספה לעורך! 📢');
          }}
        />
      )}

      {/* Stock Video Library Modal */}
      {showStockVideoModal && (
        <StockVideoLibraryModal 
          onClose={() => setShowStockVideoModal(false)}
          onApply={(videoData) => {
            setClips(prev => [...prev, videoData]);
            setShowStockVideoModal(false);
          }}
        />
      )}

      {/* Luma Video Generator Modal */}
      {showLumaGeneratorModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowLumaGeneratorModal(false)}>
          <div className="bg-gradient-to-br from-purple-900/90 to-black border border-purple-500/30 rounded-2xl p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles size={24} className="text-purple-400" />
              צור סרטון AI של הרשת החדשה
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  תיאור הסרטון
                </label>
                <Textarea
                  id="luma-prompt"
                  placeholder="לדוגמה: דרקון זהוב עף מעל הרים מושלגים בשקיעה..."
                  className="bg-black/60 border-purple-500/30 text-white placeholder-white/40 resize-none"
                  rows={4}
                />
                <p className="text-xs text-gray-400 mt-1">
                  💡 תאר תנועות, אפקטים, ושינויים שתרצה לראות
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  יחס תצוגה
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "16:9", label: "רחב (16:9)", icon: Film },
                    { value: "9:16", label: "אנכי (9:16)", icon: Film },
                    { value: "1:1", label: "מרובע (1:1)", icon: Film }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={(e) => {
                        document.querySelectorAll('[data-aspect-ratio]').forEach(el => el.classList.remove('border-purple-500', 'bg-purple-500/20'));
                        e.currentTarget.classList.add('border-purple-500', 'bg-purple-500/20');
                        e.currentTarget.setAttribute('data-selected', 'true');
                      }}
                      data-aspect-ratio={option.value}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        option.value === '16:9' 
                          ? 'border-purple-500 bg-purple-500/20 text-white' 
                          : 'border-purple-500/30 bg-black/40 text-gray-400 hover:border-purple-500/50'
                      }`}
                    >
                      <option.icon size={20} />
                      <span className="text-xs font-semibold">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-4">
                <p className="text-sm text-purple-200 font-semibold mb-2 flex items-center gap-2">
                  <Sparkles size={16} />
                  טיפים ליצירת סרטון מושלם:
                </p>
                <ul className="text-xs text-purple-300 space-y-1">
                  <li>• תאר תנועות ספציפיות: "הדמות מסתובבת ימינה"</li>
                  <li>• הוסף פרטי תאורה: "באור זהוב", "בשקיעה"</li>
                  <li>• ציין מהירות: "בתנועה איטית", "במהירות"</li>
                  <li>• תאר אפקטים: "עם עשן ברקע", "ניצוצות"</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowLumaGeneratorModal(false)}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  ביטול
                </Button>
                <Button
                  onClick={() => {
                    const prompt = document.getElementById('luma-prompt').value;
                    if (!prompt.trim()) {
                      toast.error('אנא הזן תיאור לסרטון');
                      return;
                    }
                    const aspectButton = document.querySelector('[data-aspect-ratio][data-selected="true"]');
                    const aspectRatio = aspectButton?.getAttribute('data-aspect-ratio') || '16:9';
                    handleAddLumaClip(prompt, aspectRatio);
                  }}
                  disabled={loading}
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
                      צור סרטון
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
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