
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
        MoveHorizontal, Film, Loader2, Save, Eye, Type, Image as ImageIcon, FolderOpen, X, Clock, Check, Crown, User
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
      
import TimelineEditor from '../components/videoeditor/TimelineEditor';
import AIVideoFromImagesModal from '../components/videoeditor/AIVideoFromImagesModal';
import ExportVideoModal from '../components/videoeditor/ExportVideoModal';
import SampleVideosModal from '../components/videoeditor/SampleVideosModal';
import KlingCharacterModal from '../components/videoeditor/KlingCharacterModal';

// Projects Modal Component
function ProjectsModal({ onClose, onLoad }) {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['video-projects'],
    queryFn: async () => {
      const email = localStorage.getItem('user_email');
      if (!email) return [];
      return await base44.entities.VideoProject.filter({ creator_email: email }, '-created_date', 50);
    }
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
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
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [userEmail, setUserEmail] = useState('');
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

  const [videoLoop, setVideoLoop] = useState(false);
  const [showAIVideoFromImagesModal, setShowAIVideoFromImagesModal] = useState(false);
  const [showLumaGeneratorModal, setShowLumaGeneratorModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [contextClipIndex, setContextClipIndex] = useState(null);
  const [showSampleVideosModal, setShowSampleVideosModal] = useState(false);
  const [showKlingCharacterModal, setShowKlingCharacterModal] = useState(false);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // בדיקת גישה למנוי
  useEffect(() => {
    const checkSubscription = async () => {
      setHasAccess(false);
      
      try {
        const storedEmail = localStorage.getItem('user_email');
        
        if (!storedEmail) {
          setCheckingAccess(false);
          return;
        }
        
        setUserEmail(storedEmail);
        
        // בדוק מנוי פעיל
        const subs = await base44.entities.Subscription.filter(
          { user_email: storedEmail, status: 'active' }, 
          '-created_date', 
          1
        );
        
        if (!subs || subs.length === 0) {
          setCheckingAccess(false);
          return;
        }
        
        const activeSub = subs[0];

        // בדיקה שהמנוי לא פג תוקף
        if (activeSub.end_date && new Date(activeSub.end_date) < new Date()) {
          setCheckingAccess(false);
          return;
        }

        setHasAccess(true);
        
        // שלח הודעה שהמשתמש נכנס לעורך
        try {
          await base44.functions.invoke('logPaymentSuccess', {
            userEmail: storedEmail,
            sessionId: activeSub.stripe_subscription_id,
            priceId: activeSub.stripe_subscription_id
          });
        } catch (e) {
          console.log('Could not log access:', e);
        }
      } catch (err) {
        console.error('Subscription check error:', err);
      } finally {
        setCheckingAccess(false);
      }
    };
    
    checkSubscription();
  }, []);

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
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      if (isImage) {
        setClips(prev => [...prev, {
          id: Date.now(),
          url: file_url,
          duration: 5,
          name: file.name,
          thumbnail: file_url,
          filters: { brightness: 100, contrast: 100, saturation: 100 },
          volume: 0,
          type: 'image'
        }]);
        toast.success('תמונה נוספה בהצלחה');
        setLoading(false);
      } else {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.crossOrigin = 'anonymous';

        const handleMetadata = () => {
          const duration = video.duration;
          video.currentTime = Math.min(1, duration * 0.1);

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
                url: file_url,
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
              setClips(prev => [...prev, {
                id: Date.now(),
                url: file_url,
                localUrl: video.src,
                duration: duration,
                name: file.name,
                thumbnail: file_url,
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

  // Remove clip
  const removeClip = (index) => {
    setClips(prev => prev.filter((_, i) => i !== index));
    if (selectedClipIndex === index) setSelectedClipIndex(null);
    toast.success('קליפ הוסר');
  };

  // Duplicate clip
  const duplicateClip = (index) => {
    const clipToDuplicate = clips[index];
    const newClip = {
      ...clipToDuplicate,
      id: Date.now()
    };
    setClips(prev => [...prev.slice(0, index + 1), newClip, ...prev.slice(index + 1)]);
    toast.success('קליפ שוכפל! 📋');
    setContextMenu(null);
    setContextClipIndex(null);
  };



  // Update transition
  const updateTransition = (afterClipIndex, transitionType) => {
    setTransitions(prev => ({
      ...prev,
      [afterClipIndex]: transitionType
    }));
    toast.success(`מעבר "${transitionType}" הוחל בין קליפים! 🎬`);
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
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAudioTrack({
        url: file_url,
        name: file.name,
        volume: 100,
        loop: true
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

  // Handle clip ended
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (playingAll && selectedClipIndex !== null && selectedClipIndex < clips.length - 1) {
        const transition = transitions[selectedClipIndex] || 'cut';
        const transitionDuration = transition === 'cut' ? 0 : 500;
        
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

  // Save project
  const handleSaveProject = async () => {
    if (clips.length === 0) {
      toast.error('אין קליפים לשמירה');
      return;
    }

    setLoading(true);
    try {
      const email = localStorage.getItem('user_email');
      if (!email) {
        toast.error('אין מייל - עבור ל/Subscription תחילה');
        setLoading(false);
        return;
      }

      const title = projectTitle || `פרויקט חדש - ${new Date().toLocaleDateString('he-IL')}`;

      const projectData = {
        title,
        clips: clips.map(clip => ({
          id: clip.id,
          url: clip.url,
          duration: clip.duration,
          name: clip.name,
          thumbnail: clip.thumbnail,
          filters: clip.filters,
          volume: clip.volume,
          type: clip.type
        })),
        audioTrack,
        transitions,
        overlays,
        thumbnail: clips[0]?.thumbnail || clips[0]?.url,
        duration: totalDuration,
        creator_email: email
      };

      await base44.entities.VideoProject.create(projectData);

      setProjectTitle(title);
      toast.success(`הפרויקט "${title}" נשמר בהצלחה!`);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('שגיאה בשמירה: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Load project
  const handleLoadProject = async (project) => {
    try {
      setLoading(true);
      
      const loadedClips = (project.clips || []).map(clip => ({
        ...clip,
        id: clip.id || Date.now(),
        type: clip.type || 'video',
        filters: clip.filters || { brightness: 100, contrast: 100, saturation: 100 },
        volume: clip.volume ?? 100,
        duration: clip.duration || 10
      }));

      setClips(loadedClips);
      setAudioTrack(project.audioTrack || null);
      setTransitions(project.transitions || {});
      setOverlays(project.overlays || []);
      setProjectTitle(project.title);
      setShowProjectsModal(false);
      toast.success(`הפרויקט "${project.title}" נטען בהצלחה! 📂`);
    } catch (error) {
      toast.error('שגיאה בטעינה: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Export - פתח Modal
  const handleExport = () => {
    if (clips.length === 0) {
      toast.error('אין קליפים לייצוא');
      return;
    }
    setShowExportModal(true);
  };

  const selectedClip = selectedClipIndex !== null ? clips[selectedClipIndex] : null;

  // אם עדיין בודק
  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-purple-400" />
      </div>
    );
  }

  // אם אין גישה - הפנה לדף מנוי
  if (!hasAccess) {
    window.location.href = '/Subscription';
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 border-b border-purple-300 p-4 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a 
              href="/"
              className="px-4 py-2 border border-white/30 text-white hover:bg-white/20 rounded-md transition-colors text-sm"
            >
              ← חזרה לאתר
            </a>
            <div>
              <h1 className="text-2xl font-bold text-white">עורך סרטונים מתקדם</h1>
              <p className="text-sm text-purple-100">ערוך, חבר והוסף אפקטים לסרטונים שלך</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowProjectsModal(true)} variant="outline" className="border-white/30 text-white hover:bg-white/20">
              <FolderOpen size={18} className="mr-2" />
              הפרויקטים שלי
            </Button>
            <Button onClick={handleSaveProject} disabled={clips.length === 0} variant="outline" className="border-white/30 text-white hover:bg-white/20">
              <Save size={18} className="mr-2" />
              שמור פרויקט
            </Button>
            <Button onClick={handlePlayAll} disabled={clips.length === 0} className="bg-green-600 hover:bg-green-700 text-white font-bold">
              {playingAll ? <><Pause size={20} className="mr-2" />מפעיל...</> : <><Play size={20} className="mr-2" />הפעל הכל</>}
            </Button>
            <Button onClick={handleExport} disabled={clips.length === 0} className="bg-purple-600 hover:bg-purple-700 text-white">
              <><Download size={18} className="mr-2" />ייצוא סרטון</>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden" dir="rtl">
        {/* Main Content - Preview + Timeline */}
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
          {/* Preview - Top Center */}
          <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-gray-100 to-gray-200">
            {selectedClip ? (
              <div className="relative w-full max-w-4xl">
                <div className="relative bg-black rounded-2xl shadow-2xl overflow-hidden">
                  {selectedClip.type === 'image' ? (
                    <img 
                      src={selectedClip.url} 
                      className="w-full" 
                      style={{ filter: `brightness(${selectedClip.filters.brightness}%) contrast(${selectedClip.filters.contrast}%) saturate(${selectedClip.filters.saturation}%)` }} 
                      alt={selectedClip.name} 
                    />
                  ) : (
                    <video 
                      ref={videoRef} 
                      src={selectedClip.localUrl || selectedClip.url} 
                      className="w-full" 
                      style={{ filter: `brightness(${selectedClip.filters.brightness}%) contrast(${selectedClip.filters.contrast}%) saturate(${selectedClip.filters.saturation}%)` }} 
                      controls 
                    />
                  )}
                </div>
                <div className="mt-3 text-center">
                  <p className="text-gray-600 text-sm">קליפ {selectedClipIndex + 1}/{clips.length}</p>
                  <p className="text-gray-500 text-xs">{selectedClip.duration?.toFixed(1)}s • {selectedClip.name}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <Film size={64} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">בחר קליפ מציר הזמן למטה</p>
              </div>
            )}
          </div>

          {/* Timeline - Bottom */}
          <div className="h-40 bg-white border-t border-gray-300 p-3 shrink-0">
            {clips.length === 0 ? (
                <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <div className="text-center">
                    <Film size={48} className="mx-auto mb-2 opacity-30 text-gray-400" />
                    <p className="text-gray-500 text-sm">גרור סרטונים לכאן או לחץ "העלה" בסרגל הימני</p>
                  </div>
                </div>
              ) : (
                <div className="h-full overflow-x-scroll overflow-y-hidden">
                  <div className="flex items-center gap-1 h-full min-w-max pb-2">
                      {clips.map((clip, index) => {
                          const widthPerSecond = 70;
                          const clipWidth = Math.max(80, (clip.duration || 1) * widthPerSecond);
                          const transition = transitions[index];

                          return (
                            <React.Fragment key={clip.id}>
                              <motion.div
                                layout
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className={`relative rounded-lg overflow-hidden flex-shrink-0 transition-all group border-2 cursor-pointer ${selectedClipIndex === index ? 'ring-4 ring-blue-500 border-blue-500' : 'border-gray-300 hover:border-blue-400'}`}
                                style={{ 
                                  width: `${clipWidth}px`,
                                  height: '110px',
                                  backgroundColor: '#fff'
                                }}
                                onClick={() => setSelectedClipIndex(index)}
                              >
                                {/* Thumbnail - Visible Video Preview */}
                                <div className="absolute inset-0">
                                  {clip.type === 'image' ? (
                                    <img 
                                      src={clip.thumbnail || clip.url} 
                                      alt={clip.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <video 
                                      src={clip.url} 
                                      className="w-full h-full object-cover"
                                      muted
                                      playsInline
                                    />
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>

                                {/* Clip Info */}
                                <div className="absolute bottom-0 left-0 right-0 p-2">
                                  <p className="text-white text-[10px] font-semibold truncate drop-shadow">{clip.name}</p>
                                  <p className="text-white text-[9px] bg-black/60 px-1 py-0.5 rounded inline-block">{clip.duration?.toFixed(1)}s</p>
                                </div>

                                {/* Delete Button */}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); removeClip(index); }} 
                                  className="absolute top-1 left-1 p-1 bg-red-500 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all z-10 shadow-lg"
                                >
                                  <Trash2 size={12} className="text-white" />
                                </button>
                              </motion.div>

                              {/* Transition Button */}
                              {index < clips.length - 1 && (
                                <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '50px' }}>
                                  {transition && transition !== 'cut' ? (
                                    <div className="flex flex-col items-center gap-1">
                                      <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center shadow-md">
                                        <Sparkles size={18} className="text-white" />
                                      </div>
                                      <span className="text-[8px] text-gray-600 font-semibold">
                                        {transition}
                                      </span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        const newTransition = prompt('בחר מעבר:\ncut, fade, dissolve, slide, wipe, zoom');
                                        if (newTransition) updateTransition(index, newTransition);
                                      }}
                                      className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 border-2 border-dashed border-gray-400 flex items-center justify-center transition-all"
                                      title="הוסף מעבר"
                                    >
                                      <Plus size={20} className="text-gray-600" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Tools */}
        <div className="w-20 bg-white border-r border-gray-300 p-2 overflow-y-auto flex flex-col gap-2 items-center relative z-10">
          <input type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska,image/png,image/jpeg,image/jpg,image/gif" onChange={handleAddClip} className="hidden" id="video-upload" />
          <button onClick={() => document.getElementById('video-upload').click()} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg w-full" title="העלה">
            <Upload size={24} className="text-gray-700" />
            <span className="text-[9px] text-gray-600">העלה</span>
          </button>

          <button onClick={() => setShowSampleVideosModal(true)} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg w-full" title="דוגמאות">
            <Play size={24} className="text-gray-700" />
            <span className="text-[9px] text-gray-600">סרטונים</span>
          </button>

          <button onClick={() => setShowLumaGeneratorModal(true)} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg w-full" title="AI">
            <Sparkles size={24} className="text-gray-700" />
            <span className="text-[9px] text-gray-600">AI</span>
          </button>

          <button onClick={() => setShowAIImageModal(true)} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg w-full" title="תמונה">
            <ImageIcon size={24} className="text-gray-700" />
            <span className="text-[9px] text-gray-600">תמונה</span>
          </button>

          <button onClick={() => setShowKlingCharacterModal(true)} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg w-full" title="דמות">
            <User size={24} className="text-gray-700" />
            <span className="text-[9px] text-gray-600">דמות</span>
          </button>

          <input type="file" accept="audio/*" onChange={handleAddAudio} className="hidden" id="audio-upload" />
          <button onClick={() => document.getElementById('audio-upload').click()} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg w-full" title="מוזיקה">
            <Music size={24} className="text-gray-700" />
            <span className="text-[9px] text-gray-600">מוזיקה</span>
          </button>

          <button onClick={() => setShowOverlayModal(true)} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg w-full" title="טקסט">
            <Type size={24} className="text-gray-700" />
            <span className="text-[9px] text-gray-600">טקסט</span>
          </button>

          <button onClick={() => setShowElementsModal(true)} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg w-full" title="אלמנטים">
            <Sparkles size={24} className="text-gray-700" />
            <span className="text-[9px] text-gray-600">אלמנטים</span>
          </button>

          <div className="border-t border-gray-300 w-full my-1"></div>

          <button onClick={() => setShowEffectsModal(true)} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg w-full" title="אפקטים">
            <Sparkles size={24} className="text-gray-700" />
            <span className="text-[9px] text-gray-600">אפקטים</span>
          </button>

          <button onClick={() => setShowResizeModal(true)} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg w-full" title="גודל">
            <Film size={24} className="text-gray-700" />
            <span className="text-[9px] text-gray-600">גודל</span>
          </button>
        </div>
      </div>

      {showProjectsModal && <ProjectsModal onClose={() => setShowProjectsModal(false)} onLoad={handleLoadProject} />}

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

      {showTTSModal && (
        <TTSModal 
          onClose={() => setShowTTSModal(false)}
          onApply={async (text, voice) => {
            setLoading(true);
            try {
              const { data } = await base44.functions.invoke('generateElevenLabsSpeech', { text, voice_id: voice });
              if (data.audio_url) {
                setAudioTrack({ url: data.audio_url, name: 'דיבוב - ' + voice, volume: 100, loop: false });
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

      {showEffectsModal && <EffectsLibraryModal onClose={() => setShowEffectsModal(false)} onApplyEffect={(effect) => { if (selectedClipIndex !== null) { updateClipFilter(selectedClipIndex, 'effect', effect); toast.success(`אפקט ${effect} הוחל! ✨`); } }} onApplyTransition={(transition) => { if (selectedClipIndex !== null && selectedClipIndex < clips.length - 1) { updateTransition(selectedClipIndex, transition); toast.success(`מעבר ${transition} הוחל! 🎬`); } }} />}

      {showSpeedModal && selectedClip && <SpeedControlModal onClose={() => setShowSpeedModal(false)} currentSpeed={selectedClip.speed || 1} onApply={(speed) => { setClips(prev => prev.map((clip, i) => i === selectedClipIndex ? { ...clip, speed } : clip)); toast.success(`מהירות שונתה ל-${speed}x! ⚡`); }} />}

      {showResizeModal && <ResizeModal onClose={() => setShowResizeModal(false)} onApply={(aspectRatio) => { setClips(prev => prev.map(clip => ({ ...clip, aspectRatio }))); toast.success(`שונה ל-${aspectRatio}! 📐`); }} />}

      {showElementsModal && <ElementsLibraryModal onClose={() => setShowElementsModal(false)} onApply={(element) => { 
        const processedElement = {
          ...element,
          // Ensure all required properties exist for timeline display
          style: element.style || { color: element.color || '#FFFFFF', fontSize: 24 },
          content: element.content || element.text || element.name || 'אלמנט',
        };
        setOverlays(prev => [...prev, processedElement]); 
        toast.success('אלמנט נוסף לציר הזמן! ✨'); 
      }} />}

      {showMusicLibraryModal && <MusicLibraryModal onClose={() => setShowMusicLibraryModal(false)} onApply={(music) => { setAudioTrack({ url: music.url, name: music.name, volume: 100, loop: true }); toast.success(`${music.name} נוסף! 🎵`); }} />}

      {showPIPModal && <PIPOverlay onClose={() => setShowPIPModal(false)} onApply={(pipData) => { setPipLayers(prev => [...prev, pipData]); toast.success('PIP נוסף בהצלחה! 📹'); }} />}

      {showAIImageModal && <AIImageGeneratorModal onClose={() => setShowAIImageModal(false)} onApply={(imageData) => { setClips(prev => [...prev, { id: Date.now(), ...imageData, filters: { brightness: 100, contrast: 100, saturation: 100 }, volume: 0 }]); setShowAIImageModal(false); }} />}

      {showAdvancedTTSModal && (
        <AdvancedTTSModal 
          onClose={() => setShowAdvancedTTSModal(false)}
          onApply={async (text, voice) => {
            setLoading(true);
            try {
              const { data } = await base44.functions.invoke('generateElevenLabsSpeech', { text, voice_id: voice });
              if (data.audio_url) {
                setAudioTrack({ url: data.audio_url, name: 'דיבוב - ' + voice, volume: 100, loop: false });
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

      {showAdCreatorModal && <AdCreatorModal onClose={() => setShowAdCreatorModal(false)} onApply={(adClip) => { setClips(prev => [...prev, adClip]); setShowAdCreatorModal(false); toast.success('פרסומת נוספה לעורך! 📢'); }} />}


      {showAIVideoFromImagesModal && <AIVideoFromImagesModal onClose={() => setShowAIVideoFromImagesModal(false)} onApply={(clips) => { setClips(prev => [...prev, ...clips]); setShowAIVideoFromImagesModal(false); }} />}

      {showSampleVideosModal && <SampleVideosModal onClose={() => setShowSampleVideosModal(false)} onApply={(clip) => { setClips(prev => [...prev, clip]); setShowSampleVideosModal(false); }} />}

      {showKlingCharacterModal && <KlingCharacterModal onClose={() => setShowKlingCharacterModal(false)} onApply={(clip) => { setClips(prev => [...prev, clip]); setShowKlingCharacterModal(false); }} />}

      {showExportModal && (
        <ExportVideoModal 
          onClose={() => setShowExportModal(false)}
          clips={clips}
          totalDuration={totalDuration}
          userEmail={userEmail}
          loading={exporting}
          setLoading={setExporting}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => {
              setContextMenu(null);
              setContextClipIndex(null);
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 bg-gray-900 border border-white/20 rounded-xl shadow-lg overflow-hidden"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`
            }}
          >
            <button
              onClick={() => {
                if (contextClipIndex !== null) {
                  duplicateClip(contextClipIndex);
                }
              }}
              className="w-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Film size={16} />
              שכפל קליפ
            </button>
            <button
              onClick={() => {
                if (contextClipIndex !== null) {
                  removeClip(contextClipIndex);
                }
              }}
              className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Trash2 size={16} />
              מחק קליפ
            </button>
          </motion.div>
        </>
      )}

      {showLumaGeneratorModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-gray-900">צור סרטון AI</h3>
            <Textarea id="luma-prompt" placeholder="תאר את הסרטון..." rows={3} className="mb-4" />
            <div className="flex gap-2">
              <Button onClick={() => setShowLumaGeneratorModal(false)} variant="outline" className="flex-1">ביטול</Button>
              <Button onClick={async () => {
                const prompt = document.getElementById('luma-prompt')?.value;
                if (!prompt?.trim()) { toast.error('הזן תיאור'); return; }
                setShowLumaGeneratorModal(false);
                setLoading(true);
                try {
                  toast.info('יוצר סרטון... ⏳');
                  const { data } = await base44.functions.invoke('createLumaVideo', { prompt, aspectRatio: '16:9' });
                  if (data?.video_url) {
                    const newClip = {
                      id: Date.now(),
                      url: data.video_url,
                      localUrl: data.video_url,
                      duration: 5, // Default duration, actual might be different
                      name: prompt.substring(0, 30),
                      thumbnail: data.thumbnail_url || data.video_url,
                      filters: { brightness: 100, contrast: 100, saturation: 100 },
                      volume: 100,
                      type: 'video'
                    };
                    setClips(prev => {
                      const updated = [...prev, newClip];
                      setTimeout(() => setSelectedClipIndex(updated.length - 1), 200);
                      return updated;
                    });
                    if (data.audio_url) {
                      setAudioTrack({ url: data.audio_url, name: 'דיבוב - ' + prompt.substring(0, 20), volume: 100, loop: false });
                      toast.success('סרטון חדש + דיבוב נוספו! 🎬🎤');
                    } else {
                      toast.success('סרטון חדש נוסף! 🎬');
                    }
                  } else if (data?.still_processing) {
                    toast.info('הסרטון בתהליך... נסה שוב בעוד רגע');
                  } else {
                    toast.error('לא התקבל סרטון: ' + JSON.stringify(data));
                  }
                } catch (err) { toast.error('שגיאה: ' + err.message); } finally { setLoading(false); }
              }} className="flex-1 bg-purple-600 text-white">
                {loading ? <><Loader2 size={18} className="mr-2 animate-spin" />יוצר...</> : <><Sparkles size={18} className="mr-2" />צור סרטון</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showOverlayModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900">הוסף טקסט</h3>
            <Input id="overlay-text" placeholder="הכנס טקסט..." className="mb-3" />
            <div className="flex gap-2 mb-4">
              <Input id="text-color" type="color" defaultValue="#ffffff" className="w-20" />
              <Input id="text-size" type="number" placeholder="גודל" defaultValue="24" />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowOverlayModal(false)} variant="outline" className="flex-1">ביטול</Button>
              <Button onClick={() => {
                const text = document.getElementById('overlay-text')?.value;
                if (text?.trim()) {
                  setOverlays(prev => [...prev, { id: Date.now(), type: 'text', content: text, position: { x: 50, y: 50 }, style: { fontSize: parseInt(document.getElementById('text-size')?.value || '24'), color: document.getElementById('text-color')?.value || '#ffffff' } }]);
                  setShowOverlayModal(false);
                  toast.success('טקסט נוסף!');
                }
              }} className="flex-1 bg-blue-600">הוסף</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
