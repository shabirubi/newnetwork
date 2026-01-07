import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Film, Play, Clock, Star, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function Movies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['movies'],
    queryFn: () => base44.entities.Movie.list('-views', 100),
    initialData: []
  });

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "all" || movie.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="w-full h-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 mb-4"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Film className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold dark:text-white">סרטים קלאסיים</h1>
        </motion.div>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          אוסף של סרטים קלאסיים בנחלת הכלל - צפו חינם ובאיכות גבוהה
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חפש סרט..."
              className="pr-10"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger>
                <SelectValue placeholder="כל הז'אנרים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הז'אנרים</SelectItem>
                {Object.entries(genreLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <div className="text-center py-20">
          <Film className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">אין עדיין סרטים במערכת</h3>
          <p className="text-gray-500 mb-6">טען סרטים קלאסיים מ-Archive.org</p>
          <Link to={createPageUrl("MoviesLoader")}>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Film className="w-5 h-5 mr-2" />
              טען סרטים עכשיו
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {filteredMovies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={createPageUrl(`MoviePlayer?id=${movie.id}`)}>
                <div className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  {/* Thumbnail */}
                  <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                    {movie.thumbnail ? (
                      <img 
                        src={movie.thumbnail} 
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#E31E24] flex items-center justify-center">
                        <Play className="w-8 h-8 text-white mr-[-4px]" fill="white" />
                      </div>
                    </div>

                    {/* Genre Badge */}
                    {movie.genre && (
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        {genreLabels[movie.genre]}
                      </div>
                    )}

                    {/* Rating */}
                    {movie.rating > 0 && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" fill="black" />
                        {movie.rating.toFixed(1)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="font-bold text-sm line-clamp-2 mb-2 group-hover:text-[#E31E24] transition-colors dark:text-white">
                      {movie.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      {movie.year && <span>{movie.year}</span>}
                      {movie.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {movie.duration}
                        </div>
                      )}
                    </div>
                    {movie.views > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        {movie.views.toLocaleString()} צפיות
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">
          {filteredMovies.length} סרטים זמינים
        </h2>
        <p className="text-purple-100">
          כל הסרטים בנחלת הכלל וחינמיים לצפייה
        </p>
      </div>
    </div>
  );
}