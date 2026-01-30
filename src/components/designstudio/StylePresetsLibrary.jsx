import React, { useState } from 'react';
import { Palette, Camera, Paintbrush, Sparkles, Film, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StylePresetsLibrary({ onStyleSelect }) {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'הכל', icon: Sparkles },
    { id: 'photo', name: 'צילום', icon: Camera },
    { id: 'art', name: 'אמנות', icon: Paintbrush },
    { id: 'digital', name: 'דיגיטל', icon: Zap },
    { id: 'cinematic', name: 'קולנוע', icon: Film }
  ];

  const styles = [
    // Photography
    { id: 'photorealistic', name: 'פוטוריאליסטי', prompt: 'photorealistic, highly detailed, professional photography, 8k uhd', category: 'photo', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'portrait', name: 'פורטרט מקצועי', prompt: 'professional portrait photography, studio lighting, bokeh background, 85mm lens', category: 'photo', gradient: 'from-pink-500 to-rose-500' },
    { id: 'landscape', name: 'נוף טבע', prompt: 'landscape photography, golden hour, dramatic sky, wide angle, national geographic style', category: 'photo', gradient: 'from-green-500 to-emerald-500' },
    { id: 'macro', name: 'מאקרו', prompt: 'macro photography, extreme close-up, shallow depth of field, detailed texture', category: 'photo', gradient: 'from-purple-500 to-violet-500' },
    
    // Art
    { id: 'oil-painting', name: 'ציור שמן', prompt: 'oil painting, traditional art, canvas texture, masterpiece, museum quality', category: 'art', gradient: 'from-amber-600 to-orange-600' },
    { id: 'watercolor', name: 'צבעי מים', prompt: 'watercolor painting, soft edges, flowing colors, artistic, delicate', category: 'art', gradient: 'from-teal-500 to-cyan-500' },
    { id: 'impressionist', name: 'אימפרסיוניזם', prompt: 'impressionist painting, visible brush strokes, light and color, artistic style', category: 'art', gradient: 'from-indigo-500 to-purple-500' },
    { id: 'abstract', name: 'אבסטרקט', prompt: 'abstract art, geometric shapes, bold colors, modern art style', category: 'art', gradient: 'from-fuchsia-500 to-pink-500' },
    
    // Digital Art
    { id: '3d-render', name: 'רינדור 3D', prompt: '3d render, octane render, ray tracing, cinema4d, highly detailed', category: 'digital', gradient: 'from-cyan-500 to-blue-500' },
    { id: 'anime', name: 'אנימה', prompt: 'anime style, manga art, japanese animation, vibrant colors', category: 'digital', gradient: 'from-rose-500 to-pink-500' },
    { id: 'cyberpunk', name: 'סייברפאנק', prompt: 'cyberpunk style, neon lights, futuristic, high tech, dystopian', category: 'digital', gradient: 'from-purple-600 to-pink-600' },
    { id: 'pixel-art', name: 'פיקסל ארט', prompt: 'pixel art, 8bit style, retro gaming, detailed pixels', category: 'digital', gradient: 'from-green-600 to-lime-600' },
    
    // Cinematic
    { id: 'movie-poster', name: 'פוסטר סרט', prompt: 'movie poster style, cinematic lighting, dramatic composition, professional design', category: 'cinematic', gradient: 'from-red-600 to-orange-600' },
    { id: 'film-noir', name: 'פילם נואר', prompt: 'film noir style, black and white, dramatic shadows, vintage cinema', category: 'cinematic', gradient: 'from-gray-700 to-gray-900' },
    { id: 'sci-fi', name: 'מדע בדיוני', prompt: 'sci-fi movie style, futuristic, space age, advanced technology', category: 'cinematic', gradient: 'from-blue-600 to-indigo-600' },
    { id: 'epic-fantasy', name: 'פנטזיה אפית', prompt: 'epic fantasy, dramatic lighting, cinematic composition, lord of the rings style', category: 'cinematic', gradient: 'from-amber-700 to-red-700' },
  ];

  const filteredStyles = activeCategory === 'all' 
    ? styles 
    : styles.filter(s => s.category === activeCategory);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-white">
        🎨 סגנונות מוכנים
      </label>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-black/40 text-gray-400 hover:bg-black/60'
              }`}
            >
              <Icon size={16} />
              <span className="text-xs font-semibold">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Styles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto">
        {filteredStyles.map((style) => (
          <motion.button
            key={style.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStyleSelect(style.prompt)}
            className={`p-4 rounded-xl bg-gradient-to-br ${style.gradient} text-white hover:shadow-lg transition-all`}
          >
            <div className="text-sm font-bold mb-1">{style.name}</div>
            <div className="text-xs opacity-80 line-clamp-2">{style.prompt}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}