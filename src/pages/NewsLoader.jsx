import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Loader2, CheckCircle, AlertCircle, Globe, Video } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const newsCategories = [
  { 
    id: "security", 
    label: "ביטחון ומדיניות", 
    query: "Israel security military IDF latest news breaking",
    includeVideos: true
  },
  { 
    id: "economy", 
    label: "כלכלה ועסקים", 
    query: "Israel economy business stock market finance latest",
    includeVideos: true
  },
  { 
    id: "politics", 
    label: "פוליטיקה", 
    query: "Israel politics government Knesset coalition latest news",
    includeVideos: true
  },
  { 
    id: "technology", 
    label: "טכנולוגיה", 
    query: "Israel technology startups innovation AI tech news",
    includeVideos: true
  },
  { 
    id: "sports", 
    label: "ספורט", 
    query: "Israel sports football basketball Maccabi Hapoel latest",
    includeVideos: true
  },
  { 
    id: "world", 
    label: "חדשות עולם", 
    query: "world news breaking international Reuters AP AFP latest",
    includeVideos: true
  },
  { 
    id: "entertainment", 
    label: "בידור", 
    query: "Israel entertainment culture music movies celebrities",
    includeVideos: true
  },
  { 
    id: "health", 
    label: "בריאות", 
    query: "Israel health medical healthcare hospital treatment news",
    includeVideos: false
  }
];

export default function NewsLoader() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentCategory, setCurrentCategory] = useState("");
  const [results, setResults] = useState([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const queryClient = useQueryClient();

  const createArticleMutation = useMutation({
    mutationFn: (articles) => {
      return Promise.all(
        articles.map(article => base44.entities.NewsArticle.create(article))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      queryClient.invalidateQueries({ queryKey: ['category-articles'] });
    }
  });

  const loadNewsForCategory = async (category) => {
    setCurrentCategory(category.label);
    
    try {
      // Fetch latest news with internet context
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `חפש ותביא לי את 5 החדשות האחרונות והכי עדכניות בנושא: ${category.query}
        
        עבור כל כתבה, תן לי:
        - כותרת מושכת בעברית
        - כותרת משנה
        - תוכן מפורט (3-4 פסקאות)
        - מקור (רויטרס, AP, AFP, וכו')
        - האם זה חדשות חמות (breaking news)
        ${category.includeVideos ? '- קישור לוידאו רלוונטי מיוטיוב אם קיים (חפש ביוטיוב סרטון רלוונטי)' : ''}
        
        חשוב: הכתבות חייבות להיות אמיתיות ועדכניות מהיום האחרון!`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            articles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  subtitle: { type: "string" },
                  content: { type: "string" },
                  source: { type: "string" },
                  is_breaking: { type: "boolean" },
                  video_url: { type: "string" },
                  image_search_query: { type: "string" }
                }
              }
            }
          }
        }
      });

      const articles = response.articles || [];
      
      // Add images and category to articles
      const articlesWithDetails = await Promise.all(
        articles.map(async (article) => {
          let image_url = null;
          
          // Generate image if needed
          if (article.image_search_query) {
            try {
              const imageResult = await base44.integrations.Core.GenerateImage({
                prompt: `Professional news photography: ${article.image_search_query}, high quality, photojournalism style, 16:9 aspect ratio`
              });
              image_url = imageResult.url;
            } catch (err) {
              console.error("Failed to generate image:", err);
            }
          }

          return {
            ...article,
            category: category.id,
            image_url,
            is_featured: Math.random() > 0.8
          };
        })
      );

      // Save to database
      if (articlesWithDetails.length > 0) {
        await createArticleMutation.mutateAsync(articlesWithDetails);
      }

      return {
        category: category.label,
        count: articlesWithDetails.length,
        status: "success"
      };
    } catch (error) {
      console.error(`Error loading ${category.label}:`, error);
      return {
        category: category.label,
        count: 0,
        status: "error",
        error: error.message
      };
    }
  };

  const loadAllNews = async () => {
    setLoading(true);
    setProgress(0);
    setResults([]);
    setTotalArticles(0);
    
    const totalCategories = newsCategories.length;
    
    for (let i = 0; i < newsCategories.length; i++) {
      const category = newsCategories[i];
      const result = await loadNewsForCategory(category);
      
      setResults(prev => [...prev, result]);
      setTotalArticles(prev => prev + result.count);
      setProgress(((i + 1) / totalCategories) * 100);
      
      // Small delay between categories to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    setLoading(false);
    setCurrentCategory("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E31E24] to-red-600 flex items-center justify-center shadow-xl">
              <Globe className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            מערכת טעינת חדשות אוטומטית
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            טוען חדשות אמיתיות מכל סוכניות החדשות בעולם - רויטרס, AP, AFP ועוד
            <br />
            כולל וידאו וכתבי שטח
          </p>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                לוח בקרה
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                לחץ לטעינת כל החדשות מכל הקטגוריות
              </p>
            </div>
            <Button
              onClick={loadAllNews}
              disabled={loading}
              size="lg"
              className="bg-[#E31E24] hover:bg-[#B91C1C] text-white px-8 py-6 text-lg font-bold shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  טוען...
                </>
              ) : (
                <>
                  <Radio className="w-5 h-5 ml-2" />
                  טען חדשות חדשות
                </>
              )}
            </Button>
          </div>

          {/* Progress Bar */}
          {loading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {currentCategory}
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Stats */}
          {!loading && totalArticles > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-bold text-green-900 dark:text-green-100">
                    טעינה הושלמה בהצלחה!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    נטענו {totalArticles} כתבות חדשות מ-{results.length} קטגוריות
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Categories Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {newsCategories.map((category, index) => {
              const result = results.find(r => r.category === category.label);
              const isLoading = loading && currentCategory === category.label;
              const isDone = result?.status === "success";
              const isError = result?.status === "error";

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isLoading
                      ? "border-[#E31E24] bg-red-50 dark:bg-red-900/20"
                      : isDone
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : isError
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isLoading && (
                        <Loader2 className="w-5 h-5 text-[#E31E24] animate-spin" />
                      )}
                      {isDone && (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      )}
                      {isError && (
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                      {!isLoading && !isDone && !isError && (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                      )}
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {category.label}
                        </p>
                        {result && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {result.count} כתבות
                          </p>
                        )}
                        {category.includeVideos && (
                          <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mt-1">
                            <Video size={12} />
                            כולל וידאו
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
        >
          <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            איך זה עובד?
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <li>• המערכת מתחברת לאינטרנט ומושכת חדשות אמיתיות מכל העולם</li>
            <li>• משתמשת ב-AI כדי לתרגם ולעצב את החדשות לעברית</li>
            <li>• מחפשת וידאו רלוונטיים מיוטיוב עבור כל כתבה</li>
            <li>• מייצרת תמונות מקצועיות לכל כתבה</li>
            <li>• שומרת הכל במאגר הנתונים לצפייה מיידית</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}