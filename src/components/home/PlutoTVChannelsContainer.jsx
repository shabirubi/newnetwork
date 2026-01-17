import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tv, Play } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const PLUTO_TV_CHANNELS = [
  { id: "andromeda-it", name: "Andromeda", genre: "sci-fi" },
  { id: "avatar-it", name: "Avatar La Leggenda di Aang", genre: "action" },
  { id: "catfish-it", name: "Catfish TV Show", genre: "reality" },
  { id: "clubbing-it", name: "Clubbing TV", genre: "music" },
  { id: "consulenze-it", name: "Consulenze Illegali", genre: "drama" },
  { id: "doctor-who-it", name: "Doctor Who", genre: "sci-fi" },
  { id: "due-fantagenitori-it", name: "Due Fantagenitori", genre: "comedy" },
  { id: "ex-on-beach-it", name: "Ex On The Beach", genre: "reality" },
  { id: "fail-army-it", name: "FailArmy", genre: "comedy" },
  { id: "geordie-shore-it", name: "Geordie Shore", genre: "reality" },
  { id: "ign-it", name: "IGN", genre: "gaming" },
  { id: "just-laughs-it", name: "Just for Laughs", genre: "comedy" },
  { id: "macgyver-it", name: "MacGyver", genre: "action" },
  { id: "mutant-x-it", name: "Mutant X", genre: "sci-fi" },
  { id: "pluto-anime-it", name: "Pluto TV Anime", genre: "anime" },
  { id: "pluto-cinema-it", name: "Pluto TV Cinema Italiano", genre: "drama" },
  { id: "pluto-crime-it", name: "Pluto TV Crime", genre: "thriller" },
  { id: "pluto-cucina-it", name: "Pluto TV Cucina", genre: "lifestyle" },
  { id: "pluto-documentari-it", name: "Pluto TV Documentary", genre: "documentary" },
  { id: "pluto-family-it", name: "Pluto TV Family", genre: "family" },
  { id: "pluto-film-azione-it", name: "Pluto TV Film Azione", genre: "action" },
  { id: "pluto-film-classici-it", name: "Pluto TV Film Classici", genre: "classic" },
  { id: "pluto-film-commedia-it", name: "Pluto TV Film Commedia", genre: "comedy" },
  { id: "pluto-film-drama-it", name: "Pluto TV Film Drama", genre: "drama" },
  { id: "pluto-film-it", name: "Pluto TV Film", genre: "movies" },
  { id: "pluto-film-romantici-it", name: "Pluto TV Film Romantici", genre: "romance" },
  { id: "pluto-film-thriller-it", name: "Pluto TV Film Thriller", genre: "thriller" },
  { id: "pluto-horror-it", name: "Pluto TV Horror", genre: "horror" },
  { id: "pluto-kids-it", name: "Pluto TV Kids", genre: "family" },
  { id: "pluto-natura-it", name: "Pluto TV Natura", genre: "documentary" },
  { id: "pluto-reallife-it", name: "Pluto TV Real Life", genre: "reality" },
  { id: "pluto-reality-it", name: "Pluto TV Reality", genre: "reality" },
  { id: "pluto-scifi-it", name: "Pluto TV Sci-Fi", genre: "sci-fi" },
  { id: "pluto-serie-it", name: "Pluto TV Serie", genre: "drama" },
  { id: "pluto-sport-it", name: "Pluto TV Sport", genre: "sports" },
  { id: "pluto-viaggi-it", name: "Pluto TV Viaggi", genre: "lifestyle" },
  { id: "pluto-western-it", name: "Pluto TV Western", genre: "western" },
  { id: "south-park-it", name: "South Park", genre: "comedy" },
  { id: "teen-mom-it", name: "Teen Mom", genre: "reality" },
];

const genreColors = {
  sci_fi: 'from-blue-600 to-blue-700',
  'sci-fi': 'from-blue-600 to-blue-700',
  action: 'from-red-600 to-red-700',
  comedy: 'from-yellow-600 to-yellow-700',
  drama: 'from-purple-600 to-purple-700',
  reality: 'from-pink-600 to-pink-700',
  music: 'from-red-700 to-pink-700',
  gaming: 'from-green-600 to-green-700',
  anime: 'from-indigo-600 to-purple-700',
  thriller: 'from-gray-700 to-gray-800',
  lifestyle: 'from-amber-600 to-amber-700',
  documentary: 'from-green-700 to-green-800',
  family: 'from-cyan-600 to-cyan-700',
  classic: 'from-amber-800 to-amber-900',
  movies: 'from-violet-600 to-violet-700',
  romance: 'from-pink-700 to-red-600',
  horror: 'from-gray-800 to-black',
  sports: 'from-orange-600 to-orange-700',
  western: 'from-amber-700 to-amber-800',
  default: 'from-gray-600 to-gray-700'
};

const getGenreColor = (genre) => {
  const key = genre?.toLowerCase().replace('_', '-') || 'default';
  return genreColors[key] || genreColors.default;
};

export default function PlutoTVChannelsContainer() {
  const [generatingImages, setGeneratingImages] = useState({});

  const generateChannelImage = async (channel) => {
    try {
      setGeneratingImages(prev => ({ ...prev, [channel.id]: true }));
      const response = await base44.integrations.Core.GenerateImage({
        prompt: `Professional TV channel logo and thumbnail for "${channel.name}". Genre: ${channel.genre}. Vibrant, modern design, suitable for streaming platform. High quality artwork.`
      });
      return response.url;
    } catch (err) {
      console.error('Image generation failed:', err);
      return null;
    } finally {
      setGeneratingImages(prev => ({ ...prev, [channel.id]: false }));
    }
  };

  const { data: channelsWithImages = [], isLoading } = useQuery({
    queryKey: ['pluto-tv-channels'],
    queryFn: async () => {
      const withImages = await Promise.all(
        PLUTO_TV_CHANNELS.map(async (channel) => {
          const imageUrl = await generateChannelImage(channel);
          return { ...channel, image_url: imageUrl };
        })
      );
      return withImages;
    },
    initialData: []
  });

  if (channelsWithImages.length === 0) {
    return null;
  }

  return (
    <section className="px-4 sm:px-4 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <Tv className="w-5 h-5 text-[#E31E24]" />
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Pluto TV</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">ערוצי טלוויזיה חיים וסרטים בחינם</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {channelsWithImages.map((channel, idx) => (
          <motion.div
            key={channel.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.03 }}
            whileHover={{ scale: 1.05 }}
            className={`group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer h-40 bg-gradient-to-br ${getGenreColor(channel.genre)}`}
          >
            {/* Background Image */}
            {channel.image_url ? (
              <div className="absolute inset-0">
                <img
                  src={channel.image_url}
                  alt={channel.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent group-hover:from-black/80 transition-all" />
              </div>
            ) : generatingImages[channel.id] ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
              </div>
            ) : null}

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-3 text-center">
              <Play className="w-6 h-6 text-white mb-2 group-hover:scale-125 transition-transform" />
              <h3 className="font-bold text-sm text-white line-clamp-2 group-hover:text-yellow-200 transition-colors">
                {channel.name}
              </h3>
              <span className="text-[10px] text-white/70 capitalize mt-1">
                {channel.genre}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}