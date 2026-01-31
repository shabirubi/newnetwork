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
        MoveHorizontal, Film, Loader2, Save, Eye, Type, Image as ImageIcon, FolderOpen, X, Clock, Check, Crown
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
      import TimelineEditor from '../components/videoeditor/TimelineEditor';
import AIVideoFromImagesModal from '../components/videoeditor/AIVideoFromImagesModal';
import ExportVideoModal from '../components/videoeditor/ExportVideoModal';

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
  const [showStockVideoModal, setShowStockVideoModal] = useState(false);
  const [videoLoop, setVideoLoop] = useState(false);
  const [showAIVideoFromImagesModal, setShowAIVideoFromImagesModal] = useState(false);
  const [showLumaGeneratorModal, setShowLumaGeneratorModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [contextClipIndex, setContextClipIndex] = useState(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // בדיקת גישה למנוי
  useEffect(() => {
    const checkSubscription = async () => {
      setHasAccess(false); // ברירת מחדל - אין גישה
      
      try {
        // קודם כל ננסה לקבל מייל מ-localStorage
        const storedEmail = localStorage.getItem('user_email');
        
        if (!storedEmail) {
          console.log('No email in localStorage - redirecting to subscription');
          setCheckingAccess(false);
          return;
        }
        
        setUserEmail(storedEmail);
        console.log('Checking subscription for:', storedEmail);
        
        const subs = await base44.entities.Subscription.filter({ user_email: storedEmail }, '-created_date', 10);
        console.log('Subscriptions found:', subs?.length || 0);
        
        if (!subs || subs.length === 0) {
          console.log('No subscriptions - removing email and redirecting');
          localStorage.removeItem('user_email');
          setCheckingAccess(false);
          return;
        }
        
        const activeSub = subs.find(s => s.status === 'active');
        console.log('Active subscription?', !!activeSub);
        
        if (activeSub) {
          // בדיקה שהמנוי לא פג תוקף
          if (activeSub.end_date && new Date(activeSub.end_date) < new Date()) {
            console.log('Subscription expired');
            localStorage.removeItem('user_email');
            setCheckingAccess(false);
            return;
          }
          setHasAccess(true);
        } else {
          localStorage.removeItem('user_email');
        }
      } catch (err) {
        console.error('Subscription check error:', err);
        localStorage.removeItem('user_email');
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
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E31E24]/20 to-black border-b border-[#E31E24]/30 p-4 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a 
              href="/"
              className="px-4 py-2 border border-white/20 text-white hover:bg-white/10 rounded-md transition-colors text-sm"
            >
              ← חזרה לאתר
            </a>
            <div>
              <h1 className="text-2xl font-bold">עורך סרטונים מתקדם</h1>
              <p className="text-sm text-gray-400">ערוך, חבר והוסף אפקטים לסרטונים שלך</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowProjectsModal(true)} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <FolderOpen size={18} className="mr-2" />
              הפרויקטים שלי
            </Button>
            <Button onClick={handleSaveProject} disabled={clips.length === 0} variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-600/20">
              <Save size={18} className="mr-2" />
              שמור פרויקט
            </Button>
            <Button onClick={handlePlayAll} disabled={clips.length === 0} className="bg-green-600 hover:bg-green-700 text-white font-bold">
              {playingAll ? <><Pause size={20} className="mr-2" />מפעיל...</> : <><Play size={20} className="mr-2" />הפעל הכל</>}
            </Button>
            <button onClick={() => setVideoLoop(!videoLoop)} className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${videoLoop ? 'bg-cyan-600/40 text-cyan-300 border border-cyan-500' : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20'}`}>
              {videoLoop ? '🔄 לופ פעיל' : '🔄 לופ'}
            </button>
            <Button onClick={handleExport} disabled={clips.length === 0} className="bg-[#E31E24] hover:bg-[#B91C1C] text-white">
              <><Download size={18} className="mr-2" />ייצוא סרטון</>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden" dir="rtl">
        {/* Left Side - Timeline + Preview */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-900 to-black overflow-hidden">
          {/* Professional Timeline - Top */}
          <div className="h-48 bg-gradient-to-b from-black via-gray-900 to-black border-b border-white/10 p-4 overflow-hidden shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Film size={18} className="text-[#E31E24]" />
                <h3 className="font-bold">ציר זמן מקצועי</h3>
                <span className="text-xs text-gray-400">({clips.length} קליפים, {totalDuration.toFixed(2)}s)</span>
              </div>
              <div className="text-xs text-gray-500">גרור קליפ • מתח קצוות • שנה סדר</div>
            </div>

            {clips.length === 0 ? (
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-white/20 rounded-xl">
                  <div className="text-center">
                    <Film size={48} className="mx-auto mb-2 opacity-30 text-gray-500" />
                    <p className="text-gray-500">גרור סרטונים לכאן או לחץ "העלה"</p>
                  </div>
                </div>
              ) : (
                <div className="relative h-32 bg-black/40 rounded-xl border border-white/10 p-2 overflow-x-scroll scrollbar-thumb-red-500 scrollbar-track-gray-900 scrollbar-thin">
                  {/* Time ruler */}
                  <div className="flex items-center gap-1 mb-2 text-[10px] text-gray-500 px-2 flex-shrink-0">
                  {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, i) => (
                    <div key={i} className="flex-shrink-0" style={{ width: '60px' }}>
                      <div className="border-l border-white/20 h-2"></div>
                      <span>{i}s</span>
                    </div>
                  ))}
                </div>

                {/* Clips Track - Custom Drag Implementation */}
                <div className="relative h-20 bg-black/20 rounded-lg border border-white/5 p-1 flex items-center gap-1">
                  {clips.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                      אין קליפים
                    </div>
                  ) : (
                    clips.map((clip, index) => {
                      const widthPerSecond = 60;
                      const clipWidth = Math.max(60, (clip.duration || 1) * widthPerSecond);

                      return (
                        <motion.div
                          key={clip.id}
                          layout
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className={`relative rounded-lg overflow-hidden flex-shrink-0 transition-all group ${selectedClipIndex === index ? 'ring-2 ring-[#E31E24] shadow-lg shadow-[#E31E24]/30' : 'hover:ring-2 hover:ring-white/30'}`}
                          style={{ 
                            width: `${clipWidth}px`,
                            height: '70px',
                            cursor: 'grab'
                          }}
                          onClick={() => setSelectedClipIndex(index)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setContextMenu({ x: e.clientX, y: e.clientY });
                            setContextClipIndex(index);
                          }}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('clipIndex', index.toString());
                            setSelectedClipIndex(index);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const sourceIndex = parseInt(e.dataTransfer.getData('clipIndex'));
                            if (sourceIndex !== index) {
                              const newClips = [...clips];
                              const [movedClip] = newClips.splice(sourceIndex, 1);
                              newClips.splice(index, 0, movedClip);
                              setClips(newClips);
                              toast.success('קליפים סודרו מחדש!');
                            }
                          }}
                        >
                                    {/* Thumbnail */}
                                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${clip.thumbnail || clip.url})` }}>
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                    </div>

                                    {/* Clip Info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-1.5 text-[10px]">
                                      <div className="font-bold truncate text-white">{clip.name}</div>
                                      <div className="text-[#E31E24] font-semibold">{clip.duration?.toFixed(2)}s</div>
                                    </div>

                                    {/* Delete Button */}
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); removeClip(index); }} 
                                      className="absolute top-1 left-1 p-1 bg-red-600/90 rounded hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
                                    >
                                      <Trash2 size={12} />
                                    </button>

                                    {/* Left Resize Handle */}
                                    <div
                                      className="absolute left-0 top-0 bottom-0 w-2.5 bg-[#E31E24]/80 cursor-ew-resize hover:bg-[#E31E24] hover:w-3 transition-all z-40 hover:shadow-lg"
                                      title="גרור לשינוי תחילה"
                                      onMouseDown={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        const startX = e.clientX;
                                        const startDuration = clip.duration || 1;
                                        const widthPerSecond = 60;

                                        const handleMouseMove = (moveE) => {
                                          const deltaX = startX - moveE.clientX;
                                          const deltaDuration = deltaX / widthPerSecond;
                                          const newDuration = Math.max(0.5, startDuration + deltaDuration);

                                          setClips(prev => prev.map((c, i) => 
                                            i === index ? { ...c, duration: parseFloat(newDuration.toFixed(2)) } : c
                                          ));
                                        };

                                        const handleMouseUp = () => {
                                          document.removeEventListener('mousemove', handleMouseMove);
                                          document.removeEventListener('mouseup', handleMouseUp);
                                          toast.success(`משך עודכן ל-${clip.duration?.toFixed(2)}s`);
                                        };

                                        document.addEventListener('mousemove', handleMouseMove);
                                        document.addEventListener('mouseup', handleMouseUp);
                                      }}
                                    />

                                    {/* Right Resize Handle */}
                                    <div
                                      className="absolute right-0 top-0 bottom-0 w-2.5 bg-[#E31E24]/80 cursor-ew-resize hover:bg-[#E31E24] hover:w-3 transition-all z-40 hover:shadow-lg"
                                      title="גרור לשינוי סוף"
                                      onMouseDown={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        const startX = e.clientX;
                                        const startDuration = clip.duration || 1;
                                        const widthPerSecond = 60;

                                        const handleMouseMove = (moveE) => {
                                          const deltaX = moveE.clientX - startX;
                                          const deltaDuration = deltaX / widthPerSecond;
                                          const newDuration = Math.max(0.5, startDuration + deltaDuration);

                                          setClips(prev => prev.map((c, i) => 
                                            i === index ? { ...c, duration: parseFloat(newDuration.toFixed(2)) } : c
                                          ));
                                        };

                                        const handleMouseUp = () => {
                                          document.removeEventListener('mousemove', handleMouseMove);
                                          document.removeEventListener('mouseup', handleMouseUp);
                                          toast.success(`משך עודכן ל-${clip.duration?.toFixed(2)}s`);
                                        };

                                        document.addEventListener('mousemove', handleMouseMove);
                                        document.addEventListener('mouseup', handleMouseUp);
                                      }}
                                    />
                                    </motion.div>
                                    );
                                    })
                                    )}
                                    </div>
                                    </div>
            )}
          </div>

          {/* Preview - Below Timeline */}
          <div className="flex-1 flex items-center justify-center p-4 relative overflow-auto">
            {selectedClip ? (
              <div className="relative w-full max-w-5xl">
                <div className="absolute -top-2 -left-2 z-20 flex gap-2">
                  {selectedClip.type === 'video' && (
                    <button 
                      onClick={async () => {
                        try {
                          const response = await fetch(selectedClip.url);
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = selectedClip.name || 'video.mp4';
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                          toast.success('הסרטון הורד בהצלחה! ⬇️');
                        } catch (err) {
                          toast.error('שגיאה בהורדה');
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 p-3 rounded-full transition-all shadow-2xl"
                      title="הורד סרטון"
                    >
                      <Download size={24} className="text-white" />
                    </button>
                  )}
                  <button onClick={() => setSelectedClipIndex(null)} className="bg-red-600 hover:bg-red-700 p-3 rounded-full transition-all shadow-2xl">
                    <X size={24} className="text-white" />
                  </button>
                </div>

                <div className="relative bg-black rounded-2xl shadow-2xl p-2">
                  <div className="relative">
                    {selectedClip.type === 'image' ? (
                      <img src={selectedClip.url} className="w-full rounded-xl" style={{ filter: `brightness(${selectedClip.filters.brightness}%) contrast(${selectedClip.filters.contrast}%) saturate(${selectedClip.filters.saturation}%)` }} alt={selectedClip.name} />
                    ) : (
                      <video ref={videoRef} src={selectedClip.localUrl || selectedClip.url} className="w-full rounded-xl" style={{ filter: `brightness(${selectedClip.filters.brightness}%) contrast(${selectedClip.filters.contrast}%) saturate(${selectedClip.filters.saturation}%)` }} controls />
                    )}

                    {/* Overlays Display */}
                    {overlays.map((overlay, index) => (
                      <div
                        key={overlay.id}
                        className="absolute cursor-move"
                        style={{
                          left: `${overlay.position.x}%`,
                          top: `${overlay.position.y}%`,
                          zIndex: 20 + index
                        }}
                        draggable
                        onDragEnd={(e) => {
                          const rect = e.currentTarget.parentElement.getBoundingClientRect();
                          const x = ((e.clientX - rect.left) / rect.width) * 100;
                          const y = ((e.clientY - rect.top) / rect.height) * 100;
                          setOverlays(prev => prev.map(o => 
                            o.id === overlay.id ? { ...o, position: { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } } : o
                          ));
                        }}
                      >
                        {overlay.type === 'text' ? (
                          <div
                            style={{
                              color: overlay.style.color,
                              fontSize: `${overlay.style.fontSize}px`,
                              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                              fontWeight: 'bold',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {overlay.content}
                          </div>
                        ) : overlay.type === 'logo' ? (
                          <img 
                            src={overlay.url} 
                            style={{ 
                              width: `${overlay.size.width}px`, 
                              height: `${overlay.size.height}px` 
                            }} 
                            alt="logo" 
                          />
                        ) : null}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOverlays(prev => prev.filter(o => o.id !== overlay.id));
                            toast.success('אלמנט הוסר');
                          }}
                          className="absolute -top-2 -right-2 bg-red-600 p-1 rounded-full hover:bg-red-700 transition-colors"
                        >
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {pipLayers.map((pip, index) => {
                    const positionStyles = {
                      'top-left': { top: `${pip.config.offsetY}px`, left: `${pip.config.offsetX}px` },
                      'top-right': { top: `${pip.config.offsetY}px`, right: `${pip.config.offsetX}px` },
                      'bottom-left': { bottom: `${pip.config.offsetY}px`, left: `${pip.config.offsetX}px` },
                      'bottom-right': { bottom: `${pip.config.offsetY}px`, right: `${pip.config.offsetX}px` }
                    };

                    return (
                      <div key={index} className="absolute" style={{ ...positionStyles[pip.config.position], width: `${pip.config.size}%`, opacity: pip.config.opacity / 100, zIndex: 10 + index }}>
                        <video src={pip.video.localUrl || pip.video.url} className={`w-full ${pip.config.shape === 'circle' ? 'rounded-full' : 'rounded-xl'}`} style={{ border: `${pip.config.borderWidth}px solid ${pip.config.borderColor}`, boxShadow: pip.config.shadow ? '0 10px 40px rgba(0,0,0,0.5)' : 'none' }} autoPlay loop muted />
                        <button onClick={() => setPipLayers(prev => prev.filter((_, i) => i !== index))} className="absolute -top-2 -right-2 bg-red-600 p-1 rounded-full hover:bg-red-700 transition-colors">
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
                <div className="mt-3 flex items-center justify-between text-sm">
                  <div className="text-gray-400">קליפ {selectedClipIndex + 1}/{clips.length} • {selectedClip.name}</div>
                  {pipLayers.length > 0 && <div className="text-cyan-400 text-xs">{pipLayers.length} PIP Layers</div>}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Film size={64} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">הוסף קליפים כדי להתחיל לערוך</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Tools */}
        <div className="w-80 bg-black/50 border-r border-white/10 p-4 overflow-y-auto relative z-10">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Plus size={18} className="text-[#E31E24]" />
            הוסף תוכן
          </h3>

          <div className="space-y-2">
            <input type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska,image/png,image/jpeg,image/jpg,image/gif" onChange={handleAddClip} className="hidden" id="video-upload" />
            <div className="flex gap-2">
              <Button onClick={() => document.getElementById('video-upload').click()} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm" disabled={loading}>
                {loading ? <Loader2 size={16} className="ml-1 animate-spin" /> : <Upload size={16} className="ml-1" />}
                העלה
              </Button>
              <Button onClick={() => setShowStockVideoModal(true)} className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-sm">
                <Play size={16} className="ml-1" />
                ספריה
              </Button>
            </div>

            <Button onClick={() => setShowLumaGeneratorModal(true)} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm" disabled={loading}>
              <Sparkles size={16} className="ml-1" />
              סרטון AI
            </Button>

            <Button onClick={() => { if (!selectedClip || selectedClip.type === 'image') { toast.error('בחר סרטון כדי להאריך אותו'); return; } setShowLumaGeneratorModal(true); }} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-sm" disabled={loading || !selectedClip || selectedClip?.type === 'image'}>
              <Clock size={16} className="ml-1" />
              המשך סרטון
            </Button>

            <Button onClick={() => setShowAIVideoFromImagesModal(true)} className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white text-sm" disabled={loading}>
              <Film size={16} className="ml-1" />
              מתמונות
            </Button>

            <Button onClick={() => setShowAIImageModal(true)} className="w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white text-sm">
              <ImageIcon size={16} className="ml-1" />
              תמונה AI
            </Button>

            <input type="file" accept="audio/*" onChange={handleAddAudio} className="hidden" id="audio-upload" />
            <div className="flex gap-2">
              <Button onClick={() => document.getElementById('audio-upload').click()} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm">
                <Music size={16} className="ml-1" />
                מוזיקה
              </Button>
              <Button onClick={() => setShowMusicLibraryModal(true)} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm">
                <Music size={16} className="ml-1" />
                ספרייה
              </Button>
            </div>

            <Button onClick={() => setShowOverlayModal(true)} className="w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-white text-sm">
              <Type size={16} className="ml-1" />
              טקסט/לוגו
            </Button>

            <Button onClick={() => setShowElementsModal(true)} className="w-full bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-500/30 text-white text-sm">
              <Sparkles size={16} className="ml-1" />
              אלמנטים
            </Button>

            <div className="border-t border-white/10 pt-2 mt-2">
              <p className="text-xs text-gray-400 mb-2 font-bold">כלים מתקדמים</p>
              
              <div className="space-y-1">
                <Button onClick={() => setShowCaptionsModal(true)} className="w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-white text-xs justify-start">
                  <Type size={14} className="ml-1" />
                  כיתובים
                </Button>

                <Button onClick={() => setShowAdvancedTTSModal(true)} className="w-full bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-white text-xs justify-start">
                  <Volume2 size={14} className="ml-1" />
                  דיבוב
                </Button>
                
                <Button onClick={() => setShowEffectsModal(true)} className="w-full bg-pink-600/20 hover:bg-pink-600/40 border border-pink-500/30 text-white text-xs justify-start">
                  <Sparkles size={14} className="ml-1" />
                  אפקטים
                </Button>

                <Button onClick={() => setShowSpeedModal(true)} disabled={!selectedClip} className="w-full bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-white text-xs justify-start">
                  <MoveHorizontal size={14} className="ml-1" />
                  מהירות
                </Button>

                <Button onClick={() => setShowResizeModal(true)} className="w-full bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 text-white text-xs justify-start">
                  <Film size={14} className="ml-1" />
                  גודל
                </Button>

                <Button onClick={() => setShowPIPModal(true)} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs justify-start">
                  <Film size={14} className="ml-1" />
                  PIP
                </Button>

                <Button onClick={() => setShowAdCreatorModal(true)} className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs justify-start">
                  <Sparkles size={14} className="ml-1" />
                  פרסומת
                </Button>
              </div>
            </div>

            {audioTrack && (
              <div className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-green-400 flex items-center gap-1">
                    <Music size={10} />
                    {audioTrack.name}
                  </div>
                  <button onClick={() => setAudioTrack(null)} className="text-red-400 hover:text-red-300">
                    <Trash2 size={12} />
                  </button>
                </div>
                <Slider value={[audioTrack.volume]} onValueChange={(val) => setAudioTrack(prev => ({ ...prev, volume: val[0] }))} max={100} step={1} className="w-full" />
              </div>
            )}

            {selectedClip && (
              <div className="mt-3 border-t border-white/10 pt-3">
                <h4 className="text-xs font-bold mb-2 flex items-center gap-1">
                  <Scissors size={14} className="text-[#E31E24]" />
                  עריכת קליפ
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">בהירות</label>
                    <Slider value={[selectedClip.filters.brightness]} onValueChange={(val) => updateClipFilter(selectedClipIndex, 'brightness', val[0])} max={200} step={1} />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">ניגודיות</label>
                    <Slider value={[selectedClip.filters.contrast]} onValueChange={(val) => updateClipFilter(selectedClipIndex, 'contrast', val[0])} max={200} step={1} />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">רוויה</label>
                    <Slider value={[selectedClip.filters.saturation]} onValueChange={(val) => updateClipFilter(selectedClipIndex, 'saturation', val[0])} max={200} step={1} />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">שמע</label>
                    <Slider value={[selectedClip.volume]} onValueChange={(val) => setClips(prev => prev.map((clip, i) => i === selectedClipIndex ? { ...clip, volume: val[0] } : clip))} max={100} step={1} />
                  </div>
                </div>
              </div>
            )}
          </div>
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

      {showEffectsModal && <EffectsLibraryModal onClose={() => setShowEffectsModal(false)} onApplyEffect={(effect) => { if (selectedClipIndex !== null) { updateClipFilter(selectedClipIndex, 'effect', effect); toast.success(`אפקט ${effect} הוחל! ✨`); } }} onApplyTransition={(transition) => { if (selectedClipIndex !== null && selectedClipIndex < clips.length - 1) { updateTransition(selectedClipIndex, transition); toast.success(`מעבר ${transition} הוחל! 🎬`); } }} />}

      {showSpeedModal && selectedClip && <SpeedControlModal onClose={() => setShowSpeedModal(false)} currentSpeed={selectedClip.speed || 1} onApply={(speed) => { setClips(prev => prev.map((clip, i) => i === selectedClipIndex ? { ...clip, speed } : clip)); toast.success(`מהירות שונתה ל-${speed}x! ⚡`); }} />}

      {showResizeModal && <ResizeModal onClose={() => setShowResizeModal(false)} onApply={(aspectRatio) => { setClips(prev => prev.map(clip => ({ ...clip, aspectRatio }))); toast.success(`שונה ל-${aspectRatio}! 📐`); }} />}

      {showElementsModal && <ElementsLibraryModal onClose={() => setShowElementsModal(false)} onApply={(element) => { setOverlays(prev => [...prev, element]); toast.success('אלמנט נוסף! ✨'); }} />}

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

      {showAdCreatorModal && <AdCreatorModal onClose={() => setShowAdCreatorModal(false)} onApply={(adClip) => { setClips(prev => [...prev, adClip]); setShowAdCreatorModal(false); toast.success('פרסומה נוספה לעורך! 📢'); }} />}

      {showStockVideoModal && <StockVideoLibraryModal onClose={() => setShowStockVideoModal(false)} onApply={(videoData) => { setClips(prev => [...prev, videoData]); setShowStockVideoModal(false); }} />}

      {showAIVideoFromImagesModal && <AIVideoFromImagesModal onClose={() => setShowAIVideoFromImagesModal(false)} onApply={(clips) => { setClips(prev => [...prev, ...clips]); setShowAIVideoFromImagesModal(false); }} />}

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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowLumaGeneratorModal(false)}>
          <div className="bg-gradient-to-br from-purple-900/90 to-black border border-purple-500/30 rounded-2xl p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles size={24} className="text-purple-400" />
              {selectedClip && selectedClip.type === 'video' ? 'המשך סרטון קיים' : 'מחולל סרטונים AI'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">תיאור הסרטון</label>
                <Textarea id="luma-prompt" placeholder="לדוגמה: דרקון זהוב עף מעל הרים מושלגים בשקיעה..." className="bg-black/60 border-purple-500/30 text-white placeholder-white/40 resize-none" rows={3} />
                <p className="text-xs text-gray-400 mt-1">💡 תאר תנועות, אפקטים, ושינויים שתרצה לראות</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Volume2 size={16} className="text-purple-400" />
                  טקסט לדיבוב (אופציונלי)
                </label>
                <Textarea id="luma-voice-script" placeholder="הטקסט שיוקרא בסרטון... אם ריק - ישתמש בתיאור הסרטון" className="bg-black/60 border-purple-500/30 text-white placeholder-white/40 resize-none" rows={2} />
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="add-voice-checkbox" defaultChecked className="w-4 h-4 rounded bg-black/60 border-purple-500/30" />
                  <label htmlFor="add-voice-checkbox" className="text-xs text-gray-300">הוסף דיבוב אוטומטי (ElevenLabs)</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">יחס תצוגה</label>
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
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${option.value === '16:9' ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-purple-500/30 bg-black/40 text-gray-400 hover:border-purple-500/50'}`}
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
                <Button onClick={() => setShowLumaGeneratorModal(false)} variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10">
                  ביטול
                </Button>
                <Button
                  onClick={async () => {
                    const prompt = document.getElementById('luma-prompt').value;
                    if (!prompt.trim()) {
                      toast.error('אנא הזן תיאור לסרטון');
                      return;
                    }
                    const aspectButton = document.querySelector('[data-aspect-ratio][data-selected="true"]');
                    const aspectRatio = aspectButton?.getAttribute('data-aspect-ratio') || '16:9';
                    
                    const addVoice = document.getElementById('add-voice-checkbox')?.checked || false;
                    const voiceScript = document.getElementById('luma-voice-script')?.value?.trim() || prompt;
                    
                    if (selectedClip && selectedClip.type === 'video') {
                      setLoading(true);
                      setShowLumaGeneratorModal(false);
                      try {
                        toast.info('מאריך סרטון עם דיבוב... עד דקה');
                        const { data } = await base44.functions.invoke('createLumaVideo', { 
                          prompt: prompt,
                          aspectRatio: aspectRatio,
                          imageUrl: selectedClip.url,
                          voice_script: voiceScript
                        });

                        if (data?.video_url) {
                          const newClip = {
                            id: Date.now(),
                            url: data.video_url,
                            duration: 5,
                            name: 'המשך - ' + prompt.substring(0, 30),
                            thumbnail: data.thumbnail_url || data.video_url,
                            filters: { brightness: 100, contrast: 100, saturation: 100 },
                            volume: 100,
                            type: 'video'
                          };
                          setClips(prev => [...prev, newClip]);
                          setTimeout(() => setSelectedClipIndex(clips.length), 200);

                          if (data.audio_url) {
                            setAudioTrack({ url: data.audio_url, name: 'דיבוב - ' + prompt.substring(0, 20), volume: 100, loop: false });
                            toast.success('סרטון + דיבוב נוספו לציר הזמן! 🎬🎤');
                          } else {
                            toast.warning('סרטון בלי קול - בעיה בדיבוב');
                          }
                        } else if (data?.still_processing) {
                          toast.info('הסרטון בתהליך... נסה שוב בעוד רגע');
                        } else {
                          toast.error('לא התקבל סרטון מהשרת');
                        }
                      } catch (error) {
                        toast.error('שגיאה: ' + error.message);
                      } finally {
                        setLoading(false);
                      }
                    } else {
                      setLoading(true);
                      setShowLumaGeneratorModal(false);
                      try {
                        toast.info('יוצר סרטון עם דיבוב... עד דקה');
                        const { data } = await base44.functions.invoke('createLumaVideo', { 
                          prompt: prompt,
                          aspectRatio: aspectRatio,
                          voice_script: voiceScript
                        });

                        if (data?.video_url) {
                          const newClip = {
                            id: Date.now(),
                            url: data.video_url,
                            duration: 5,
                            name: prompt.substring(0, 30),
                            thumbnail: data.thumbnail_url || data.video_url,
                            filters: { brightness: 100, contrast: 100, saturation: 100 },
                            volume: 100,
                            type: 'video'
                          };
                          setClips(prev => [...prev, newClip]);
                          setTimeout(() => setSelectedClipIndex(clips.length), 200);

                          if (data.audio_url) {
                            setAudioTrack({ url: data.audio_url, name: 'דיבוב - ' + prompt.substring(0, 20), volume: 100, loop: false });
                            toast.success('סרטון + דיבוב נוספו לציר הזמן! 🎬🎤');
                          } else {
                            toast.warning('סרטון בלי קול - בעיה בדיבוב');
                          }
                        } else if (data?.still_processing) {
                          toast.info('הסרטון בתהליך... נסה שוב בעוד רגע');
                        } else {
                          toast.error('לא התקבל סרטון מהשרת');
                        }
                      } catch (error) {
                        toast.error('שגיאה: ' + error.message);
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                >
                  {loading ? <><Loader2 size={18} className="mr-2 animate-spin" />יוצר...</> : <><Sparkles size={18} className="mr-2" />{selectedClip && selectedClip.type === 'video' ? 'המשך סרטון' : 'צור סרטון'}</>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOverlayModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">הוסף טקסט או לוגו</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">טקסט</label>
                <Input id="overlay-text" placeholder="הכנס טקסט..." className="bg-white/5 border-white/20 text-white" />
                <div className="flex gap-2 mt-2">
                  <Input id="text-color" type="color" defaultValue="#ffffff" className="w-20 h-10" />
                  <Input id="text-size" type="number" placeholder="גודל" defaultValue="24" className="flex-1 bg-white/5 border-white/20 text-white" />
                </div>
                <Button onClick={() => {
                  const text = document.getElementById('overlay-text')?.value;
                  const color = document.getElementById('text-color')?.value || '#ffffff';
                  const fontSize = parseInt(document.getElementById('text-size')?.value || '24');
                  if (text && text.trim()) {
                    const newOverlay = {
                      id: Date.now(),
                      type: 'text',
                      content: text,
                      position: { x: 50, y: 50 },
                      style: { fontSize, color }
                    };
                    setOverlays(prev => [...prev, newOverlay]);
                    setShowOverlayModal(false);
                    toast.success('טקסט נוסף בהצלחה!');
                    
                    // Clear inputs
                    if (document.getElementById('overlay-text')) document.getElementById('overlay-text').value = '';
                  } else {
                    toast.error('אנא הזן טקסט');
                  }
                }} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Type size={18} className="mr-2" />
                  הוסף טקסט
                </Button>
              </div>

              <div className="border-t border-white/20 pt-4">
                <label className="text-sm text-gray-400 mb-2 block">לוגו / תמונה</label>
                <input type="file" accept="image/*" id="logo-upload" className="hidden" onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    try {
                      setLoading(true);
                      const uploadResult = await base44.integrations.Core.UploadFile({ file });
                      const newOverlay = {
                        id: Date.now(),
                        type: 'logo',
                        url: uploadResult.file_url,
                        position: { x: 10, y: 10 },
                        size: { width: 100, height: 100 }
                      };
                      setOverlays(prev => [...prev, newOverlay]);
                      setShowOverlayModal(false);
                      toast.success('לוגו נוסף בהצלחה!');
                    } catch (error) {
                      console.error('Logo upload error:', error);
                      toast.error('שגיאה בהעלאת לוגו: ' + (error.message || 'Unknown error'));
                    } finally {
                      setLoading(false);
                    }
                  }
                }} />
                <Button onClick={() => document.getElementById('logo-upload').click()} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  <ImageIcon size={18} className="mr-2" />
                  העלה לוגו
                </Button>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={() => setShowOverlayModal(false)} variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10">
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
                      <button onClick={() => setOverlays(prev => prev.filter(o => o.id !== overlay.id))} className="text-red-400 hover:text-red-300">
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