import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Film, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function MoviesLoader() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const queryClient = useQueryClient();

  const createMovieMutation = useMutation({
    mutationFn: (movieData) => base44.entities.Movie.create(movieData),
    onSuccess: () => {
      queryClient.invalidateQueries(['movies']);
    }
  });

  const loadMoviesFromArchive = async () => {
    setLoading(true);
    setResults([]);

    try {
      // Search for classic movies on Archive.org
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `חפש לי רשימה של 20 סרטים קלאסיים פופולריים מ-Archive.org (Internet Archive) שזמינים לצפייה חינם.
        
עבור כל סרט, תן לי:
- title: שם הסרט באנגלית
- title_hebrew: שם הסרט בעברית
- description: תיאור קצר בעברית (2-3 משפטים)
- year: שנת יציאה
- duration: משך בדקות (רק המספר)
- archive_id: המזהה המדויק ב-archive.org (חשוב מאוד!)
- genre: אחד מהבאים: action, comedy, drama, horror, western, sci-fi, romance, thriller, documentary
- rating: דירוג (7.0-9.0)

חשוב: ודא שהמזהים (archive_id) הם נכונים ועובדים באמת ב-archive.org!

דוגמאות למזהים תקינים:
- TheGeneralBusterKeaton
- TheGreatDictator_786
- Plan9FromOuterSpace
- ReeferMadness

אל תמציא מזהים - בדוק שהם אמיתיים!`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            movies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  title_hebrew: { type: "string" },
                  description: { type: "string" },
                  year: { type: "number" },
                  duration: { type: "number" },
                  archive_id: { type: "string" },
                  genre: { type: "string" },
                  rating: { type: "number" }
                },
                required: ["title", "title_hebrew", "description", "year", "archive_id", "genre"]
              }
            }
          }
        }
      });

      const movies = response.movies || [];
      const loadResults = [];

      for (const movie of movies) {
        try {
          const thumbnail = `https://archive.org/services/img/${movie.archive_id}`;
          
          await createMovieMutation.mutateAsync({
            title: movie.title_hebrew,
            description: movie.description,
            year: movie.year,
            duration: movie.duration ? `${movie.duration} דקות` : undefined,
            archive_id: movie.archive_id,
            thumbnail: thumbnail,
            genre: movie.genre,
            rating: movie.rating || 7.5,
            views: 0
          });

          loadResults.push({
            title: movie.title_hebrew,
            status: 'success'
          });
        } catch (err) {
          console.error(`Failed to load movie ${movie.title_hebrew}:`, err);
          loadResults.push({
            title: movie.title_hebrew,
            status: 'error',
            error: err.message
          });
        }
      }

      setResults(loadResults);
      toast.success(`נטענו ${loadResults.filter(r => r.status === 'success').length} סרטים בהצלחה!`);
    } catch (err) {
      console.error("Error loading movies:", err);
      toast.error("שגיאה בטעינת הסרטים");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Film className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold dark:text-white">טעינת סרטים</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          טען סרטים קלאסיים מ-Archive.org באופן אוטומטי
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm text-center">
        <Button
          onClick={loadMoviesFromArchive}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              טוען סרטים...
            </>
          ) : (
            <>
              <Film className="w-5 h-5 mr-2" />
              טען 20 סרטים קלאסיים
            </>
          )}
        </Button>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          התהליך לוקח כ-30 שניות
        </p>
      </div>

      {results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 dark:text-white">תוצאות הטעינה</h2>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <span className="text-sm dark:text-gray-200">{result.title}</span>
                {result.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-300 text-center">
              ✅ נטענו {results.filter(r => r.status === 'success').length} מתוך {results.length} סרטים
            </p>
          </div>
        </div>
      )}
    </div>
  );
}