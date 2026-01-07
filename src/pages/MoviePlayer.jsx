import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Film, Clock, Star, Calendar, ArrowRight, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const genreLabels = {
  action: "אקשן",
  comedy: "קומדיה",
  drama: "דרמה",
  horror: "אימה",
  western: "מערבון",
  "sci-fi": "מדע בדיוני",
  romance: "רומנטיקה",
  thriller: "מתח",
  documentary: "תיעודי"
};

export default function MoviePlayer() {
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('id');
  const queryClient = useQueryClient();

  const { data: movie, isLoading } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: async () => {
      const movies = await base44.entities.Movie.filter({ id: movieId });
      return movies[0];
    },
    enabled: !!movieId
  });

  const updateViewsMutation = useMutation({
    mutationFn: (id) => {
      const currentViews = movie?.views || 0;
      return base44.entities.Movie.update(id, { views: currentViews + 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['movie', movieId]);
    }
  });

  useEffect(() => {
    if (movie?.id) {
      updateViewsMutation.mutate(movie.id);
    }
  }, [movie?.id]);

  const { data: relatedMovies = [] } = useQuery({
    queryKey: ['related-movies', movie?.genre],
    queryFn: () => {
      if (!movie?.genre) return [];
      return base44.entities.Movie.filter({ genre: movie.genre }, '-views', 6);
    },
    enabled: !!movie?.genre,
    initialData: []
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="w-full aspect-video" />
        <Skeleton className="w-full h-32" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center py-20">
        <Film className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-400 mb-2">סרט לא נמצא</h3>
        <Link to={createPageUrl("Movies")}>
          <Button variant="outline">חזרה לרשימת הסרטים</Button>
        </Link>
      </div>
    );
  }

  const embedUrl = `https://archive.org/embed/${movie.archive_id}`;

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link to={createPageUrl("Movies")}>
        <Button variant="ghost" className="gap-2">
          <ArrowRight className="w-4 h-4" />
          חזרה לרשימת הסרטים
        </Button>
      </Link>

      {/* Player */}
      <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
        <iframe
          src={embedUrl}
          className="w-full aspect-video"
          allow="fullscreen"
          allowFullScreen
          title={movie.title}
        />
      </div>

      {/* Movie Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Thumbnail */}
          {movie.thumbnail && (
            <div className="w-full md:w-48 shrink-0">
              <img 
                src={movie.thumbnail} 
                alt={movie.title}
                className="w-full rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Details */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-4 dark:text-white">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-300">
              {movie.year && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {movie.year}
                </div>
              )}
              {movie.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {movie.duration}
                </div>
              )}
              {movie.genre && (
                <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                  {genreLabels[movie.genre]}
                </div>
              )}
              {movie.rating > 0 && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <Star className="w-4 h-4" fill="currentColor" />
                  {movie.rating.toFixed(1)}
                </div>
              )}
              {movie.views > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {movie.views.toLocaleString()} צפיות
                </div>
              )}
            </div>

            {movie.description && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {movie.description}
                </p>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                💡 הסרט הזה הוא בנחלת הכלל ומופץ ע"י Archive.org - ארגון ללא מטרות רווח ששומר על תרבות דיגיטלית
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Movies */}
      {relatedMovies.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 dark:text-white">סרטים דומים</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {relatedMovies.filter(m => m.id !== movie.id).slice(0, 5).map((relMovie) => (
              <Link key={relMovie.id} to={createPageUrl(`MoviePlayer?id=${relMovie.id}`)}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
                >
                  <div className="relative aspect-[2/3] bg-gray-200 dark:bg-gray-700">
                    {relMovie.thumbnail ? (
                      <img src={relMovie.thumbnail} alt={relMovie.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="font-bold text-xs line-clamp-2 dark:text-white">{relMovie.title}</h3>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}