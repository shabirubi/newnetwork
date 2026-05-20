import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Radio, Shield, TrendingUp, Vote, Cpu, 
  Trophy, Clapperboard, Globe, Heart, Flame
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import NewsCard from "../components/news/NewsCard";
import VideosCategoriesStrip from "../components/header/VideosCategoriesStrip";

const categoryConfig = {
  breaking: { 
    label: "חדשות חמות", 
    icon: Flame, 
    color: "bg-[#E31E24]",
    description: "הידיעות החמות והמתעדכנות ביותר"
  },
  security: { 
    label: "ביטחון ומדיניות", 
    icon: Shield, 
    color: "bg-orange-500",
    description: "צה\"ל, פיגועים, החלטות ממשלה, מתיחות ביטחונית, כנסת וחקיקה"
  },
  economy: { 
    label: "כלכלה ועסקים", 
    icon: TrendingUp, 
    color: "bg-green-600",
    description: "עליית מחירים, קניות, בנקים, אוכל, השקעות ונכסים"
  },
  politics: { 
    label: "פוליטיקה ודרמה", 
    icon: Vote, 
    color: "bg-purple-600",
    description: "מאבקי כח, אלימות, פרשות שחיתות, תיקים בתפקיד, סיפורים אנושיים קשים"
  },
  technology: { 
    label: "טכנולוגיה", 
    icon: Cpu, 
    color: "bg-blue-600",
    description: "חדשנות, סטארטאפים, מחשבים, בינה מלאכותית"
  },
  sports: { 
    label: "ספורט", 
    icon: Trophy, 
    color: "bg-emerald-600",
    description: "כדורגל, כדורסל, אתלטיקה ועוד"
  },
  entertainment: { 
    label: "בידור ודרמה", 
    icon: Clapperboard, 
    color: "bg-pink-500",
    description: "סדרות בולשת, אמירה שקומית, טרנדים עולמיים, סיפורי הורים ואישיים"
  },
  world: { 
    label: "חדשות עולם", 
    icon: Globe, 
    color: "bg-indigo-600",
    description: "חדשות מהעולם, דיווחים מהשטח, מהפכות ודרמות בינלאומיות"
  },
  health: { 
    label: "בריאות", 
    icon: Heart, 
    color: "bg-teal-600",
    description: "רפואה, בריאות, חיסונים וחדשות רפואיות"
  }
};

export default function Category() {
  const urlParams = new URLSearchParams(window.location.search);
  const cat = urlParams.get('cat') || 'breaking';

  const config = categoryConfig[cat] || { 
    label: decodeURIComponent(cat), 
    icon: Flame, 
    color: "bg-gray-600",
    description: `ידיעות בקטגוריה: ${decodeURIComponent(cat)}`
  };
  const Icon = config.icon;

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['category-articles', cat],
    queryFn: async () => {
      console.log(`📰 טוען ידיעות עבור קטגוריה: ${cat}`);
      let result;
      if (cat === 'breaking') {
        result = await base44.entities.NewsArticle.filter({ is_breaking: true }, '-created_date', 50);
      } else if (categoryConfig[cat]) {
        // קטגוריה מובנית - חיפוש ישיר
        result = await base44.entities.NewsArticle.filter({ category: cat }, '-created_date', 50);
      } else {
        // קטגוריה מותאמת אישית - חפש לפי custom_category
        const allCustom = await base44.entities.NewsArticle.filter({ category: 'custom' }, '-created_date', 200);
        result = allCustom.filter(a => 
          a.custom_category && a.custom_category.toLowerCase() === cat.toLowerCase()
        );
      }
      console.log(`✅ נטענו ${result.length} ידיעות`);
      return result;
    },
    staleTime: 0,
    refetchInterval: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    initialData: []
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1);

  return (
    <div className="space-y-8">
      {/* Reels Strip */}
      <VideosCategoriesStrip />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${config.color} rounded-2xl p-4 text-white shadow-lg`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold">{config.label}</h1>
            <p className="text-white/80 text-sm">{config.description}</p>
          </div>
          <div className="text-xs text-white/70">
            {articles.length} ידיעות
          </div>
        </div>
      </motion.div>

      {/* Featured Article */}
      {featuredArticle && (
        <section>
          <NewsCard article={featuredArticle} variant="featured" />
        </section>
      )}

      {/* Articles Grid */}
      {otherArticles.length > 0 ? (
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherArticles.map((article, index) => (
              <NewsCard key={article.id} article={article} index={index} />
            ))}
          </div>
        </section>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-transparent dark:border-gray-700">
          <Icon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">אין ידיעות בקטגוריה זו</h3>
          <p className="text-gray-500 dark:text-gray-400">בקרוב יתווספו ידיעות חדשות</p>
        </div>
      )}
    </div>
  );
}