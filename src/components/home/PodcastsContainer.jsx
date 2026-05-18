import React, { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Play, Pause, Plus, Upload, Loader2, X, Headphones, Clock, ChevronLeft, ChevronRight, Volume2, Share2, Facebook, Twitter, Link2, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

// Podcast episodes are stored as UserVideo with feed='podcasts' (audio or video)
// We use audio/* + video/* accept

function formatDuration(secs) {
  if (!secs) return "";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function PodcastCard({ ep, isPlaying, onPlay }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onPlay}
      className="flex-shrink-0 w-44 cursor-pointer group"
    >
      {/* Cover */}
      <div className="w-full h-44 rounded-2xl overflow-hidden relative mb-2 border border-gray-800 group-hover:border-purple-500/50 transition-colors"
        style={{ background: 'linear-gradient(135deg, #1a0033 0%, #330044 50%, #1a1a2e 100%)' }}>
        {ep.thumbnail_url ? (
          <img src={ep.thumbnail_url} alt={ep.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full bg-purple-600/30 flex items-center justify-center border border-purple-500/40">
              <Mic className="w-7 h-7 text-purple-400" />
            </div>
            <div className="w-8 h-0.5 bg-purple-500/50 rounded" />
            <div className="flex gap-1">
              {[3,5,4,6,3,5,4].map((h,i) => (
                <div key={i} className={`w-1 rounded-full transition-all ${isPlaying ? 'animate-pulse' : ''}`}
                  style={{ height: `${h * 3}px`, background: isPlaying ? '#a855f7' : '#6b21a8', opacity: 0.7 + i * 0.04 }} />
              ))}
            </div>
          </div>
        )}

        {/* Play overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/50">
            {isPlaying ? <Pause className="w-5 h-5 text-white" fill="white" /> : <Play className="w-5 h-5 text-white ml-0.5" fill="white" />}
          </div>
        </div>

        {/* Now playing badge */}
        {isPlaying && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
            <Volume2 className="w-2.5 h-2.5" /> מתנגן
          </div>
        )}
      </div>

      {/* Info */}
      <p className="text-white text-xs font-bold line-clamp-2 mb-1">{ep.title}</p>
      {ep.duration > 0 && (
        <p className="text-gray-500 text-[10px] flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" /> {formatDuration(ep.duration)}
        </p>
      )}
    </motion.div>
  );
}

