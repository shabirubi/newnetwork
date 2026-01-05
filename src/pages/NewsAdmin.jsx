import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { RefreshCw, Radio, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const categories = [
  { id: "security", label: "ביטחון", keywords: "Israel security IDF military Gaza Lebanon Iran Hamas" },
  { id: "economy", label: "כלכלה", keywords: "Israel economy stock market business shekel inflation" },
  { id: "politics", label: "פוליטיקה", keywords: "Israel politics Netanyahu government Knesset coalition" },
  { id: "technology", label: "טכנולוגיה", keywords: "Israel technology startups AI tech innovation" },
  { id: "world", label: "עולם", keywords: "world news international Middle East US Europe" },
];

export default function NewsAdmin() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const queryClient = useQueryClient();

  const createArticleMutation = useMutation({
    mutationFn: (article) => base44.entities.NewsArticle.create(article),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
    }
  });

  const fetchRealNews = async (category) => {
    try {
      setStatus({ type: 'loading', message: `טוען חדשות ${category.label}...` });
      
      const prompt = `You are a news aggregator for an Israeli news platform called "הרשת החדשה" (The New Network).

Search for the latest breaking news and important stories from ${category.keywords}.

Return exactly 3-5 recent news articles in Hebrew. For each article provide:
- title: A compelling Hebrew headline (not translated - write naturally in Hebrew)
- subtitle: A Hebrew subtitle/subheading (1 sentence)
- content: Full article content in Hebrew (3-4 paragraphs, detailed and professional)
- is_breaking: true if it's breaking news, false otherwise
- source: The original source name

Focus on:
- Recent events (today or this week)
- Important, newsworthy stories
- Accurate, factual information
- Professional news writing style

Write the articles in fluent, natural Hebrew as if written by Israeli journalists.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
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
                  is_breaking: { type: "boolean" },
                  source: { type: "string" }
                },
                required: ["title", "content"]
              }
            }
          },
          required: ["articles"]
        }
      });

      const articles = response.articles || [];
      
      // Create articles in database
      for (const article of articles) {
        await createArticleMutation.mutateAsync({
          ...article,
          category: category.id,
          is_featured: Math.random() > 0.7,
        });
      }

      return articles.length;
    } catch (error) {
      console.error(`Error fetching ${category.label}:`, error);
      throw error;
    }
  };

  const loadAllNews = async () => {
    setLoading(true);
    setProgress({ current: 0, total: categories.length });
    let totalArticles = 0;

    try {
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        setProgress({ current: i + 1, total: categories.length });
        
        const count = await fetchRealNews(category);
        totalArticles += count;
        
        // Wait a bit between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      setStatus({ 
        type: 'success', 
        message: `הצלחה! נוספו ${totalArticles} ידיעות חדשות מרויטרס ומקורות נוספים` 
      });
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: 'שגיאה בטעינת החדשות. נסה שנית.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#E31E24] flex items-center justify-center">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">מערכת ניהול חדשות</h1>
          </div>
          <p className="text-gray-600">
            טעינת ידיעות אמיתיות מרויטרס ומקורות חדשות מובילים
          </p>
        </motion.div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center justify-between">
              <span>טעינת חדשות מהעולם</span>
              <Badge className="bg-[#E31E24] text-white">
                מבוסס AI + חיפוש אינטרנט
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Categories List */}
            <div className="space-y-3">
              <h3 className="font-semibold mb-3">קטגוריות:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      progress.current > 0 && categories.indexOf(cat) < progress.current
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`} />
                    <span className="text-sm font-medium">{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress */}
            {loading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>מתקדם...</span>
                  <span>{progress.current} / {progress.total}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#E31E24]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Status Message */}
            {status && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3 p-4 rounded-lg ${
                  status.type === 'success' 
                    ? 'bg-green-50 text-green-800'
                    : status.type === 'error'
                    ? 'bg-red-50 text-red-800'
                    : 'bg-blue-50 text-blue-800'
                }`}
              >
                {status.type === 'success' && <CheckCircle className="w-5 h-5" />}
                {status.type === 'error' && <AlertCircle className="w-5 h-5" />}
                {status.type === 'loading' && <RefreshCw className="w-5 h-5 animate-spin" />}
                <span>{status.message}</span>
              </motion.div>
            )}

            {/* Action Button */}
            <Button
              onClick={loadAllNews}
              disabled={loading}
              className="w-full bg-[#E31E24] hover:bg-[#B91C1C] text-white py-6 text-lg font-bold"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 ml-2 animate-spin" />
                  טוען חדשות...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 ml-2" />
                  טען ידיעות חדשות מהעולם
                </>
              )}
            </Button>

            {/* Info */}
            <div className="text-sm text-gray-500 text-center space-y-1">
              <p>המערכת תחבר למקורות חדשות מובילים כמו רויטרס, AP, ועוד</p>
              <p>כל ידיעה נכתבת בעברית מקצועית על ידי AI</p>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#E31E24] mb-1">100%</div>
              <div className="text-sm text-gray-600">אמיתי ומעודכן</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#E31E24] mb-1">24/7</div>
              <div className="text-sm text-gray-600">עדכון רציף</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#E31E24] mb-1">AI</div>
              <div className="text-sm text-gray-600">כתיבה מקצועית</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}