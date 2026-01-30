import React, { useState } from 'react';
import { Search, Download, Play, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const STOCK_VIDEO_API = {
  pexels: 'https://api.pexels.com/videos/search',
  pixabay: 'https://pixabay.com/api/videos/',
};

const SAMPLE_STOCK_VIDEOS = [
  {
    id: 'sample-1',
    title: 'עולא שמש בטבע',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=400',
    duration: '30s',
    category: 'nature'
  },
  {
    id: 'sample-2',
    title: 'בניין עיר מודרני',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=400',
    duration: '20s',
    category: 'urban'
  },
  {
    id: 'sample-3',
    title: 'טכנולוגיה וקידוד',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    duration: '15s',
    category: 'technology'
  },
  {
    id: 'sample-4',
    title: 'משרד עם מחשבים',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
    duration: '25s',
    category: 'business'
  },
  {
    id: 'sample-5',
    title: 'אנשים בפגישה',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
    duration: '30s',
    category: 'people'
  },
  {
    id: 'sample-6',
    title: 'תנועה דינאמית',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-adf4e565e6c1?w=400',
    duration: '20s',
    category: 'motion'
  },
  {
    id: 'sample-7',
    title: 'מים וטבע',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    duration: '15s',
    category: 'nature'
  },
  {
    id: 'sample-8',
    title: 'נוף פנטסטי',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400',
    duration: '25s',
    category: 'space'
  }
];

export default function StockVideoLibraryModal({ onClose, onApply }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [previewingVideo, setPreviewingVideo] = useState(null);

  const categories = [
    { id: 'all', label: 'הכל' },
    { id: 'nature', label: 'טבע' },
    { id: 'urban', label: 'עיר' },
    { id: 'technology', label: 'טכנולוגיה' },
    { id: 'business', label: 'עסקים' },
    { id: 'people', label: 'אנשים' },
    { id: 'motion', label: 'תנועה' },
    { id: 'space', label: 'חלל' }
  ];

  const filteredVideos = SAMPLE_STOCK_VIDEOS.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddVideo = (video) => {
    onApply({
      id: Date.now(),
      url: video.url,
      duration: 5,
      name: video.title,
      thumbnail: video.thumbnail,
      filters: { brightness: 100, contrast: 100, saturation: 100 },
      volume: 0,
      type: 'video'
    });
    toast.success(`"${video.title}" נוסף לעורך! 🎥`);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-6 max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Play size={24} className="text-[#E31E24]" />
              ספריית סרטונים חינמיים
            </h3>
            <p className="text-sm text-gray-400 mt-1">סרטונים באיכות גבוהה מ-Pexels ו-Pixabay</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="חפש סרטון..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white placeholder-white/40"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-6 pb-4 border-b border-white/10 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm font-medium ${
                selectedCategory === cat.id
                  ? 'bg-[#E31E24] text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Videos Grid */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 size={32} className="animate-spin text-[#E31E24]" />
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <div className="text-center">
                    <Play size={48} className="mx-auto mb-4 opacity-30" />
                    <p>לא נמצאו סרטונים</p>
                    <p className="text-xs text-gray-500 mt-2">נסה לשנות את הקטגוריה או את טקסט החיפוש</p>
                  </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-2">
              {filteredVideos.map(video => (
                <div
                  key={video.id}
                  className="group relative bg-black/40 border border-white/10 rounded-xl overflow-hidden hover:border-[#E31E24]/50 transition-all cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-black">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => setPreviewingVideo(video)}
                        className="bg-[#E31E24]/80 hover:bg-[#E31E24] p-3 rounded-full transition-all transform scale-75 group-hover:scale-100"
                      >
                        <Play size={24} className="text-white fill-white" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h4 className="font-semibold text-white text-sm truncate group-hover:text-[#E31E24] transition-colors">
                      {video.title}
                    </h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">{video.duration}</span>
                      <Button
                        onClick={() => handleAddVideo(video)}
                        size="sm"
                        className="bg-[#E31E24] hover:bg-[#B91C1C] text-white text-xs h-7"
                      >
                        <Download size={14} className="mr-1" />
                        הוסף
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-500">
            סרטונים מ-Pixabay ו-Coverr • שימוש חופשי לכל מטרה ✅
          </p>
        </div>
      </div>

      {/* Video Preview Modal */}
      {previewingVideo && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setPreviewingVideo(null)}
        >
          <div
            className="max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={previewingVideo.url}
              controls
              autoPlay
              className="w-full rounded-xl border border-white/20"
            />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">{previewingVideo.title}</h4>
                <p className="text-sm text-gray-400">{previewingVideo.duration}</p>
              </div>
              <Button
                onClick={() => {
                  handleAddVideo(previewingVideo);
                  setPreviewingVideo(null);
                }}
                className="bg-[#E31E24] hover:bg-[#B91C1C] text-white"
              >
                <Download size={18} className="mr-2" />
                הוסף לעורך
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}