function AudioPlayer({ ep, onClose, onNext, onPrev, hasPrev, hasNext }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(p => !p);
  };

  const seek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  // detect if file is audio or video
  const isAudio = !ep.video_url || ep.feed === 'podcasts';

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-20 lg:bottom-0 left-0 right-0 z-[9998] bg-[#0d0d0d]/95 backdrop-blur-xl border-t border-purple-800/50 shadow-2xl shadow-purple-900/30"
      dir="rtl"
    >
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={ep.video_url}
        autoPlay
        onTimeUpdate={() => setProgress(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={hasNext ? onNext : onClose}
      />

      {/* Progress bar */}
      <div className="h-1 w-full bg-gray-800 cursor-pointer" onClick={seek}>
        <div className="h-full bg-purple-500 transition-all" style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Cover */}
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-purple-900/40 flex items-center justify-center border border-purple-700/30">
          {ep.thumbnail_url ? <img src={ep.thumbnail_url} alt="" className="w-full h-full object-cover" /> : <Mic className="w-5 h-5 text-purple-400" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold truncate">{ep.title}</p>
          <p className="text-gray-500 text-xs">{formatDuration(progress)} / {formatDuration(duration)}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button onClick={onPrev} disabled={!hasPrev}
            className="p-2 rounded-full hover:bg-purple-800/30 text-gray-400 hover:text-white transition-colors disabled:opacity-30">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={toggle}
            className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center text-white transition-colors shadow-lg">
            {playing ? <Pause className="w-4 h-4" fill="white" /> : <Play className="w-4 h-4 ml-0.5" fill="white" />}
          </button>
          <button onClick={onNext} disabled={!hasNext}
            className="p-2 rounded-full hover:bg-purple-800/30 text-gray-400 hover:text-white transition-colors disabled:opacity-30">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Share buttons */}
        <div className="flex items-center gap-1 mr-2">
          <button
            onClick={() => { navigator.clipboard.writeText(ep.video_url); import('sonner').then(m => m.toast.success('קישור הועתק!')); }}
            className="p-2 rounded-full hover:bg-gray-800 text-gray-500 hover:text-white transition-colors" title="העתק קישור"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`🎙️ ${ep.title} — ${ep.video_url}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-green-900/40 text-gray-500 hover:text-green-400 transition-colors" title="שתף בוואטסאפ"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎙️ ${ep.title}`)}&url=${encodeURIComponent(ep.video_url)}`}
            target="_blank" rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-sky-900/40 text-gray-500 hover:text-sky-400 transition-colors" title="שתף בטוויטר/X"
          >
            <Twitter className="w-4 h-4" />
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(ep.video_url)}`}
            target="_blank" rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-blue-900/40 text-gray-500 hover:text-blue-400 transition-colors" title="שתף בפייסבוק"
          >
            <Facebook className="w-4 h-4" />
          </a>
        </div>

        <button onClick={onClose} className="p-2 text-gray-600 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function UploadModal({ onClose, onUploaded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileRef = useRef(null);
  const thumbRef = useRef(null);
  const [thumbUrl, setThumbUrl] = useState("");

  const MAX_AUDIO_MB = 50;
  const MAX_VIDEO_MB = 100;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!title.trim()) { toast.error("חובה להזין כותרת"); return; }

    const isAudio = file.type.startsWith("audio/");
    const maxMB = isAudio ? MAX_AUDIO_MB : MAX_VIDEO_MB;
    const fileMB = file.size / (1024 * 1024);

    if (fileMB > maxMB) {
      toast.error(`הקובץ גדול מדי — המקסימום הוא ${maxMB}MB לסוג קובץ זה (הקובץ שלך: ${fileMB.toFixed(0)}MB)`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    setUploadProgress(`מעלה ${isAudio ? 'אודיו' : 'וידאו'} (${fileMB.toFixed(1)}MB)...`);

    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 60 * 60 * 24 * 365 * 3 });

      setUploadProgress("שומר...");
      await base44.entities.UserVideo.create({
        title,
        description,
        video_url: signed_url,
        thumbnail_url: thumbUrl || "",
        category: "breaking",
        feed: "podcasts",
        status: "ready",
        uploader_email: "admin",
        views: 0,
        likes: 0,
      });

      toast.success("הפודקסט הועלה בהצלחה!");
      onUploaded();
      onClose();
    } catch (err) {
      toast.error("שגיאה בהעלאה — נסה שוב");
    } finally {
      setUploading(false);
      setUploadProgress("");
      e.target.value = '';
    }
  };

  const handleThumb = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setThumbUrl(file_url);
    toast.success("תמונת כיסוי הועלתה");
    e.target.value = '';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.92)' }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-[#0d0d0d] rounded-2xl border border-purple-800/50 overflow-hidden" dir="rtl">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-purple-400" />
            <h2 className="text-white font-bold">העלאת פודקסט</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* File size guide — pro UX */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-purple-900/20 border border-purple-800/30 text-xs text-purple-300">
            <Headphones className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">גדלי קבצים נתמכים:</p>
              <p>🎵 אודיו (MP3, WAV, AAC) — עד <strong>50MB</strong></p>
              <p>🎬 וידאו-פודקסט (MP4, MOV) — עד <strong>100MB</strong></p>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">שם הפרק *</label>
            <Input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="שם הפרק..." className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-600" />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">תיאור (אופציונלי)</label>
            <Input value={description} onChange={e => setDescription(e.target.value)}
              placeholder="תיאור קצר..." className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-600" />
          </div>

          {/* Cover image */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">תמונת כיסוי (אופציונלי)</label>
            <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={handleThumb} />
            <div className="flex items-center gap-3">
              <button onClick={() => thumbRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl border border-gray-700 text-xs transition-colors">
                <Upload className="w-3.5 h-3.5" /> העלה תמונה
              </button>
              {thumbUrl && <img src={thumbUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-purple-600/40" />}
            </div>
          </div>

          {/* Main file upload */}
          <input ref={fileRef} type="file" accept="audio/*,video/*" className="hidden" onChange={handleFile} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading || !title.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded-xl border border-purple-600/40 font-bold text-sm transition-colors disabled:opacity-50">
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />{uploadProgress || 'מעלה...'}</>
            ) : (
              <><Upload className="w-4 h-4" />בחר קובץ אודיו או וידאו</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PodcastsContainer() {
  const [activeIdx, setActiveIdx] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const queryClient = useQueryClient();
  const scrollRef = useRef(null);

  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ['podcasts'],
    queryFn: () => base44.entities.UserVideo.filter({ feed: 'podcasts', status: 'ready' }, '-created_date', 50),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  const playEp = (idx) => setActiveIdx(idx);
  const closePlayer = () => setActiveIdx(null);
  const goNext = () => setActiveIdx(i => Math.min(i + 1, episodes.length - 1));
  const goPrev = () => setActiveIdx(i => Math.max(i - 1, 0));

  return (
    <div className="w-full px-2 sm:px-4 mb-8" dir="rtl">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div id="podcasts-section" className="flex items-center justify-between mb-4 scroll-mt-20">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 rounded-full bg-purple-500" />
            <Mic className="w-5 h-5 text-purple-400" />
            <h2 className="text-white font-bold text-lg">פודקסטים</h2>
            {episodes.length > 0 && <span className="text-gray-500 text-xs">({episodes.length} פרקים)</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll(-1)} className="p-1.5 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-700 text-gray-400 hover:text-white transition-colors hidden sm:flex">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => scroll(1)} className="p-1.5 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-700 text-gray-400 hover:text-white transition-colors hidden sm:flex">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setUploadOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-lg border border-purple-600/30 transition-colors">
              <Plus className="w-3.5 h-3.5" /> הוסף פרק
            </button>
          </div>
        </div>

        {/* Episodes strip */}
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-44 h-44 bg-gray-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : episodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-gray-800 rounded-2xl gap-3">
            <div className="w-16 h-16 rounded-full bg-purple-900/30 flex items-center justify-center border border-purple-700/30">
              <Headphones className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-gray-500 text-sm">אין פרקים עדיין</p>
            <button onClick={() => setUploadOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded-xl border border-purple-600/40 text-sm transition-colors">
              <Upload className="w-4 h-4" /> העלה פרק ראשון
            </button>
          </div>
        ) : (
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
            {episodes.map((ep, i) => (
              <PodcastCard key={ep.id} ep={ep} isPlaying={activeIdx === i} onPlay={() => playEp(i)} />
            ))}
          </div>
        )}
      </div>

      {/* Audio Player */}
      <AnimatePresence>
        {activeIdx !== null && episodes[activeIdx] && (
          <AudioPlayer
            ep={episodes[activeIdx]}
            onClose={closePlayer}
            onNext={goNext}
            onPrev={goPrev}
            hasNext={activeIdx < episodes.length - 1}
            hasPrev={activeIdx > 0}
          />
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadOpen && (
          <UploadModal
            onClose={() => setUploadOpen(false)}
            onUploaded={() => queryClient.invalidateQueries({ queryKey: ['podcasts'] })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}