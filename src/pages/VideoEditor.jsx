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
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 shrink-0 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a 
              href="/"
              className="px-4 py-2 border border-white/30 text-white hover:bg-white/20 rounded-lg transition-colors text-sm font-semibold"
            >
              ← חזרה
            </a>
            <div>
              <h1 className="text-2xl font-bold text-white">עורך סרטונים</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowProjectsModal(true)} variant="outline" className="border-white/30 text-white hover:bg-white/20">
              <FolderOpen size={18} className="mr-2" />
              פרויקטים
            </Button>
            <Button onClick={handleSaveProject} disabled={clips.length === 0} className="bg-green-600 hover:bg-green-700 text-white">
              <Save size={18} className="mr-2" />
              שמור
            </Button>
            <Button onClick={handlePlayAll} disabled={clips.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Play size={18} className="mr-2" />
              הפעל
            </Button>
            <Button onClick={handleExport} disabled={clips.length === 0} className="bg-purple-600 hover:bg-purple-700 text-white">
              <Download size={18} className="mr-2" />
              ייצוא
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden" dir="rtl">
        {/* Main Area */}
        <div className="flex-1 flex flex-col">
          {/* Preview */}
          <div className="flex-1 flex items-center justify-center p-6 bg-gray-100">
            {selectedClip ? (
              <div className="w-full max-w-4xl">
                <div className="bg-black rounded-2xl shadow-2xl overflow-hidden">
                  {selectedClip.type === 'image' ? (
                    <img src={selectedClip.url} className="w-full" alt={selectedClip.name} />
                  ) : (
                    <video ref={videoRef} src={selectedClip.localUrl || selectedClip.url} className="w-full" controls />
                  )}
                </div>
                <div className="text-center mt-3">
                  <p className="text-gray-600 text-sm">{selectedClip.duration?.toFixed(1)}s</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <Film size={64} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">בחר קליפ מציר הזמן</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="h-40 bg-white border-t border-gray-300 p-3 overflow-x-scroll">
            {clips.length === 0 ? (
              <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-xl">
                <div className="text-center">
                  <Film size={40} className="mx-auto mb-2 opacity-30 text-gray-400" />
                  <p className="text-gray-500 text-sm">לחץ "העלה" להוספת סרטונים</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-1 h-full items-center min-w-max">
                {clips.map((clip, index) => {
                  const widthPerSecond = 70;
                  const clipWidth = Math.max(80, (clip.duration || 1) * widthPerSecond);

                  return (
                    <React.Fragment key={clip.id}>
                      <motion.div
                        layout
                        className={`relative rounded-lg overflow-hidden flex-shrink-0 cursor-pointer group border-2 ${selectedClipIndex === index ? 'ring-4 ring-blue-500 border-blue-500' : 'border-gray-300 hover:border-blue-400'}`}
                        style={{ width: `${clipWidth}px`, height: '110px' }}
                        onClick={() => setSelectedClipIndex(index)}
                      >
                        <div className="absolute inset-0">
                          {clip.type === 'image' ? (
                            <img src={clip.thumbnail || clip.url} alt={clip.name} className="w-full h-full object-cover" />
                          ) : (
                            <video src={clip.url} className="w-full h-full object-cover" muted playsInline />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <p className="text-white text-[10px] font-semibold truncate">{clip.name}</p>
                          <p className="text-white text-[9px] bg-black/60 px-1 rounded inline-block">{clip.duration?.toFixed(1)}s</p>
                        </div>

                        <button 
                          onClick={(e) => { e.stopPropagation(); removeClip(index); }} 
                          className="absolute top-1 left-1 p-1 bg-red-500 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <Trash2 size={12} className="text-white" />
                        </button>
                      </motion.div>

                      {index < clips.length - 1 && (
                        <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '50px' }}>
                          <button
                            onClick={() => {
                              const t = prompt('מעבר: fade, dissolve, slide');
                              if (t) updateTransition(index, t);
                            }}
                            className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 border-2 border-dashed border-gray-400 flex items-center justify-center"
                          >
                            <Plus size={20} className="text-gray-600" />
                          </button>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-20 bg-white border-r border-gray-300 p-2 flex flex-col gap-2 items-center overflow-y-auto">
          <input type="file" accept="video/*,image/*" onChange={handleAddClip} className="hidden" id="video-upload" />
          <button onClick={() => document.getElementById('video-upload').click()} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg w-full" title="העלה">
            <Upload size={24} className="text-gray-700" />
            <span className="text-[9px] text-gray-600">העלה</span>
          </button>

          <button onClick={() => setShowSampleVideosModal(true)} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg w-full">
            <Film size={24} className="text-gray-700" />
            <span className="text-[9px] text-gray-600">סרטונים</span>
          </button>

          <button onClick={() => setShowLumaGeneratorModal(true)} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg w-full">
            <Sparkles size={24} className="text-gray-700" />
            <span className="text-[9px] text-gray-600">AI</span>
          </button>

          <button onClick={() => setShowAIImageModal(true)} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg w-full">
            <ImageIcon size={24} className="text-gray-700" />
            <span className="text-[9px] text-gray-600">תמונה</span>
          </button>

          <button onClick={() => setShowKlingCharacterModal(true)} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg w-full">
            <User size={24} className="text-gray-700" />
            <span className="text-[9px] text-gray-600">דמות</span>
          </button>

          <input type="file" accept="audio/*" onChange={handleAddAudio} className="hidden" id="audio-upload" />
          <button onClick={() => document.getElementById('audio-upload').click()} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg w-full">
            <Music size={24} className="text-gray-700" />
            <span className="text-[9px] text-gray-600">מוזיקה</span>
          </button>

          <button onClick={() => setShowOverlayModal(true)} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg w-full">
            <Type size={24} className="text-gray-700" />
            <span className="text-[9px] text-gray-600">טקסט</span>
          </button>

          <button onClick={() => setShowElementsModal(true)} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg w-full">
            <Sparkles size={24} className="text-gray-700" />
            <span className="text-[9px] text-gray-600">אלמנטים</span>
          </button>

          <div className="border-t border-gray-300 w-full"></div>

          <button onClick={() => setShowEffectsModal(true)} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg w-full">
            <Sparkles size={22} className="text-gray-700" />
            <span className="text-[8px] text-gray-600">אפקטים</span>
          </button>

          <button onClick={() => setShowResizeModal(true)} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg w-full">
            <Film size={22} className="text-gray-700" />
            <span className="text-[8px] text-gray-600">גודל</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {showProjectsModal && <ProjectsModal onClose={() => setShowProjectsModal(false)} onLoad={handleLoadProject} />}
      {showCaptionsModal && <AutoCaptionsModal onClose={() => setShowCaptionsModal(false)} selectedClip={selectedClip} onApply={(captions) => { setOverlays(prev => [...prev, ...captions]); toast.success('כיתובים נוספו!'); }} />}
      {showEffectsModal && <EffectsLibraryModal onClose={() => setShowEffectsModal(false)} onApplyEffect={(effect) => { if (selectedClipIndex !== null) updateClipFilter(selectedClipIndex, 'effect', effect); }} onApplyTransition={(t) => { if (selectedClipIndex !== null && selectedClipIndex < clips.length - 1) updateTransition(selectedClipIndex, t); }} />}
      {showSpeedModal && selectedClip && <SpeedControlModal onClose={() => setShowSpeedModal(false)} currentSpeed={selectedClip.speed || 1} onApply={(speed) => { setClips(prev => prev.map((clip, i) => i === selectedClipIndex ? { ...clip, speed } : clip)); }} />}
      {showResizeModal && <ResizeModal onClose={() => setShowResizeModal(false)} onApply={(aspectRatio) => { setClips(prev => prev.map(clip => ({ ...clip, aspectRatio }))); }} />}
      {showElementsModal && <ElementsLibraryModal onClose={() => setShowElementsModal(false)} onApply={(element) => { setOverlays(prev => [...prev, element]); }} />}
      {showMusicLibraryModal && <MusicLibraryModal onClose={() => setShowMusicLibraryModal(false)} onApply={(music) => { setAudioTrack({ url: music.url, name: music.name, volume: 100, loop: true }); }} />}
      {showPIPModal && <PIPOverlay onClose={() => setShowPIPModal(false)} onApply={(pipData) => { setPipLayers(prev => [...prev, pipData]); }} />}
      {showAIImageModal && <AIImageGeneratorModal onClose={() => setShowAIImageModal(false)} onApply={(imageData) => { setClips(prev => [...prev, { id: Date.now(), ...imageData, filters: { brightness: 100, contrast: 100, saturation: 100 }, volume: 0 }]); setShowAIImageModal(false); }} />}
      {showAdvancedTTSModal && <AdvancedTTSModal onClose={() => setShowAdvancedTTSModal(false)} onApply={async (text, voice) => { try { const { data } = await base44.functions.invoke('generateElevenLabsSpeech', { text, voice_id: voice }); if (data.audio_url) { setAudioTrack({ url: data.audio_url, name: 'דיבוב', volume: 100 }); setShowAdvancedTTSModal(false); } } catch (e) {} }} />}
      {showAdCreatorModal && <AdCreatorModal onClose={() => setShowAdCreatorModal(false)} onApply={(adClip) => { setClips(prev => [...prev, adClip]); setShowAdCreatorModal(false); }} />}
      {showAIVideoFromImagesModal && <AIVideoFromImagesModal onClose={() => setShowAIVideoFromImagesModal(false)} onApply={(newClips) => { setClips(prev => [...prev, ...newClips]); setShowAIVideoFromImagesModal(false); }} />}
      {showSampleVideosModal && <SampleVideosModal onClose={() => setShowSampleVideosModal(false)} onApply={(clip) => { setClips(prev => [...prev, clip]); setShowSampleVideosModal(false); }} />}
      {showKlingCharacterModal && <KlingCharacterModal onClose={() => setShowKlingCharacterModal(false)} onApply={(clip) => { setClips(prev => [...prev, clip]); setShowKlingCharacterModal(false); }} />}
      {showExportModal && <ExportVideoModal onClose={() => setShowExportModal(false)} clips={clips} totalDuration={totalDuration} userEmail={userEmail} loading={exporting} setLoading={setExporting} />}

      {showOverlayModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">הוסף טקסט</h3>
            <Input id="overlay-text" placeholder="טקסט..." className="mb-3" />
            <div className="flex gap-2">
              <Button onClick={() => setShowOverlayModal(false)} variant="outline" className="flex-1">ביטול</Button>
              <Button onClick={() => {
                const text = document.getElementById('overlay-text')?.value;
                if (text?.trim()) {
                  setOverlays(prev => [...prev, { id: Date.now(), type: 'text', content: text, position: { x: 50, y: 50 }, style: { fontSize: 24, color: '#ffffff' } }]);
                  setShowOverlayModal(false);
                }
              }} className="flex-1">הוסף</Button>
            </div>
          </div>
        </div>
      )}

      {showLumaGeneratorModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full">
            <h3 className="text-xl font-bold mb-4">צור סרטון AI</h3>
            <Textarea id="luma-prompt" placeholder="תאר את הסרטון..." rows={3} className="mb-4" />
            <div className="flex gap-2">
              <Button onClick={() => setShowLumaGeneratorModal(false)} variant="outline" className="flex-1">ביטול</Button>
              <Button onClick={async () => {
                const prompt = document.getElementById('luma-prompt')?.value;
                if (!prompt?.trim()) return;
                setShowLumaGeneratorModal(false);
                setLoading(true);
                try {
                  const { data } = await base44.functions.invoke('createLumaVideo', { prompt, aspectRatio: '16:9' });
                  if (data?.video_url) {
                    setClips(prev => [...prev, { id: Date.now(), url: data.video_url, localUrl: data.video_url, duration: 5, name: prompt.substring(0, 30), thumbnail: data.video_url, filters: { brightness: 100, contrast: 100, saturation: 100 }, volume: 100, type: 'video' }]);
                  }
                } finally { setLoading(false); }
              }} className="flex-1 bg-purple-600">צור</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}