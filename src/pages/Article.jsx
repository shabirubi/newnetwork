import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import { 
  Clock, Share2, ChevronRight, AlertTriangle, 
  Facebook, Twitter, MessageCircle, Copy
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import moment from "moment";

import NewsCard from "../components/news/NewsCard";
import CommentsSection from "../components/article/CommentsSection";

const categoryLabels = {
  breaking: "חדשות חמות",
  security: "ביטחון",
  economy: "כלכלה",
  politics: "פוליטיקה",
  technology: "טכנולוגיה",
  sports: "ספורט",
  entertainment: "בידור",
  world: "עולם",
  health: "בריאות"
};

const categoryColors = {
  breaking: "bg-[#E31E24] text-white",
  security: "bg-orange-500 text-white",
  economy: "bg-green-600 text-white",
  politics: "bg-purple-600 text-white",
  technology: "bg-blue-600 text-white",
  sports: "bg-emerald-600 text-white",
  entertainment: "bg-pink-500 text-white",
  world: "bg-indigo-600 text-white",
  health: "bg-teal-600 text-white"
};

export default function Article() {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', articleId],
    queryFn: async () => {
      if (!articleId) return null;
      const articles = await base44.entities.NewsArticle.filter({ id: articleId });
      if (!articles || articles.length === 0) return null;
      return articles[0];
    },
    enabled: !!articleId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    retry: 2
  });

  const { data: relatedArticles = [] } = useQuery({
    queryKey: ['related-articles', article?.category],
    queryFn: () => base44.entities.NewsArticle.filter({ category: article.category }, '-created_date', 4),
    enabled: !!article?.category,
    staleTime: 5 * 60 * 1000,
    initialData: []
  });

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 px-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!articleId) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">לא צוין מזהה כתבה</h2>
        <Link to={createPageUrl("Home")}>
          <Button className="bg-[#E31E24] hover:bg-[#B91C1C]">
            חזרה לדף הבית
          </Button>
        </Link>
      </div>
    );
  }

  if (!article && !isLoading) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">הכתבה לא נמצאה</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">ייתכן שהכתבה הוסרה או שהקישור שגוי</p>
        <Link to={createPageUrl("Home")}>
          <Button className="bg-[#E31E24] hover:bg-[#B91C1C]">
            חזרה לדף הבית
          </Button>
        </Link>
      </div>
    );
  }

  const filteredRelated = relatedArticles.filter(a => a.id !== article.id).slice(0, 3);

  return (
    <article className="max-w-4xl mx-auto px-4">
      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-sm text-gray-500 mb-6"
      >
        <Link to={createPageUrl("Home")} className="hover:text-[#E31E24]">
          ראשי
        </Link>
        <ChevronRight size={16} />
        <Link 
          to={createPageUrl(`Category?cat=${article.category}`)} 
          className="hover:text-[#E31E24]"
        >
          {categoryLabels[article.category]}
        </Link>
      </motion.nav>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          {article.is_breaking && (
            <Badge className="bg-[#E31E24] text-white flex items-center gap-1 animate-pulse">
              <AlertTriangle size={14} />
              חדשות חמות
            </Badge>
          )}
          <Badge className={categoryColors[article.category]}>
            {categoryLabels[article.category]}
          </Badge>
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {article.title}
        </h1>

        {article.subtitle && (
          <p className="text-xl text-gray-600 mb-6">
            {article.subtitle}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b">
          <div className="flex items-center gap-4 text-gray-500 text-sm">
            <span className="flex items-center gap-1">
              <Clock size={16} />
              {moment(article.created_date).format('DD/MM/YYYY HH:mm')}
            </span>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 ml-2">שתפו:</span>
            <Button variant="outline" size="icon" className="rounded-full">
              <Facebook size={18} />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Twitter size={18} />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <MessageCircle size={18} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={copyLink}
            >
              <Copy size={18} />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Featured Image */}
      {article.image_url && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <img 
            src={article.image_url} 
            alt={article.title}
            className="w-full rounded-2xl shadow-lg"
          />
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="prose prose-lg max-w-none mb-12"
      >
        <div className="text-white dark:text-white leading-relaxed text-lg whitespace-pre-wrap">
          {article.content}
        </div>
      </motion.div>

      {/* Video if exists */}
      {article.video_url && (
        <div className="mb-12">
          <h3 className="font-bold text-xl mb-4">צפו בסרטון</h3>
          <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden">
            <iframe 
              src={article.video_url}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="border-t pt-8 mb-12">
        <CommentsSection articleId={article.id} />
      </div>

      {/* Related Articles */}
      {filteredRelated.length > 0 && (
        <section className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">ידיעות נוספות</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredRelated.map((relatedArticle, index) => (
              <NewsCard 
                key={relatedArticle.id} 
                article={relatedArticle}
                index={index}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}