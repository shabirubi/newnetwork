import React, { useState } from 'react';
import { Play, Download, X, Search, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const SAMPLE_VIDEOS = [
  {
    id: 1,
    title: 'Big Buck Bunny',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    duration: 10,
    description: 'ארנב ענק עם לב גדול'
  },
  {
    id: 2,
    title: 'Elephant Dream',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    duration: 11,
    description: 'סרט אנימציה ראשון של Blender'
  },
  {
    id: 3,
    title: 'For Bigger Blazes',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    duration: 15,
    description: 'סרטון דמו של Chromecast'
  },
  {
    id: 4,
    title: 'For Bigger Escape',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    duration: 15,
    description: 'הבריחות של באטמן'
  },
  {
    id: 5,
    title: 'For Bigger Fun',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
    duration: 60,
    description: 'כיף גדול יותר עם Chromecast'
  },
  {
    id: 6,
    title: 'For Bigger Joyrides',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
    duration: 15,
    description: 'טיולים גדולים יותר'
  },
  {
    id: 7,
    title: 'For Bigger Meltdowns',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg',
    duration: 15,
    description: 'התמוטטויות גדולות יותר'
  },
  {
    id: 8,
    title: 'Sintel',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    duration: 15,
    description: 'סרט אנימציה של Blender Foundation'
  },
  {
    id: 9,
    title: 'Subaru Outback',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg',
    duration: 25,
    description: 'סובארו ברחוב ובשטח'
  },
  {
    id: 10,
    title: 'Tears of Steel',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
    duration: 12,
    description: 'סרט מדע בדיוני מאמסטרדם'
  },
  {
    id: 11,
    title: 'Volkswagen GTI',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/VolkswagenGTIReview.jpg',
    duration: 20,
    description: 'ביקורת על פולקסווגן GTI'
  },
  {
    id: 12,
    title: 'We Are Going On Bullrun',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/WeAreGoingOnBullrun.jpg',
    duration: 30,
    description: 'שלבי GT500 ב-Bullrun Rally'
  }
];

export default function SampleVideosModal({ onClose, onApply }) {
  const [previewingVideo, setPreviewingVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('samples'); // 'samples', 'search', 'images', 'broll'
  const [imageResults, setImageResults] = useState([]);
  const [brollCategory, setBrollCategory] = useState('nature');

  const handleAddVideo = async (video) => {
    const newClip = {
      id: Date.now(),
      url: video.url,
      duration: video.duration,
      name: video.title,
      thumbnail: video.thumbnail,
      filters: { brightness: 100, contrast: 100, saturation: 100 },
      volume: 100,
      type: 'video'
    };
    onApply(newClip);
    toast.success(`"${video.title}" נוסף! 🎥`);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('הזן מילת חיפוש');
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await base44.functions.invoke('searchPexelsVideos', {
        query: searchQuery,
        per_page: 20
      });

      if (data.videos && data.videos.length > 0) {
        setSearchResults(data.videos);
        setActiveTab('search');
        toast.success(`נמצאו ${data.videos.length} סרטונים! 🎬`);
      } else {
        toast.error('לא נמצאו סרטונים');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('שגיאה בחיפוש: ' + error.message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchImages = async () => {
    if (!searchQuery.trim()) {
      toast.error('הזן מילת חיפוש');
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await base44.functions.invoke('searchPexelsImages', {
        query: searchQuery,
        per_page: 20
      });

      if (data.images && data.images.length > 0) {
        setImageResults(data.images);
        setActiveTab('images');
        toast.success(`נמצאו ${data.images.length} תמונות! 🖼️`);
      } else {
        toast.error('לא נמצאו תמונות');
        setImageResults([]);
      }
    } catch (error) {
      console.error('Image search error:', error);
      toast.error('שגיאה בחיפוש תמונות');
      setImageResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBrollSearch = async (category) => {
    setBrollCategory(category);
    setIsSearching(true);
    try {
      const { data } = await base44.functions.invoke('searchPexelsVideos', {
        query: category,
        per_page: 20
      });

      if (data.videos && data.videos.length > 0) {
        setSearchResults(data.videos);
        setActiveTab('broll');
        toast.success(`${data.videos.length} סרטוני ${category}! 🎬`);
      }
    } catch (error) {
      toast.error('שגיאה בטעינת B-roll');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddImage = (image) => {
    const newClip = {
      id: Date.now(),
      url: image.url,
      duration: 5,
      name: image.photographer || 'תמונה',
      thumbnail: image.thumbnail,
      filters: { brightness: 100, contrast: 100, saturation: 100 },
      volume: 0,
      type: 'image'
    };
    onApply(newClip);
    toast.success('תמונה נוספה! 🖼️');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-6 max-w-6xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Play size={24} className="text-green-500" />
                ספריית סרטונים
              </h3>
              <p className="text-sm text-gray-400 mt-1">דוגמאות • סרטונים • תמונות • B-Roll</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (activeTab === 'images' ? handleSearchImages() : handleSearch())}
              placeholder="חפש סרטונים או תמונות..."
              className="flex-1 bg-black/40 border-white/20 text-white placeholder-gray-500"
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isSearching ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Search size={18} className="mr-2" />
                  וידאו
                </>
              )}
            </Button>
            <Button
              onClick={handleSearchImages}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white"
            >
              {isSearching ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Search size={18} className="mr-2" />
                  תמונה
                </>
              )}
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={() => setActiveTab('samples')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'samples'
                  ? 'bg-green-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              דוגמאות (12)
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'search'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              וידאו ({searchResults.length})
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'images'
                  ? 'bg-pink-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              תמונות ({imageResults.length})
            </button>
            <button
              onClick={() => setActiveTab('broll')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'broll'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              B-Roll
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'broll' ? (
            <div>
              <div className="mb-4 flex gap-2 flex-wrap">
                {['nature', 'business', 'technology', 'city', 'people', 'food', 'sports', 'travel'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleBrollSearch(cat)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      brollCategory === cat
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pr-2">
                {searchResults.map(video => (
                  <div
                    key={video.id}
                    className="group relative bg-black/40 border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all"
                  >
                    <div className="relative aspect-video overflow-hidden bg-black">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => setPreviewingVideo(video)}
                          className="bg-purple-600/80 hover:bg-purple-600 p-3 rounded-full transition-all transform scale-75 group-hover:scale-100"
                        >
                          <Play size={20} className="text-white fill-white" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-xs text-white font-bold">
                        {Math.round(video.duration)}s
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-white text-sm truncate group-hover:text-purple-400 transition-colors mb-1">
                        {video.title}
                      </h4>
                      <p className="text-xs text-gray-400 truncate mb-3">{video.description}</p>
                      <Button
                        onClick={() => handleAddVideo(video)}
                        size="sm"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
                      >
                        <Download size={14} className="mr-1" />
                        הוסף
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'images' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pr-2">
              {imageResults.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <Search size={48} className="mx-auto mb-4 opacity-30" />
                  <p>חפש תמונות...</p>
                </div>
              ) : (
                imageResults.map(image => (
                  <div
                    key={image.id}
                    className="group relative bg-black/40 border border-white/10 rounded-xl overflow-hidden hover:border-pink-500/50 transition-all"
                  >
                    <div className="relative aspect-video overflow-hidden bg-black">
                      <img
                        src={image.thumbnail}
                        alt={image.description}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-white text-sm truncate group-hover:text-pink-400 transition-colors mb-1">
                        {image.photographer}
                      </h4>
                      <p className="text-xs text-gray-400 truncate mb-3">{image.description}</p>
                      <Button
                        onClick={() => handleAddImage(image)}
                        size="sm"
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white text-xs h-8"
                      >
                        <Download size={14} className="mr-1" />
                        הוסף
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'samples' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pr-2">
              {SAMPLE_VIDEOS.map(video => (
                <div
                  key={video.id}
                  className="group relative bg-black/40 border border-white/10 rounded-xl overflow-hidden hover:border-green-500/50 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-black">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x225/1a1a1a/4ade80?text=' + encodeURIComponent(video.title);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => setPreviewingVideo(video)}
                        className="bg-green-600/80 hover:bg-green-600 p-3 rounded-full transition-all transform scale-75 group-hover:scale-100"
                      >
                        <Play size={20} className="text-white fill-white" />
                      </button>
                    </div>
                    {/* Duration Badge */}
                    <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-xs text-white font-bold">
                      {video.duration}s
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h4 className="font-semibold text-white text-sm truncate group-hover:text-green-400 transition-colors mb-1">
                      {video.title}
                    </h4>
                    <p className="text-xs text-gray-400 truncate mb-3">{video.description}</p>
                    <Button
                      onClick={() => handleAddVideo(video)}
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                    >
                      <Download size={14} className="mr-1" />
                      הוסף לעורך
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pr-2">
              {searchResults.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <Search size={48} className="mx-auto mb-4 opacity-30" />
                  <p>חפש סרטונים מ-Pexels...</p>
                  <p className="text-xs mt-2">מיליוני סרטונים חינמיים ב-HD</p>
                </div>
              ) : (
                searchResults.map(video => (
                  <div
                    key={video.id}
                    className="group relative bg-black/40 border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-black">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x225/1a1a1a/60a5fa?text=' + encodeURIComponent(video.title);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => setPreviewingVideo(video)}
                          className="bg-blue-600/80 hover:bg-blue-600 p-3 rounded-full transition-all transform scale-75 group-hover:scale-100"
                        >
                          <Play size={20} className="text-white fill-white" />
                        </button>
                      </div>
                      {/* Duration Badge */}
                      <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-xs text-white font-bold">
                        {Math.round(video.duration)}s
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h4 className="font-semibold text-white text-sm truncate group-hover:text-blue-400 transition-colors mb-1">
                        {video.title}
                      </h4>
                      <p className="text-xs text-gray-400 truncate mb-3">{video.description}</p>
                      <Button
                        onClick={() => handleAddVideo(video)}
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                      >
                        <Download size={14} className="mr-1" />
                        הוסף לעורך
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>



        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
            <span className="text-green-500">✓</span>
            {activeTab === 'samples' ? 'Google Cloud CDN • מהיר ויציב' : 'Pexels • מיליוני סרטונים בחינם'}
          </p>
        </div>
      </div>

      {/* Video Preview Modal */}
      {previewingVideo && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
          onClick={() => setPreviewingVideo(null)}
        >
          <div
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={previewingVideo.url}
              controls
              autoPlay
              className="w-full rounded-xl border border-white/20 shadow-2xl"
            />
            <div className="mt-4 flex items-center justify-between bg-black/60 backdrop-blur-sm p-4 rounded-xl">
              <div>
                <h4 className="font-bold text-white text-lg">{previewingVideo.title}</h4>
                <p className="text-sm text-gray-400">{previewingVideo.description} • {Math.round(previewingVideo.duration)}s</p>
              </div>
              <Button
                onClick={() => {
                  handleAddVideo(previewingVideo);
                  setPreviewingVideo(null);
                }}
                className={`${activeTab === 'samples' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
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