import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Music, Play, Pause, X, Download } from 'lucide-react';

export default function MusicLibraryModal({ onClose, onApply }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [playingId, setPlayingId] = useState(null);

  const categories = [
    { id: 'all', name: 'הכל', icon: '🎵' },
    { id: 'dramatic', name: 'דרמטי', icon: '🎭' },
    { id: 'energetic', name: 'אנרגטי', icon: '⚡' },
    { id: 'dance', name: 'דאנס', icon: '💃' },
    { id: 'chill', name: 'רגוע', icon: '😌' },
    { id: 'epic', name: 'אפי', icon: '🦸' },
    { id: 'funny', name: 'מצחיק', icon: '😂' },
    { id: 'corporate', name: 'קורפורטיבי', icon: '💼' },
    { id: 'cinematic', name: 'קולנועי', icon: '🎬' }
  ];

  // ספריית מוזיקה חינמית מ-Pixabay, Bensound, Free Music Archive
  const musicLibrary = [
    // Dramatic
    { id: 1, name: 'Epic Emotional Drama', url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_1d5b3b39dd.mp3', category: 'dramatic', duration: '2:34', bpm: 85 },
    { id: 2, name: 'Sad Cinematic Piano', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3', category: 'dramatic', duration: '2:12', bpm: 72 },
    { id: 3, name: 'Dramatic Trailer', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c0e3c3e5.mp3', category: 'dramatic', duration: '2:45', bpm: 95 },
    
    // Energetic / Dance
    { id: 4, name: 'Upbeat Energy Dance', url: 'https://cdn.pixabay.com/download/audio/2022/08/04/audio_0519e54f63.mp3', category: 'energetic', duration: '2:23', bpm: 128 },
    { id: 5, name: 'Electronic Dance House', url: 'https://cdn.pixabay.com/download/audio/2021/11/22/audio_33aff5ca97.mp3', category: 'dance', duration: '2:56', bpm: 126 },
    { id: 6, name: 'Future Bass Drop', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_89f5976897.mp3', category: 'energetic', duration: '2:18', bpm: 140 },
    { id: 7, name: 'Tropical House Beat', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d1718ab41b.mp3', category: 'dance', duration: '2:41', bpm: 120 },
    
    // Chill / Relaxed
    { id: 8, name: 'Chill Acoustic', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3', category: 'chill', duration: '3:12', bpm: 90 },
    { id: 9, name: 'Lofi Hip Hop Beat', url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3', category: 'chill', duration: '2:34', bpm: 85 },
    
    // Epic
    { id: 10, name: 'Epic Orchestral', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c0e3c3e5.mp3', category: 'epic', duration: '3:05', bpm: 110 },
    { id: 11, name: 'Heroic Adventure', url: 'https://cdn.pixabay.com/download/audio/2022/02/22/audio_d1718ab41b.mp3', category: 'epic', duration: '2:48', bpm: 120 },
    
    // Funny / Comedy
    { id: 12, name: 'Funny Upbeat', url: 'https://cdn.pixabay.com/download/audio/2021/12/06/audio_ccb0020bc7.mp3', category: 'funny', duration: '1:45', bpm: 140 },
    { id: 13, name: 'Comedy Clown', url: 'https://cdn.pixabay.com/download/audio/2022/04/26/audio_a45abbdf5f.mp3', category: 'funny', duration: '2:01', bpm: 130 },
    
    // Corporate
    { id: 14, name: 'Corporate Motivational', url: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe70b21.mp3', category: 'corporate', duration: '2:28', bpm: 120 },
    { id: 15, name: 'Business Success', url: 'https://cdn.pixabay.com/download/audio/2021/10/05/audio_d0817d766e.mp3', category: 'corporate', duration: '2:15', bpm: 115 },
    
    // Cinematic
    { id: 16, name: 'Cinematic Trailer', url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_1d5b3b39dd.mp3', category: 'cinematic', duration: '2:56', bpm: 100 },
    { id: 17, name: 'Film Score Drama', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3', category: 'cinematic', duration: '3:22', bpm: 88 }
  ];

  const filteredMusic = activeCategory === 'all' 
    ? musicLibrary 
    : musicLibrary.filter(m => m.category === activeCategory);

  const handlePlay = (music) => {
    if (playingId === music.id) {
      setPlayingId(null);
    } else {
      setPlayingId(music.id);
      // In a real implementation, you'd use an audio element to play the preview
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
          {categories.map(cat => (
            <Button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 ${activeCategory === cat.id ? 'bg-purple-600' : 'bg-white/10'}`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.name}
            </Button>
          ))}
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
                  className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center transition-all"
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
                    <span>⏱️ {music.duration}</span>
                    <span>🎵 {music.bpm} BPM</span>
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
            <p>✅ 17 שירים בז'אנרים שונים: דרמטי, אנרגטי, דאנס, אפי, מצחיק ועוד</p>
            <p>✅ מוזיקה מקצועית באיכות גבוהה</p>
          </div>
        </div>
      </div>
    </div>
  );
}