import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Youtube, Play, Eye, Clock, ExternalLink } from 'lucide-react';

export default function YouTubeChannelContainer() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChannelVideos();
  }, []);

  const fetchChannelVideos = async () => {
    try {
      setLoading(true);
      const API_KEY = 'AIzaSyBBg8VGhqL9kXqhBxhPXmjE8-xQJZGWrRI'; // Your YouTube API Key
      
      // Search for "הרשת החדשה" channel videos
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=הרשת+החדשה&type=video&maxResults=20&order=date&key=${API_KEY}`
      );
      
      if (!searchResponse.ok) throw new Error('Failed to fetch videos');
      
      const searchData = await searchResponse.json();
      
      // Get video statistics
      const videoIds = searchData.items.map(item => item.id.videoId).join(',');
      const statsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${API_KEY}`
      );
      
      const statsData = await statsResponse.json();
      
      // Combine data
      const videosWithStats = searchData.items.map(item => {
        const stats = statsData.items?.find(v => v.id === item.id.videoId);
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          viewCount: stats?.statistics?.viewCount || '0',
          duration: stats?.contentDetails?.duration || 'PT0S'
        };
      });
      
      setVideos(videosWithStats);
      setError(null);
    } catch (err) {
      console.error('Error fetching YouTube videos:', err);
      setError('שגיאה בטעינת הסרטונים');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (duration) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');
    
    if (hours) return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    const num = parseInt(views);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (date) => {
    const now = new Date();
    const published = new Date(date);
    const diffTime = Math.abs(now - published);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'היום';
    if (diffDays === 1) return 'אתמול';
    if (diffDays < 7) return `לפני ${diffDays} ימים`;
    if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;
    return `לפני ${Math.floor(diffDays / 30)} חודשים`;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-black via-red-950/20 to-black rounded-3xl p-8 border-2 border-red-500/30">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center animate-pulse">
            <Youtube className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-xl aspect-video animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-black via-red-950/20 to-black rounded-3xl p-8 border-2 border-red-500/30">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-black via-red-950/20 to-black rounded-3xl p-6 sm:p-8 border-2 border-red-500/30 shadow-2xl shadow-red-500/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/50">
            <Youtube className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              הערוץ שלנו ביוטיוב
            </h2>
            <p className="text-gray-400 text-sm">
              {videos.length} סרטונים מהערוץ
            </p>
          </div>
        </div>
        <a
          href="https://www.youtube.com/results?search_query=%D7%94%D7%A8%D7%A9%D7%AA+%D7%94%D7%97%D7%93%D7%A9%D7%94"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all text-sm font-bold"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden sm:inline">צפו בערוץ</span>
        </a>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video, index) => (
          <motion.a
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-black/40 rounded-xl overflow-hidden border border-white/10 hover:border-red-500/50 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-2xl shadow-red-500/50">
                  <Play className="w-8 h-8 text-white mr-1" fill="white" />
                </div>
              </div>

              {/* Duration */}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/80 rounded-md text-xs text-white font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(video.duration)}
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="text-white font-bold text-sm line-clamp-2 mb-2 group-hover:text-red-400 transition-colors">
                {video.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatViews(video.viewCount)}</span>
                </div>
                <span>{formatDate(video.publishedAt)}</span>
              </div>
            </div>
          </motion.a>
        ))}
      </div>

      {/* YouTube Channel Branding */}
      <div className="mt-6 text-center">
        <p className="text-gray-500 text-xs">
          מופעל על ידי YouTube
        </p>
      </div>
    </div>
  );
}