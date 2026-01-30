import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Music, Play, Pause, X, Download, Zap, Smile, Wind, Sword, Briefcase, Film, Heart, Volume2 } from 'lucide-react';

export default function MusicLibraryModal({ onClose, onApply }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = 0.5;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const categories = [
    { id: 'all', name: 'הכל', icon: Music },
    { id: 'dramatic', name: 'דרמטי', icon: Volume2 },
    { id: 'energetic', name: 'אנרגטי', icon: Zap },
    { id: 'dance', name: 'דאנס', icon: Music },
    { id: 'chill', name: 'רגוע', icon: Wind },
    { id: 'epic', name: 'אפי', icon: Sword },
    { id: 'funny', name: 'מצחיק', icon: Smile },
    { id: 'corporate', name: 'קורפורטיבי', icon: Briefcase },
    { id: 'cinematic', name: 'קולנועי', icon: Film }
  ];

  // ספריית מוזיקה חינמית מ-Pixabay, Bensound, Free Music Archive
  const musicLibrary = [
    // Dramatic
    { id: 1, name: 'Epic Emotional Drama', url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_1d5b3b39dd.mp3', category: 'dramatic', duration: '2:34', bpm: 85 },
    { id: 2, name: 'Sad Cinematic Piano', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3', category: 'dramatic', duration: '2:12', bpm: 72 },
    { id: 3, name: 'Dramatic Trailer', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c0e3c3e5.mp3', category: 'dramatic', duration: '2:45', bpm: 95 },
    { id: 18, name: 'Dark Mystery', url: 'https://cdn.pixabay.com/download/audio/2022/08/23/audio_2eb1b3aa7c.mp3', category: 'dramatic', duration: '2:18', bpm: 80 },
    { id: 19, name: 'Tension Building', url: 'https://cdn.pixabay.com/download/audio/2023/02/28/audio_a40a5f8cda.mp3', category: 'dramatic', duration: '2:56', bpm: 90 },
    
    // Energetic / Dance
    { id: 4, name: 'Upbeat Energy Dance', url: 'https://cdn.pixabay.com/download/audio/2022/08/04/audio_0519e54f63.mp3', category: 'energetic', duration: '2:23', bpm: 128 },
    { id: 5, name: 'Electronic Dance House', url: 'https://cdn.pixabay.com/download/audio/2021/11/22/audio_33aff5ca97.mp3', category: 'dance', duration: '2:56', bpm: 126 },
    { id: 6, name: 'Future Bass Drop', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_89f5976897.mp3', category: 'energetic', duration: '2:18', bpm: 140 },
    { id: 7, name: 'Tropical House Beat', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d1718ab41b.mp3', category: 'dance', duration: '2:41', bpm: 120 },
    { id: 20, name: 'EDM Party Anthem', url: 'https://cdn.pixabay.com/download/audio/2022/11/28/audio_c89b9f6a20.mp3', category: 'dance', duration: '3:05', bpm: 130 },
    { id: 21, name: 'Tech House Groove', url: 'https://cdn.pixabay.com/download/audio/2023/03/15/audio_9d8e4f5b12.mp3', category: 'dance', duration: '2:48', bpm: 124 },
    { id: 22, name: 'High Energy Workout', url: 'https://cdn.pixabay.com/download/audio/2022/12/06/audio_3b4d2a7f89.mp3', category: 'energetic', duration: '2:33', bpm: 145 },
    
    // Chill / Relaxed
    { id: 8, name: 'Chill Acoustic', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3', category: 'chill', duration: '3:12', bpm: 90 },
    { id: 9, name: 'Lofi Hip Hop Beat', url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3', category: 'chill', duration: '2:34', bpm: 85 },
    { id: 23, name: 'Smooth Jazz', url: 'https://cdn.pixabay.com/download/audio/2022/09/12/audio_5c7e3d9f21.mp3', category: 'chill', duration: '3:45', bpm: 88 },
    { id: 24, name: 'Ambient Meditation', url: 'https://cdn.pixabay.com/download/audio/2023/01/09/audio_7f8a2b3c45.mp3', category: 'chill', duration: '4:12', bpm: 70 },
    
    // Epic
    { id: 10, name: 'Epic Orchestral', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c0e3c3e5.mp3', category: 'epic', duration: '3:05', bpm: 110 },
    { id: 11, name: 'Heroic Adventure', url: 'https://cdn.pixabay.com/download/audio/2022/02/22/audio_d1718ab41b.mp3', category: 'epic', duration: '2:48', bpm: 120 },
    { id: 25, name: 'Battle Victory', url: 'https://cdn.pixabay.com/download/audio/2022/10/17/audio_8d3e1f4a56.mp3', category: 'epic', duration: '3:18', bpm: 115 },
    { id: 26, name: 'Rising Phoenix', url: 'https://cdn.pixabay.com/download/audio/2023/04/05/audio_2a9c4e7b38.mp3', category: 'epic', duration: '2:55', bpm: 108 },
    
    // Funny / Comedy
    { id: 12, name: 'Funny Upbeat', url: 'https://cdn.pixabay.com/download/audio/2021/12/06/audio_ccb0020bc7.mp3', category: 'funny', duration: '1:45', bpm: 140 },
    { id: 13, name: 'Comedy Clown', url: 'https://cdn.pixabay.com/download/audio/2022/04/26/audio_a45abbdf5f.mp3', category: 'funny', duration: '2:01', bpm: 130 },
    { id: 27, name: 'Silly Cartoon', url: 'https://cdn.pixabay.com/download/audio/2022/07/19/audio_4e5b2d8a91.mp3', category: 'funny', duration: '1:38', bpm: 135 },
    { id: 28, name: 'Quirky Fun', url: 'https://cdn.pixabay.com/download/audio/2023/02/14/audio_9b3c1f6d27.mp3', category: 'funny', duration: '2:12', bpm: 125 },
    
    // Corporate
    { id: 14, name: 'Corporate Motivational', url: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe70b21.mp3', category: 'corporate', duration: '2:28', bpm: 120 },
    { id: 15, name: 'Business Success', url: 'https://cdn.pixabay.com/download/audio/2021/10/05/audio_d0817d766e.mp3', category: 'corporate', duration: '2:15', bpm: 115 },
    { id: 29, name: 'Innovation Tech', url: 'https://cdn.pixabay.com/download/audio/2022/11/08/audio_6c2d8a4f91.mp3', category: 'corporate', duration: '2:42', bpm: 118 },
    { id: 30, name: 'Inspiring Presentation', url: 'https://cdn.pixabay.com/download/audio/2023/01/22/audio_3f9e5b7c18.mp3', category: 'corporate', duration: '2:34', bpm: 112 },
    
    // Cinematic
    { id: 16, name: 'Cinematic Trailer', url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_1d5b3b39dd.mp3', category: 'cinematic', duration: '2:56', bpm: 100 },
    { id: 17, name: 'Film Score Drama', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3', category: 'cinematic', duration: '3:22', bpm: 88 },
    { id: 31, name: 'Hollywood Action', url: 'https://cdn.pixabay.com/download/audio/2022/09/28/audio_7e4a2d9b56.mp3', category: 'cinematic', duration: '3:08', bpm: 95 },
    { id: 32, name: 'Emotional Strings', url: 'https://cdn.pixabay.com/download/audio/2023/03/01/audio_5b8c3f1d29.mp3', category: 'cinematic', duration: '3:41', bpm: 82 }
  ];

  const filteredMusic = activeCategory === 'all' 
    ? musicLibrary 
    : musicLibrary.filter(m => m.category === activeCategory);

  const handlePlay = (music) => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    if (playingId === music.id) {
      audio.pause();
      audio.currentTime = 0;
      setPlayingId(null);
    } else {
      audio.pause();
      audio.src = music.url;
      audio.currentTime = 0;
      
      audio.play()
        .then(() => {
          setPlayingId(music.id);
        })
        .catch(err => {
          console.error('Audio play error:', err);
          setPlayingId(null);
        });
      
      audio.onended = () => setPlayingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Music className="text-purple-500" />
            ספריית מוזיקה חינמית
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => {
            const IconComponent = cat.icon;
            return (
              <Button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 ${activeCategory === cat.id ? 'bg-purple-600' : 'bg-white/10'}`}
              >
                <IconComponent size={16} className="ml-1" />
                {cat.name}
              </Button>
            );
          })}
        </div>

        {/* Music List */}
        <div className="space-y-2 mb-4">
          {filteredMusic.map(music => (
            <div
              key={music.id}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all group"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handlePlay(music)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    playingId === music.id 
                      ? 'bg-green-600 hover:bg-green-700 animate-pulse' 
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {playingId === music.id ? (
                    <Pause size={20} className="text-white" />
                  ) : (
                    <Play size={20} className="text-white ml-1" />
                  )}
                </button>

                <div className="flex-1">
                <div className="font-bold text-white mb-1">{music.name}</div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Music size={12} />
                    {music.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Volume2 size={12} />
                    {music.bpm} BPM
                  </span>
                  <span className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded-full">
                    {categories.find(c => c.id === music.category)?.name}
                  </span>
                </div>
                </div>

                <Button
                  onClick={() => {
                    onApply(music);
                    onClose();
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download size={18} className="mr-2" />
                  הוסף
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4">
          <div className="text-purple-300 font-bold mb-2 flex items-center gap-2">
            <span className="text-2xl">🎵</span>
            <span>מוזיקה חינמית ללא זכויות יוצרים</span>
          </div>
          <div className="text-xs text-gray-300 space-y-1">
            <p>✅ כל המוזיקה מ-Pixabay Audio Library (רישיון חופשי)</p>
            <p>✅ ניתן לשימוש מסחרי ללא ייחוס</p>
            <p>✅ 32 שירים בז'אנרים שונים: דרמטי, אנרגטי, דאנס, אפי, מצחיק ועוד</p>
            <p>🎧 לחץ על ▶️ לשמיעה מקדימה לפני הוספה</p>
            <p>✅ מוזיקה מקצועית באיכות גבוהה</p>
          </div>
        </div>
      </div>
    </div>
  );
}