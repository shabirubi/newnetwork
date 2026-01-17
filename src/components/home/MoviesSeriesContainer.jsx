import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Film, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export default function MoviesSeriesContainer() {
  const [generatingImages, setGeneratingImages] = useState({});

  const generateMovieImage = async (movie) => {
    try {
      setGeneratingImages(prev => ({ ...prev, [movie.id]: true }));
      const response = await base44.integrations.Core.GenerateImage({
        prompt: `Professional movie or series poster. High quality cinema artwork for "${movie.title}" (${movie.year}). Genre: ${movie.genre}. Movie poster style, professional design, dramatic lighting.`
      });
      return response.url;
    } catch (err) {
      console.error('Image generation failed:', err);
      return null;
    } finally {
      setGeneratingImages(prev => ({ ...prev, [movie.id]: false }));
    }
  };

  const { data: movies = [], isLoading, refetch } = useQuery({
    queryKey: ['movies-series'],
    queryFn: async () => {
      const allMovies = await base44.entities.Movie.list('-created_date', 12);
      const withImages = await Promise.all(
        allMovies.map(async (movie) => {
          let posterUrl = movie.thumbnail;
          if (!posterUrl) {
            posterUrl = await generateMovieImage(movie);
          }
          return { ...movie, poster_url: posterUrl };
        })
      );
      return withImages;
    },
    initialData: []
  });

  const genreColors = {
    action: 'from-red-600 to-red-700',
    comedy: 'from-yellow-600 to-yellow-700',
    drama: 'from-purple-600 to-purple-700',
    horror: 'from-gray-800 to-gray-900',
    western: 'from-amber-700 to-amber-800',
    'sci-fi': 'from-blue-600 to-blue-700',
    romance: 'from-pink-600 to-pink-700',
    thriller: 'from-gray-700 to-gray-800',
    documentary: 'from-green-700 to-green-800',
    default: 'from-gray-600 to-gray-700'
  };

  const getGenreColor = (genre) => {
    return genreColors[genre?.toLowerCase()] || genreColors.default;
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section className="px-4 sm:px-4 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-[#E31E24]" />
          <div>
            <h2 className="text-2xl font-bold dark:text-white">סדרות וסרטים</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">תוכן קולנועי בדרגה גבוהה</p>
          </div>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {movies.map((movie, idx) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-gradient-to-br ${getGenreColor(movie.genre)} rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all group cursor-pointer h-full flex flex-col`}
          >
            {/* Poster Image */}
            {movie.poster_url ? (
              <div className="relative h-56 overflow-hidden">
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all" />
              </div>
            ) : generatingImages[movie.id] ? (
              <div className="h-56 bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
              </div>
            ) : (
              <div className="h-56 bg-gradient-to-br from-gray-600 to-gray-700" />
            )}

            {/* Content */}
            <div className="p-4 flex flex-col flex-1 text-white">
              {/* Year & Genre */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">
                  {movie.year}
                </span>
                {movie.rating > 0 && (
                  <span className="text-xs font-bold bg-yellow-400/30 text-yellow-100 px-2 py-1 rounded-full">
                    ⭐ {movie.rating}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-bold text-base line-clamp-2 mb-2 group-hover:text-yellow-200 transition-colors">
                {movie.title}
              </h3>

              {/* Description */}
              {movie.description && (
                <p className="text-white/75 text-sm line-clamp-2 mb-3 flex-1">
                  {movie.description}
                </p>
              )}

              {/* Genre Badge */}
              <div className="flex items-center justify-between pt-3 border-t border-white/20">
                <span className="text-[11px] text-white/70 bg-white/10 px-3 py-1 rounded-full capitalize">
                  {movie.genre}
                </span>
                {movie.duration && (
                  <span className="text-[11px] text-white/70">
                    {movie.duration}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}