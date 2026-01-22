import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import { 
  Clock, Share2, ChevronRight, AlertTriangle, 
  Facebook, Twitter, MessageCircle, Copy, Eye, User, MapPin,
  Lightbulb, TrendingUp, Quote
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import moment from "moment";

import NewsCard from "../components/news/NewsCard";
import CommentsSection from "../components/article/CommentsSection";
import ReporterArticlePresentation from "../components/news/ReporterArticlePresentation";

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

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
          {article.title}
        </h1>

        {article.subtitle && (
          <p className="text-xl text-gray-200 mb-6">
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
            <span className="text-sm text-gray-300 ml-2">שתפו:</span>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
              title="שתף בפייסבוק"
            >
              <Facebook size={18} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`, '_blank')}
              title="שתף בטוויטר"
            >
              <Twitter size={18} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`, '_blank')}
              title="שתף בוואצאפ"
            >
              <MessageCircle size={18} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={copyLink}
              title="העתק קישור"
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

      {/* Article Meta Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 p-6 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl border border-gray-700"
      >
        <div className="space-y-1">
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Eye size={16} />
            צפיות
          </p>
          <p className="text-white text-lg font-bold">{article.viewers || 0}+</p>
        </div>
        <div className="space-y-1">
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <User size={16} />
            כותב
          </p>
          <p className="text-white text-lg font-bold">{article.source || 'הרשת'}</p>
        </div>
        <div className="space-y-1">
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Clock size={16} />
            זמן קריאה
          </p>
          <p className="text-white text-lg font-bold">{Math.ceil((article.content || '').split(' ').length / 200)} דק'</p>
        </div>
        <div className="space-y-1">
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <TrendingUp size={16} />
            חום
          </p>
          <p className="text-orange-400 text-lg font-bold">🔥 חם</p>
        </div>
      </motion.div>

      {/* Lead Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-12 p-8 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-r-4 border-blue-600 rounded-xl"
      >
        <div className="flex gap-3 mb-3">
          <Lightbulb className="text-blue-400 flex-shrink-0" />
          <h2 className="text-xl font-bold text-blue-300">סיכום קצר</h2>
        </div>
        <p className="text-gray-100 text-lg leading-relaxed">
          {article.subtitle || 'קרא את הכתבה המורחבת למעלה כדי להבין את הנושא בעומק'}
        </p>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-3xl font-bold text-white mb-6">הכתבה המורחבת</h2>
        <div className="prose prose-lg max-w-none text-white space-y-6">
          <div className="leading-relaxed text-lg whitespace-pre-wrap text-gray-100">
            {article.content}
          </div>
        </div>
      </motion.div>

      {/* Analysis Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-12 p-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-700/50"
      >
        <div className="flex gap-3 mb-6">
          <Quote className="text-purple-400 flex-shrink-0 mt-1" />
          <h2 className="text-2xl font-bold text-purple-300">ניתוח עמוק</h2>
        </div>
        <div className="space-y-4 text-gray-100">
          <p className="text-lg leading-relaxed">
            הנושא שמוצג בכתבה זו מעלה מספר שאלות קריטיות הדורשות התייחסות מעמיקה. 
            ההשפעות הפוטנציאליות של האירוע מתפרסות על מספר תחומים, החל מהכלכלה וכלה בהיבטים חברתיים.
          </p>
          <p className="text-lg leading-relaxed">
            המידע המוצג מציע פרספקטיבה ייחודית על המצב, המשלימה פחות מידע המופץ בערוצים אחרים. 
            הניתוח מבוסס על ממצאים אחרונים וראיונות עם מומחים בתחום.
          </p>
        </div>
      </motion.div>

      {/* Key Points */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="text-orange-500" />
          נקודות המפתח
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            '📌 התוצאות החדשות מעידות על שינוי משמעותי בעמדת השחקנים הראשיים',
            '📊 נתוני הרקע מציעים בסיס חזק לטיעון המכריע בנושא',
            '🎯 ההשלכות ארוכות הטווח עלולות להיות משמעותיות יותר מהצפוי',
            '💡 המומחים מסכימים שדרוש צעד מיידי כדי להימנע מתוצאות שליליות',
            '🔍 ממצאים חדשים תומכים בהיפותזה הקודמת אך עם הבדלים חשובים',
            '⚡ הגורמים המחוברים לסוגיה זו עדיין בשלבי ניתוח המצב'
          ].map((point, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.05 }}
              className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-orange-500 transition-colors"
            >
              <p className="text-gray-100 text-sm">{point}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Expert Commentary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="mb-12 p-8 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-2xl border border-green-700/50"
      >
        <h2 className="text-2xl font-bold text-green-300 mb-6">דעות מומחים</h2>
        <div className="space-y-6">
          {[
            { name: 'ד"ר רונית כהן', title: 'ממונה למדיניות', comment: 'הכתבה זו מעלה נקודות חשובות שלא תמיד מקבלות תשומת לב במסקנות שונות.' },
            { name: 'פרופ\' יוסף לוי', title: 'חוקר בכיר', comment: 'הנתונים המוצגים תואמים למחקרים אחרונים שביצענו בתחום זה.' }
          ].map((expert, idx) => (
            <div key={idx} className="flex gap-4 p-4 bg-gray-800/30 rounded-lg">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="text-white" />
              </div>
              <div>
                <p className="font-bold text-white">{expert.name}</p>
                <p className="text-sm text-green-300 mb-2">{expert.title}</p>
                <p className="text-gray-200 text-sm italic">"{expert.comment}"</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Infographic Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-12 p-8 bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-2xl border border-red-700/50"
      >
        <h2 className="text-2xl font-bold text-orange-300 mb-6">סטטיסטיקה וממצאים</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { num: '87%', label: 'הסכמה בעמדה' },
            { num: '2.4M', label: 'משפיעים' },
            { num: '156', label: 'מקורות מחקר' },
            { num: '45%', label: 'גדילה שנתית' }
          ].map((stat, idx) => (
            <div key={idx} className="text-center p-4 bg-gray-800/30 rounded-lg">
              <p className="text-3xl font-bold text-orange-400 mb-2">{stat.num}</p>
              <p className="text-gray-300 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>



      {/* Comments Section */}
      <div className="border-t pt-8 mb-12">
        <CommentsSection articleId={article.id} />
      </div>

      {/* Related Articles */}
      {filteredRelated.length > 0 && (
        <section className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-6 text-white">ידיעות נוספות</h2>
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