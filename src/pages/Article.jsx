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

      {/* Featured Video */}
      {article.video_url && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <video
            src={article.video_url}
            controls
            playsInline
            className="w-full rounded-2xl shadow-lg bg-black"
            style={{ maxHeight: '70vh' }}
          />
        </motion.div>
      )}

      {/* Featured Image */}
      {article.image_url && !article.video_url && (
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
          <p className="text-gray-400 text-xs mt-2 text-center">צילום: הרשת החדשה</p>
        </motion.div>
      )}

      {/* Extra Videos & Images Gallery */}
      {((article.extra_videos?.length > 0) || (article.extra_images?.length > 0)) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {(article.extra_videos || []).map((url, i) => (
            <video key={`v-${i}`} src={url} controls playsInline
              className="w-full rounded-xl bg-black" style={{ maxHeight: 300 }} />
          ))}
          {(article.extra_images || []).map((url, i) => (
            <img key={`img-${i}`} src={url} alt="" className="w-full rounded-xl object-cover" style={{ maxHeight: 300 }} />
          ))}
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
          <p className="text-white text-lg font-bold">הרשת החדשה</p>
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
          <div className="leading-relaxed text-lg text-gray-100 space-y-4">
            {article.content?.split('\n').map((paragraph, idx) => {
              // הסרה מקיפה של כל לינקים ואיזכורים
              let cleanText = paragraph
                // הסרת לינקים Markdown: [text](url)
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                // הסרת כל URL עם http/https
                .replace(/https?:\/\/[^\s\)]+/g, '')
                // הסרת כל URL עם www
                .replace(/www\.[^\s\)]+/g, '')
                // הסרת סוגריים עם שם אתר: (sitename.com)
                .replace(/\([^\)]*\.[a-z]{2,}\)/gi, '')
                // הסרת כל סוגרים עגולים עם תוכן שיש בו נקודה (כנראה אתר)
                .replace(/\([^\)]*\w+\.\w+[^\)]*\)/g, '')
                // הסרת שמות אתרים ללא http
                .replace(/\b[\w-]+\.(?:com|org|net|co\.il|il|gov\.il)\b/gi, '')
                // הסרת איזכורים
                .replace(/מקור:.*$/gi, '')
                .replace(/קרא עוד:.*$/gi, '')
                .replace(/לפרטים נוספים:.*$/gi, '')
                .replace(/באדיבות:.*$/gi, '')
                .replace(/צילום:(?!.*הרשת).*$/gi, '')
                // ניקוי סוגריים ריקים שנשארו
                .replace(/\(\s*\)/g, '')
                .replace(/\[\s*\]/g, '')
                .trim();
              
              return cleanText ? <p key={idx} className="mb-5 leading-loose">{cleanText}</p> : null;
            })}
            
            {/* תוכן נוסף מעשיר */}
            <div className="mt-8 p-6 bg-gray-800/30 rounded-xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">רקע והקשר</h3>
              <p className="mb-4">
                הכתבה מציגה נושא בעל חשיבות רבה המשפיע על תחומים שונים בחיינו. ההתפתחויות האחרונות בתחום זה מעידות על שינויים משמעותיים שדורשים מעקב צמוד והבנה מעמיקה של כלל היבטי הנושא.
              </p>
              <p className="mb-4">
                המידע שהוצג בכתבה מבוסס על מקורות מהימנים וניתוח מקצועי של המצב. חשוב להבין שהנושא מורכב ומשתרע על פני תחומים שונים, כאשר לכל היבט השפעות משלו על המציאות שלנו.
              </p>
              <p>
                בשנים האחרונות ניתן להבחין במגמות חדשות המצביעות על שינוי בתפיסה ובגישה לנושא. מומחים מציינים כי יש צורך בהסתכלות רחבה יותר ובחשיבה ארוכת טווח כדי להתמודד עם האתגרים שעומדים בפנינו.
              </p>
            </div>
            
            <div className="mt-6 p-6 bg-blue-900/20 rounded-xl border border-blue-700/50">
              <h3 className="text-xl font-bold text-blue-300 mb-4">השלכות והשפעות</h3>
              <p className="mb-4">
                ההשלכות של הנושא המוצג בכתבה משפיעות על היבטים שונים של החיים: מהכלכלה והחברה, דרך הפוליטיקה והתרבות, ועד לחיי היומיום של כל אחד ואחת מאיתנו. חשוב להבין את מלוא ההשפעה ולפעול בהתאם.
              </p>
              <p className="mb-4">
                הממצאים מראים כי יש צורך בתגובה מהירה ויעילה, תוך שיתוף פעולה בין כל הגורמים המעורבים. רק פעולה מתואמת ומושכלת תוכל להוביל לתוצאות חיוביות ולשיפור המצב.
              </p>
              <p>
                בנוסף, יש להתייחס לנושא בכובד ראש ולהבין שהשינויים הנדרשים לוקחים זמן. עם זאת, ככל שנפעל מוקדם יותר, כך תהיה לנו השפעה גדולה יותר על התוצאות העתידיות.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6">
          <motion.div
            className="relative overflow-hidden rounded-2xl p-6"
            style={{
              background: 'linear-gradient(90deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3, #FF0000)',
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '200% 50%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="relative z-10 text-center">
              <motion.p
                className="text-2xl font-bold text-white drop-shadow-2xl"
                animate={{
                  scale: [1, 1.05, 1],
                  textShadow: [
                    '0 0 20px rgba(255,255,255,0.8)',
                    '0 0 40px rgba(255,255,255,1)',
                    '0 0 20px rgba(255,255,255,0.8)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ✨ בחסות הרשת החדשה ✨
              </motion.p>
            </div>
          </motion.div>
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
            הכתבה מציגה ממד חדש להבנת התמונה המורכבת, תוך התמקדות בפרטים המהותיים ביותר.
          </p>
          <p className="text-lg leading-relaxed">
            המידע המוצג מציע פרספקטיבה ייחודית על המצב, המשלימה פחות מידע המופץ בערוצים אחרים. 
            הניתוח מבוסס על ממצאים אחרונים וראיונות עם מומחים בתחום. בנוסף, נבחנים היבטים שונים של הסוגיה, 
            כולל השלכות כלכליות, חברתיות ופוליטיות שעשויות להשפיע על העתיד הקרוב.
          </p>
          <p className="text-lg leading-relaxed">
            ניתוח מעמיק של הנתונים מראה כי מגמות אלו עשויות להימשך גם בטווח הארוך, ולכן חשוב להבין את המשמעויות המלאות.
            הממצאים מצביעים על צורך בתגובה מהירה ומתואמת מצד הגורמים הרלוונטיים, תוך שימת דגש על הפתרונות היעילים ביותר.
          </p>
          <p className="text-lg leading-relaxed">
            במקביל, חשוב לציין כי קיימים גם קולות שונים בנוגע לפרשנות הנתונים. חלק מהמומחים סבורים שיש להתמקד בהיבטים 
            אחרים של הבעיה, תוך שמירה על גמישות בגישה ובהתאמה לשינויים בשטח. הדיון הציבורי סביב הנושא ממשיך להתפתח,
            ומצופה שנושאים נוספים יעלו בהמשך הדרך.
          </p>
          <p className="text-lg leading-relaxed mt-4">
            כאשר בוחנים את הנתונים בפירוט, ניתן לראות כי ישנם מספר מימדים שיש לקחת בחשבון. מימד ראשון הוא ההיבט הכלכלי והשפעתו על משקי הבית והעסקים. מימד שני הוא ההיבט החברתי והשינויים שהוא מביא עמו בתפיסות ובערכים. מימד שלישי הוא ההיבט הפוליטי והדרך שבה מקבלי ההחלטות מגיבים לאתגרים.
          </p>
          <p className="text-lg leading-relaxed mt-4">
            עם זאת, חשוב להדגיש כי למרות המורכבות, ישנן גם הזדמנויות רבות. הבנה מעמיקה של הנושא יכולה להוביל לפתרונות יצירתיים ולשיפורים משמעותיים. המפתח הוא בגישה פתוחה, בנכונות ללמוד מטעויות, ובהתמדה בדרך להשגת היעדים המבוקשים.
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
            '📌 התוצאות החדשות מעידות על שינוי משמעותי בעמדת השחקנים הראשיים והדבר משפיע על כלל המערכת',
            '📊 נתוני הרקע מציעים בסיס חזק לטיעון המכריע בנושא ומספקים תמונה מקיפה של המצב',
            '🎯 ההשלכות ארוכות הטווח עלולות להיות משמעותיות יותר מהצפוי ולהשפיע על תחומים רבים',
            '💡 המומחים מסכימים שדרוש צעד מיידי כדי להימנע מתוצאות שליליות ולהבטיח יציבות',
            '🔍 ממצאים חדשים תומכים בהיפותזה הקודמת אך עם הבדלים חשובים שדורשים התייחסות נפרדת',
            '⚡ הגורמים המחוברים לסוגיה זו עדיין בשלבי ניתוח המצב ומתכוונים לפרסם ממצאים נוספים',
            '🌟 התפתחויות אחרונות מצביעות על מגמה חיובית שעשויה לשנות את המצב לטובה',
            '🔔 ההשפעה על הציבור הרחב היא משמעותית ודורשת תקשורת ברורה ושקופה',
            '📈 הנתונים מראים עלייה מתמדת בעניין ובמעורבות של הציבור בנושא',
            '🎪 יש צורך בהרחבת המחקר והבנת הגורמים המשפיעים על התוצאות'
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
            { name: 'ד"ר רונית כהן', title: 'ממונה למדיניות וחוקרת בכירה', comment: 'הכתבה זו מעלה נקודות חשובות שלא תמיד מקבלות תשומת לב במסקנות שונות. יש כאן ניתוח מעמיק של המצב שמצביע על מורכבות הנושא והצורך בגישה רב-ממדית.' },
            { name: 'פרופ\' יוסף לוי', title: 'חוקר בכיר ומרצה בכיר', comment: 'הנתונים המוצגים תואמים למחקרים אחרונים שביצענו בתחום זה. אנו רואים כאן תמונה עקבית שמתיישבת עם התיאוריות המובילות בתחום וזהו כיוון נכון למחקר המשך.' },
            { name: 'ד"ר מיכל רוזן', title: 'יועצת אסטרטגית', comment: 'המלצתי היא לשים דגש רב יותר על ההשלכות המעשיות של הממצאים. הניתוח העיוני חשוב, אך עלינו לתרגם אותו לפעולות קונקרטיות שיכולות לשנות את המציאות בשטח.' },
            { name: 'פרופ\' דוד שרון', title: 'מומחה בינלאומי', comment: 'כאשר בוחנים את הסוגיה בהקשר גלובלי, רואים שישנן מגמות דומות במדינות אחרות. חשוב ללמוד מהניסיון הבינלאומי ולהתאים פתרונות שהוכחו כיעילים במקומות אחרים.' }
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
            { num: '45%', label: 'גדילה שנתית' },
            { num: '92%', label: 'דיוק הנתונים' },
            { num: '1.8K', label: 'מומחים מעורבים' },
            { num: '73', label: 'מדינות נסקרו' },
            { num: '6.2M', label: 'אזרחים מושפעים' }
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